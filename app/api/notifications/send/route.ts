import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { userId, type, listingId, message, title: notifTitle } = body

  if (!userId || !type || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Store notification in the notifications table
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    listing_id: listingId || null,
    title: notifTitle || getDefaultTitle(type),
    message,
    is_read: false,
    data: { type, listingId },
  })

  if (error) {
    console.error("[Willbieten Notification] Insert error:", error)
    return NextResponse.json({ error: "Failed to store notification" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

function getDefaultTitle(type: string): string {
  switch (type) {
    case "auction_won": return "You won an auction!"
    case "auction_lost": return "Auction ended"
    case "sale_confirmed": return "Your item was sold!"
    case "bid_placed": return "New bid on your listing"
    case "auction_ended_early": return "Auction ended early"
    default: return "Notification"
  }
}
