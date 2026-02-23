"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { Loader2, CheckCircle2, Mail, Phone, ShieldAlert } from "lucide-react"
import { PaymentMethods } from "@/components/dashboard/payment-methods"

interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  phone_verified: boolean
  email_verified: boolean
  role: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")

  // OTP state for email
  const [emailOtpMode, setEmailOtpMode] = useState(false)
  const [emailOtp, setEmailOtp] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailVerifying, setEmailVerifying] = useState(false)
  const [emailCooldown, setEmailCooldown] = useState(0)
  const [emailDevCode, setEmailDevCode] = useState<string | null>(null)

  // OTP state for phone
  const [phoneOtpMode, setPhoneOtpMode] = useState(false)
  const [phoneOtp, setPhoneOtp] = useState("")
  const [phoneSending, setPhoneSending] = useState(false)
  const [phoneVerifying, setPhoneVerifying] = useState(false)
  const [phoneCooldown, setPhoneCooldown] = useState(0)
  const [phoneDevCode, setPhoneDevCode] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setEmail(user.email || "")

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || "")
        setPhone(data.phone || "")
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown <= 0) return
    const t = setTimeout(() => setEmailCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [emailCooldown])

  useEffect(() => {
    if (phoneCooldown <= 0) return
    const t = setTimeout(() => setPhoneCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phoneCooldown])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const phoneChanged = phone !== (profile.phone || "")

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        phone,
        // If phone number changes, reset phone_verified
        ...(phoneChanged ? { phone_verified: false } : {}),
      })
      .eq("id", profile.id)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile updated")
      if (phoneChanged) {
        setProfile((p) => p ? { ...p, phone, phone_verified: false, display_name: displayName } : null)
        setPhoneOtpMode(false)
        setPhoneOtp("")
      } else {
        setProfile((p) => p ? { ...p, display_name: displayName, phone } : null)
      }
    }
    setSaving(false)
  }

  const handleSendOtp = async (type: "email" | "phone") => {
    const setSending = type === "email" ? setEmailSending : setPhoneSending
    const setCooldown = type === "email" ? setEmailCooldown : setPhoneCooldown
    const setDevCode = type === "email" ? setEmailDevCode : setPhoneDevCode

    setSending(true)
    setDevCode(null)
    try {
      const res = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send code")
      toast.success(data.message)
      setCooldown(60)
      if (data.devCode) setDevCode(data.devCode)

      if (type === "email") setEmailOtpMode(true)
      else setPhoneOtpMode(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOtp = async (type: "email" | "phone") => {
    const otp = type === "email" ? emailOtp : phoneOtp
    const setVerifyLoading = type === "email" ? setEmailVerifying : setPhoneVerifying

    if (otp.length !== 6) {
      toast.error("Please enter the full 6-digit code")
      return
    }

    setVerifyLoading(true)
    try {
      const res = await fetch("/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, code: otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Verification failed")

      toast.success(data.message)

      if (type === "email") {
        setProfile((p) => p ? { ...p, email_verified: true } : null)
        setEmailOtpMode(false)
        setEmailOtp("")
        setEmailDevCode(null)
      } else {
        setProfile((p) => p ? { ...p, phone_verified: true } : null)
        setPhoneOtpMode(false)
        setPhoneOtp("")
        setPhoneDevCode(null)
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setVerifyLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const needsVerification = !profile?.email_verified || !profile?.phone_verified

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Profile Settings
      </h1>

      {/* Verification warning banner */}
      {needsVerification && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-foreground">Verification required</p>
            <p className="text-sm text-muted-foreground">
              You must verify both your email and phone number before you can create listings or place bids.
            </p>
          </div>
        </div>
      )}

      {/* Account info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
          <CardDescription>Your account details and verification status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Role:</span>
            <Badge variant="outline" className="capitalize">{profile?.role}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Email:</span>
            <span className="text-sm text-muted-foreground">{email}</span>
            <Badge variant={profile?.email_verified ? "default" : "secondary"}>
              {profile?.email_verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Phone:</span>
            <span className="text-sm text-muted-foreground">{profile?.phone || "Not set"}</span>
            <Badge variant={profile?.phone_verified ? "default" : "secondary"}>
              {profile?.phone_verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Verification */}
      {!profile?.email_verified && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Verify Email</CardTitle>
            </div>
            <CardDescription>
              Verify your email address ({email}) to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailOtpMode ? (
              <Button
                onClick={() => handleSendOtp("email")}
                disabled={emailSending}
              >
                {emailSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send verification code"
                )}
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                {emailDevCode && (
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Development mode - your code is:</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-foreground">{emailDevCode}</p>
                  </div>
                )}
                <div className="flex flex-col items-start gap-3">
                  <Label>Enter the 6-digit code sent to your email</Label>
                  <InputOTP maxLength={6} value={emailOtp} onChange={setEmailOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleVerifyOtp("email")}
                    disabled={emailVerifying || emailOtp.length !== 6}
                  >
                    {emailVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={emailSending || emailCooldown > 0}
                    onClick={() => handleSendOtp("email")}
                  >
                    {emailCooldown > 0 ? `Resend in ${emailCooldown}s` : "Resend code"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Phone Verification */}
      {!profile?.phone_verified && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle>Verify Phone</CardTitle>
            </div>
            <CardDescription>
              {profile?.phone
                ? `Verify your phone number (${profile.phone}) to unlock all features`
                : "Add a phone number in the edit section below, then verify it"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!profile?.phone ? (
              <p className="text-sm text-muted-foreground">
                Please add a phone number in the Edit Profile section below first.
              </p>
            ) : !phoneOtpMode ? (
              <Button
                onClick={() => handleSendOtp("phone")}
                disabled={phoneSending}
              >
                {phoneSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send verification code"
                )}
              </Button>
            ) : (
              <div className="flex flex-col gap-4">
                {phoneDevCode && (
                  <div className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Development mode - your code is:</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-foreground">{phoneDevCode}</p>
                  </div>
                )}
                <div className="flex flex-col items-start gap-3">
                  <Label>Enter the 6-digit code sent to your phone</Label>
                  <InputOTP maxLength={6} value={phoneOtp} onChange={setPhoneOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleVerifyOtp("phone")}
                    disabled={phoneVerifying || phoneOtp.length !== 6}
                  >
                    {phoneVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={phoneSending || phoneCooldown > 0}
                    onClick={() => handleSendOtp("phone")}
                  >
                    {phoneCooldown > 0 ? `Resend in ${phoneCooldown}s` : "Resend code"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verified success cards */}
      {profile?.email_verified && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-foreground">Email verified</span>
            <span className="text-sm text-muted-foreground">{email}</span>
          </CardContent>
        </Card>
      )}

      {profile?.phone_verified && (
        <Card className="mb-6">
          <CardContent className="flex items-center gap-3 pt-6">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium text-foreground">Phone verified</span>
            <span className="text-sm text-muted-foreground">{profile.phone}</span>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods - securely managed via Stripe */}
      <PaymentMethods />

      {/* Edit profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your display name and contact information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="phone-input">Phone Number</Label>
            <Input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="mt-1.5"
            />
            {phone !== (profile?.phone || "") && (
              <p className="mt-1 text-xs text-destructive">
                Changing your phone number will require re-verification
              </p>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
