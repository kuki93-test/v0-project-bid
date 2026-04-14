import { NextRequest, NextResponse } from "next/server"

// SWIFT/BIC code validation
// Format: 4 letters (bank code) + 2 letters (country code) + 2 alphanumeric (location) + optional 3 alphanumeric (branch)
const SWIFT_REGEX = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/

// Austrian bank SWIFT codes must start with AT country code
const AUSTRIAN_SWIFT_REGEX = /^[A-Z]{4}AT[A-Z0-9]{2}([A-Z0-9]{3})?$/

export async function POST(request: NextRequest) {
  try {
    const { swiftCode } = await request.json()

    if (!swiftCode || typeof swiftCode !== "string") {
      return NextResponse.json({ valid: false, error: "SWIFT code is required" }, { status: 400 })
    }

    const normalized = swiftCode.toUpperCase().replace(/\s/g, "")

    // Basic format validation
    if (!SWIFT_REGEX.test(normalized)) {
      return NextResponse.json({ 
        valid: false, 
        error: "Invalid SWIFT/BIC format. Must be 8 or 11 characters (e.g., BKAUATWW or BKAUATWWXXX)" 
      })
    }

    // Check if it's an Austrian bank (country code AT)
    if (!AUSTRIAN_SWIFT_REGEX.test(normalized)) {
      return NextResponse.json({ 
        valid: false, 
        error: "SWIFT code must be from an Austrian bank (country code AT)" 
      })
    }

    // In production, you would validate against a real SWIFT/BIC database API
    // For now, we validate the format and Austrian country code
    // Common Austrian bank SWIFT prefixes for reference:
    // BKAUATWW - Bank Austria
    // GIBAATWW - Erste Bank
    // RLNWATWW - Raiffeisen
    // OBKLAT2L - Oberbank
    // VABORATWW - BAWAG

    return NextResponse.json({ 
      valid: true, 
      normalized,
      message: "SWIFT code format is valid for an Austrian bank"
    })
  } catch (error) {
    console.error("[Willbieten] SWIFT validation error:", error)
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 })
  }
}
