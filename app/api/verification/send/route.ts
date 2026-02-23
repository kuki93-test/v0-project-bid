import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { type } = body as { type: "email" | "phone" }

  if (type !== "email" && type !== "phone") {
    return NextResponse.json({ error: "Invalid verification type" }, { status: 400 })
  }

  // Check if already verified
  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified, phone_verified, phone")
    .eq("id", user.id)
    .single()

  if (type === "email" && profile?.email_verified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
  }
  if (type === "phone" && profile?.phone_verified) {
    return NextResponse.json({ error: "Phone is already verified" }, { status: 400 })
  }

  // For phone verification, ensure a phone number exists
  if (type === "phone" && !profile?.phone) {
    return NextResponse.json({ error: "Please add a phone number to your profile first" }, { status: 400 })
  }

  // Invalidate any existing codes for this user/type
  await supabase
    .from("verification_codes")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("type", type)
    .eq("used", false)

  // Generate new OTP
  const code = generateOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  const { error: insertError } = await supabase
    .from("verification_codes")
    .insert({
      user_id: user.id,
      type,
      code,
      expires_at: expiresAt.toISOString(),
    })

  if (insertError) {
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }

  // In production, send via email/SMS service (SendGrid, Twilio, etc.)
  // For now, we simulate sending and return a hint for dev purposes
  const destination = type === "email" ? user.email : profile?.phone

  // Log OTP for development (remove in production)
  console.log(`[BidVault] OTP for ${type} (${destination}): ${code}`)

  return NextResponse.json({
    success: true,
    message: type === "email"
      ? `Verification code sent to ${user.email}`
      : `Verification code sent to ${profile?.phone}`,
    // ONLY include in dev mode - remove in production
    ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
  })
}
