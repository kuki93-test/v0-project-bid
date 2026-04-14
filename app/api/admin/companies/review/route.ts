import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminEmail } from "@/lib/admin"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only @willbieten.net email addresses have admin access
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { userId, action, reason } = body as { 
    userId: string
    action: "approve" | "reject"
    reason?: string 
  }

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  if (action === "reject" && !reason?.trim()) {
    return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
  }

  // Get the company profile
  const { data: companyProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .eq("account_type", "company")
    .single()

  if (fetchError || !companyProfile) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  if (companyProfile.company_status !== "pending") {
    return NextResponse.json({ error: "Application has already been reviewed" }, { status: 400 })
  }

  // Update the company status
  const now = new Date().toISOString()
  const updateData = action === "approve" 
    ? {
        company_status: "approved",
        company_reviewed_at: now,
        company_reviewed_by: user.id,
      }
    : {
        company_status: "rejected",
        company_rejection_reason: reason,
        company_reviewed_at: now,
        company_reviewed_by: user.id,
      }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)

  if (updateError) {
    console.error("[Willbieten] Company review update error:", updateError)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }

  // TODO: Send email notification to the company
  // You would integrate with your email service here (e.g., Resend, SendGrid)

  return NextResponse.json({
    success: true,
    message: action === "approve" 
      ? "Company application approved successfully" 
      : "Company application rejected",
  })
}
