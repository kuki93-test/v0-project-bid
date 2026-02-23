import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { listingId } = await request.json()

  if (!listingId) {
    return NextResponse.json({ error: "Missing listing ID" }, { status: 400 })
  }

  // Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, seller_id, title, status, current_bid, starting_price, bid_count, listing_type")
    .eq("id", listingId)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 })
  }

  // Only the seller can end early
  if (listing.seller_id !== user.id) {
    return NextResponse.json({ error: "Only the seller can end an auction early" }, { status: 403 })
  }

  if (listing.status !== "active") {
    return NextResponse.json({ error: "This listing is not active" }, { status: 400 })
  }

  if (listing.listing_type === "buy_now") {
    return NextResponse.json({ error: "Buy Now listings cannot be ended early" }, { status: 400 })
  }

  const settings = await getSettings()
  const earlyEndFeePct = settings.early_end_fee_pct
  const currentPrice = listing.current_bid || listing.starting_price
  const earlyEndFee = Math.round(currentPrice * (earlyEndFeePct / 100))

  // If there are bids, sell to the highest bidder
  if (listing.bid_count > 0 && listing.current_bid) {
    // Find the highest bidder
    const { data: highestBid } = await supabase
      .from("bids")
      .select("bidder_id, amount")
      .eq("listing_id", listingId)
      .order("amount", { ascending: false })
      .limit(1)
      .single()

    if (highestBid) {
      const sellerFee = Math.round(listing.current_bid * (settings.seller_commission_rate / 100))
      const buyerFee = Math.round(listing.current_bid * (settings.buyer_commission_rate / 100))

      await supabase
        .from("listings")
        .update({
          status: "ended_early",
          winner_id: highestBid.bidder_id,
        })
        .eq("id", listingId)

      // Record transaction with early end fee added to seller commission
      await supabase.from("transactions").insert({
        listing_id: listingId,
        buyer_id: highestBid.bidder_id,
        seller_id: user.id,
        amount: listing.current_bid,
        buyer_commission: buyerFee,
        seller_commission: sellerFee + earlyEndFee,
        status: "completed",
      })

      // Notify the winner
      await fetch(new URL("/api/notifications/send", request.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: highestBid.bidder_id,
          type: "auction_won",
          listingId,
          message: `You won the auction for "${listing.title}"! The seller ended the auction early.`,
        }),
      })

      return NextResponse.json({
        success: true,
        hasBids: true,
        winnerId: highestBid.bidder_id,
        earlyEndFee,
        earlyEndFeePct,
      })
    }
  }

  // No bids -- just end the listing
  await supabase
    .from("listings")
    .update({ status: "ended_early" })
    .eq("id", listingId)

  return NextResponse.json({
    success: true,
    hasBids: false,
    earlyEndFee: 0,
    earlyEndFeePct,
  })
}
