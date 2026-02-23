import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.payment_status === "paid" && session.metadata) {
      const supabase = await createClient()

      const {
        listing_id,
        buyer_id,
        seller_id,
        item_price,
        buyer_fee,
        seller_fee,
        total_amount,
      } = session.metadata

      // Create transaction record
      await supabase.from("transactions").insert({
        listing_id,
        buyer_id,
        seller_id,
        amount: parseInt(item_price),
        buyer_fee: parseInt(buyer_fee),
        seller_fee: parseInt(seller_fee),
        total_amount: parseInt(total_amount),
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string,
        status: "completed",
      })

      // Update listing status to sold
      await supabase
        .from("listings")
        .update({ status: "sold" })
        .eq("id", listing_id)
    }
  }

  return NextResponse.json({ received: true })
}
