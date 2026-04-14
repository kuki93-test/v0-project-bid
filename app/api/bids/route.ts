import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (user.user_metadata?.role !== "buyer") {
    return NextResponse.json({ error: "Only buyer accounts can place bids" }, { status: 403 })
  }

  // Check email and phone verification
  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified, phone_verified")
    .eq("id", user.id)
    .single()

  if (!profile?.email_verified || !profile?.phone_verified) {
    const missing = []
    if (!profile?.email_verified) missing.push("email")
    if (!profile?.phone_verified) missing.push("phone number")
    return NextResponse.json(
      { error: `Please verify your ${missing.join(" and ")} before placing bids. Go to Dashboard > Profile to verify.` },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { listingId, amount } = body

  if (!listingId || !amount || typeof amount !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // Fetch the listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, listing_type, starting_price, current_bid, buy_now_price, status, auction_end, bid_count")
    .eq("id", listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  // Validations
  if (listing.status !== "active") {
    return NextResponse.json({ error: "This listing is no longer active" }, { status: 400 })
  }

  if (new Date(listing.auction_end) < new Date()) {
    return NextResponse.json({ error: "This auction has ended" }, { status: 400 })
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: "You cannot bid on your own listing" }, { status: 400 })
  }

  if (listing.listing_type === "buy_now") {
    return NextResponse.json({ error: "This listing does not accept bids" }, { status: 400 })
  }

  const currentPrice = listing.current_bid || listing.starting_price
  const minBid = currentPrice + 100 // At least $1 more

  if (amount < minBid) {
    return NextResponse.json(
      { error: `Bid must be at least $${(minBid / 100).toFixed(2)}` },
      { status: 400 }
    )
  }

  // Check if bid meets or exceeds buy_now_price (auto-confirm)
  const isBuyNowMatch =
    listing.buy_now_price &&
    (listing.listing_type === "auction" || listing.listing_type === "both") &&
    amount >= listing.buy_now_price

  // Insert bid
  const { error: bidError } = await supabase
    .from("bids")
    .insert({
      listing_id: listingId,
      bidder_id: user.id,
      amount,
    })

  if (bidError) {
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }

  if (isBuyNowMatch) {
    // Auto-confirm: mark listing as sold with winner
    await supabase
      .from("listings")
      .update({
        current_bid: amount,
        bid_count: (listing.bid_count ?? 0) + 1,
        status: "sold",
        winner_id: user.id,
      })
      .eq("id", listingId)

    // Record transaction
    const settings = await getSettings()
    const taxAmount = Math.round(amount * (settings.tax_rate / 100))
    const commissionAmount = Math.round(amount * (settings.commission_rate / 100))

    await supabase.from("transactions").insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      amount,
      buyer_commission: taxAmount + commissionAmount,
      seller_commission: 0,
      status: "completed",
    })

    // Send notification to seller
    await fetch(new URL("/api/notifications/send", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: listing.seller_id,
        type: "sale_confirmed",
        listingId,
        message: `Your item has been sold! A bid of ${(amount / 100).toFixed(2)} matched the Buy Now price.`,
      }),
    })

    return NextResponse.json({ success: true, amount, autoConfirmed: true })
  }

  // Regular bid update
  const { error: updateError } = await supabase
    .from("listings")
    .update({
      current_bid: amount,
      bid_count: (listing.bid_count ?? 0) + 1,
    })
    .eq("id", listingId)

  if (updateError) {
    return NextResponse.json({ error: "Bid placed but failed to update listing" }, { status: 500 })
  }

  return NextResponse.json({ success: true, amount, autoConfirmed: false })
}
