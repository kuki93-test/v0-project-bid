import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

// Helper: get or create a Stripe customer for the user
async function getOrCreateStripeCustomer(userId: string, email: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, display_name")
    .eq("id", userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: profile?.display_name || undefined,
    metadata: { supabase_user_id: userId },
  })

  // Store in DB
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId)

  return customer.id
}

// GET: List payment methods
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const customerId = await getOrCreateStripeCustomer(user.id, user.email || "")

  const methods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  })

  // Get the default payment method
  const customer = await stripe.customers.retrieve(customerId)
  const defaultMethodId = typeof customer !== "string" && !customer.deleted
    ? (customer.invoice_settings?.default_payment_method as string | null)
    : null

  const cards = methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand || "unknown",
    last4: pm.card?.last4 || "****",
    expMonth: pm.card?.exp_month || 0,
    expYear: pm.card?.exp_year || 0,
    isDefault: pm.id === defaultMethodId,
  }))

  return NextResponse.json({ cards, customerId })
}

// POST: Create a SetupIntent for adding a new card
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const customerId = await getOrCreateStripeCustomer(user.id, user.email || "")

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  })

  return NextResponse.json({
    clientSecret: setupIntent.client_secret,
  })
}

// DELETE: Remove a payment method
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { paymentMethodId } = await request.json()
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Missing paymentMethodId" }, { status: 400 })
  }

  // Verify the payment method belongs to this user's Stripe customer
  const customerId = await getOrCreateStripeCustomer(user.id, user.email || "")
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
  if (pm.customer !== customerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await stripe.paymentMethods.detach(paymentMethodId)
  return NextResponse.json({ success: true })
}

// PATCH: Set a payment method as default
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { paymentMethodId } = await request.json()
  if (!paymentMethodId) {
    return NextResponse.json({ error: "Missing paymentMethodId" }, { status: 400 })
  }

  const customerId = await getOrCreateStripeCustomer(user.id, user.email || "")
  const pm = await stripe.paymentMethods.retrieve(paymentMethodId)
  if (pm.customer !== customerId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  })

  return NextResponse.json({ success: true })
}
