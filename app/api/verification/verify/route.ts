import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const body = await request.json()
  const { type, code } = body as { type: "email" | "phone"; code: string }

  if (type !== "email" && type !== "phone") {
    return NextResponse.json({ error: "Invalid verification type" }, { status: 400 })
  }

  if (!code || code.length !== 6) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 })
  }

  // Look up the latest unused code for this user/type
  const { data: verificationCode, error: lookupError } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", type)
    .eq("code", code)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (lookupError || !verificationCode) {
    return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 400 })
  }

  // Mark code as used
  await supabase
    .from("verification_codes")
    .update({ used: true })
    .eq("id", verificationCode.id)

  // Update profile verification status
  const updateField = type === "email" ? { email_verified: true } : { phone_verified: true }
  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateField)
    .eq("id", user.id)

  if (updateError) {
    return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: `${type === "email" ? "Email" : "Phone number"} verified successfully`,
  })
}
