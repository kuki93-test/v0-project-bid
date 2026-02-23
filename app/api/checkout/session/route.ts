import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID required" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    return NextResponse.json({ clientSecret: session.client_secret, status: session.status })
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 })
  }
}
