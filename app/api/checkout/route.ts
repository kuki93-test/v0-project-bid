import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { getSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (user.user_metadata?.role !== "buyer") {
    return NextResponse.json({ error: "Only buyer accounts can purchase items" }, { status: 403 })
  }

  // Check email and phone verification
  const { data: buyerProfile } = await supabase
    .from("profiles")
    .select("email_verified, phone_verified")
    .eq("id", user.id)
    .single()

  if (!buyerProfile?.email_verified || !buyerProfile?.phone_verified) {
    const missing = []
    if (!buyerProfile?.email_verified) missing.push("email")
    if (!buyerProfile?.phone_verified) missing.push("phone number")
    return NextResponse.json(
      { error: `Please verify your ${missing.join(" and ")} before making purchases. Go to Dashboard > Profile to verify.` },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { listingId, type } = body

  if (!listingId) {
    return NextResponse.json({ error: "Listing ID is required" }, { status: 400 })
  }

  // Get listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  // For auction wins, the listing is already sold/ended_early - verify the winner
  if (type === "auction_win") {
    if (!["sold", "ended_early"].includes(listing.status)) {
      return NextResponse.json({ error: "This listing is not eligible for payment" }, { status: 400 })
    }
    if (listing.winner_id !== user.id) {
      return NextResponse.json({ error: "You are not the winner of this auction" }, { status: 403 })
    }
  } else if (listing.status !== "active") {
    return NextResponse.json({ error: "This listing is no longer available" }, { status: 400 })
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: "You cannot buy your own listing" }, { status: 400 })
  }

  // Get platform settings
  const settings = await getSettings()

  const buyerCommissionPct = settings.buyer_commission_rate
  const sellerCommissionPct = settings.seller_commission_rate

  // Determine price based on type
  let itemPrice: number
  if (type === "buy_now") {
    if (!listing.buy_now_price) {
      return NextResponse.json({ error: "This listing does not have a buy now price" }, { status: 400 })
    }
    itemPrice = listing.buy_now_price
  } else if (type === "auction_win") {
    // Won auction - use current bid (the winning price)
    itemPrice = listing.current_bid || listing.starting_price
  } else {
    // Generic auction payment
    itemPrice = listing.current_bid || listing.starting_price
  }

  const buyerFee = Math.round(itemPrice * (buyerCommissionPct / 100))
  const sellerFee = Math.round(itemPrice * (sellerCommissionPct / 100))
  const totalAmount = itemPrice + buyerFee

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    ui_mode: "embedded",
    line_items: [
      {
        price_data: {
          currency: settings.platform_currency.toLowerCase(),
          product_data: {
            name: listing.title,
            description: `Auction item - ${listing.condition} condition`,
          },
          unit_amount: itemPrice,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: settings.platform_currency.toLowerCase(),
          product_data: {
            name: `Buyer Commission (${buyerCommissionPct}%)`,
            description: "Platform service fee",
          },
          unit_amount: buyerFee,
        },
        quantity: 1,
      },
    ],
    metadata: {
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      item_price: itemPrice.toString(),
      buyer_fee: buyerFee.toString(),
      seller_fee: sellerFee.toString(),
      total_amount: totalAmount.toString(),
      purchase_type: type,
    },
    return_url: `${request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  return NextResponse.json({ sessionId: session.id, clientSecret: session.client_secret })
}
