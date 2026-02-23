"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Gavel, Mail, Phone, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Step = "email" | "phone" | "done"

export default function VerifyPage() {
  const supabase = createClient()
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [code, setCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [devCode, setDevCode] = useState<string | null>(null)

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("email_verified, phone_verified, phone")
        .eq("id", user.id)
        .single()

      if (profile) {
        setEmailVerified(profile.email_verified ?? false)
        setPhoneVerified(profile.phone_verified ?? false)
        setPhone(profile.phone)

        if (profile.email_verified && profile.phone_verified) {
          setStep("done")
        } else if (profile.email_verified) {
          setStep("phone")
        } else {
          setStep("email")
        }
      }
      setLoading(false)
    }
    checkStatus()
  }, [supabase, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleSendCode = async (type: "email" | "phone") => {
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
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send code")
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code")
      return
    }

    setVerifying(true)
    try {
      const res = await fetch("/api/verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: step, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Verification failed")

      toast.success(data.message)
      setCode("")
      setDevCode(null)

      if (step === "email") {
        setEmailVerified(true)
        if (phoneVerified) {
          setStep("done")
        } else {
          setStep("phone")
        }
      } else if (step === "phone") {
        setPhoneVerified(true)
        setStep("done")
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-secondary">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-secondary p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Gavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold">
              BidVault
            </span>
          </Link>

          {/* Progress indicators */}
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              emailVerified
                ? "bg-accent text-accent-foreground"
                : step === "email"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}>
              {emailVerified ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <div className="h-px w-8 bg-border" />
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              phoneVerified
                ? "bg-accent text-accent-foreground"
                : step === "phone"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}>
              {phoneVerified ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
          </div>

          {step === "done" ? (
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                  <CheckCircle2 className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">All verified!</CardTitle>
                <CardDescription>
                  Your email and phone number have been verified. You can now fully use BidVault.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full">
              <CardHeader className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  {step === "email" ? (
                    <Mail className="h-6 w-6 text-primary" />
                  ) : (
                    <Phone className="h-6 w-6 text-primary" />
                  )}
                </div>
                <CardTitle className="text-2xl">
                  {step === "email" ? "Verify your email" : "Verify your phone"}
                </CardTitle>
                <CardDescription>
                  {step === "email"
                    ? "Enter the 6-digit code sent to your email address"
                    : `Enter the 6-digit code sent to ${phone || "your phone"}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {devCode && (
                  <div className="w-full rounded-lg border border-accent/30 bg-accent/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground">Development mode - your code is:</p>
                    <p className="font-mono text-lg font-bold tracking-widest text-foreground">{devCode}</p>
                  </div>
                )}

                <InputOTP maxLength={6} value={code} onChange={setCode}>
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

                <Button
                  onClick={handleVerify}
                  disabled={verifying || code.length !== 6}
                  className="w-full"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sending || cooldown > 0}
                    onClick={() => handleSendCode(step)}
                    className="text-muted-foreground"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Sending...
                      </>
                    ) : cooldown > 0 ? (
                      `Resend code in ${cooldown}s`
                    ) : (
                      "Resend code"
                    )}
                  </Button>
                </div>

                {step === "email" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => router.push("/dashboard")}
                  >
                    Skip for now
                  </Button>
                )}
                {step === "phone" && (
                  <Button
                    variant="link"
                    size="sm"
                    className="text-xs text-muted-foreground"
                    onClick={() => router.push("/dashboard")}
                  >
                    Skip for now
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
