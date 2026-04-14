import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed" 
      }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB" 
      }, { status: 400 })
    }

    // Upload to private Vercel Blob storage
    const blob = await put(`company-docs/${user.id}/${Date.now()}-${file.name}`, file, {
      access: "private",
    })

    // Return pathname for private blob access
    return NextResponse.json({ 
      pathname: blob.pathname,
      url: blob.url,
    })
  } catch (error) {
    console.error("[Willbieten] Company doc upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
