import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body = await request.json()
  const { userId, type, listingId, message } = body

  if (!userId || !type || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Get user profile and email
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email:id")
    .eq("id", userId)
    .single()

  // Store notification in DB (we'll query this in the dashboard)
  // For now, log it. In production, integrate with SendGrid/Resend for email
  console.log(`[BidVault Notification] To: ${userId} (${profile?.display_name})`)
  console.log(`[BidVault Notification] Type: ${type}`)
  console.log(`[BidVault Notification] Listing: ${listingId}`)
  console.log(`[BidVault Notification] Message: ${message}`)

  // Insert notification record
  // We'll create a simple notifications approach using the existing schema
  // For email: In production, call your email service here (Resend, SendGrid, etc.)

  return NextResponse.json({ success: true })
}
