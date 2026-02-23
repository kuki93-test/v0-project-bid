import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (user.user_metadata?.role !== "buyer") {
    return NextResponse.json({ error: "Only buyer accounts can place bids" }, { status: 403 })
  }

  const body = await request.json()
  const { listingId, amount } = body

  if (!listingId || !amount || typeof amount !== "number") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // Fetch the listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, listing_type, starting_price, current_bid, status, end_time")
    .eq("id", listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  // Validations
  if (listing.status !== "active") {
    return NextResponse.json({ error: "This listing is no longer active" }, { status: 400 })
  }

  if (new Date(listing.end_time) < new Date()) {
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

  // Update listing current_bid and bid_count
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

  return NextResponse.json({ success: true, amount })
}
