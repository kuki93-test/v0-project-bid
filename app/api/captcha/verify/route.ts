import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing token" }, { status: 400 })
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY environment variable is not set")
    return NextResponse.json({ success: false, error: "CAPTCHA not configured" }, { status: 500 })
  }

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  })

  const data = await res.json()

  if (data.success) {
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, error: "CAPTCHA verification failed" }, { status: 400 })
}
