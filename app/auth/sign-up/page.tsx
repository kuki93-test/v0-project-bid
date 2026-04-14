"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { Gavel, User, Building2, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Turnstile } from "@marsidev/react-turnstile"

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [accountType, setAccountType] = useState<"personal" | "company">("personal")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Common fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")

  // Company fields
  const [companyName, setCompanyName] = useState("")
  const [companyRegNumber, setCompanyRegNumber] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [swiftValid, setSwiftValid] = useState<boolean | null>(null)
  const [swiftValidating, setSwiftValidating] = useState(false)
  const [swiftError, setSwiftError] = useState<string | null>(null)
  const [companyDoc, setCompanyDoc] = useState<File | null>(null)

  const validateSwift = async () => {
    if (!swiftCode.trim()) return
    setSwiftValidating(true)
    setSwiftError(null)
    setSwiftValid(null)

    try {
      const res = await fetch("/api/validate-swift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swiftCode }),
      })
      const data = await res.json()
      setSwiftValid(data.valid)
      if (!data.valid) {
        setSwiftError(data.error)
      }
    } catch {
      setSwiftError("Failed to validate SWIFT code")
      setSwiftValid(false)
    } finally {
      setSwiftValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate common fields
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    if (!phone.trim()) {
      setError("Phone number is required")
      setIsLoading(false)
      return
    }

    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification")
      setIsLoading(false)
      return
    }

    // Validate company-specific fields
    if (accountType === "company") {
      if (!companyName.trim()) {
        setError("Company name is required")
        setIsLoading(false)
        return
      }
      if (!companyRegNumber.trim()) {
        setError("Company registration number is required")
        setIsLoading(false)
        return
      }
      if (!companyAddress.trim()) {
        setError("Company address is required")
        setIsLoading(false)
        return
      }
      if (!swiftValid) {
        setError("Please enter and validate a valid Austrian bank SWIFT code")
        setIsLoading(false)
        return
      }
      if (!companyDoc) {
        setError("Please upload your company registration document")
        setIsLoading(false)
        return
      }
    }

    try {
      // Verify CAPTCHA
      const captchaRes = await fetch("/api/captcha/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      })
      const captchaData = await captchaRes.json()
      if (!captchaData.success) {
        setError("CAPTCHA verification failed. Please try again.")
        setIsLoading(false)
        return
      }

      // Create account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split("@")[0],
            phone,
            account_type: accountType,
          },
        },
      })

      if (signUpError) throw signUpError
      if (!data.user) throw new Error("Failed to create account")

      // For company accounts, upload document and update profile
      if (accountType === "company" && companyDoc) {
        const formData = new FormData()
        formData.append("file", companyDoc)

        const uploadRes = await fetch("/api/upload/company-doc", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload company document")
        }

        const uploadData = await uploadRes.json()

        // Update profile with company details
        await supabase
          .from("profiles")
          .update({
            account_type: "company",
            company_name: companyName,
            company_registration_number: companyRegNumber,
            company_address: companyAddress,
            bank_swift_code: swiftCode.toUpperCase(),
            company_registration_doc_url: uploadData.pathname,
            company_status: "pending",
          })
          .eq("id", data.user.id)
      } else {
        // Update profile for personal account
        await supabase
          .from("profiles")
          .update({ account_type: "personal" })
          .eq("id", data.user.id)
      }

      // Send email OTP
      try {
        await fetch("/api/verification/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "email" }),
        })
      } catch {
        // Non-blocking
      }

      // Redirect to verification
      router.push(`/auth/verify?type=${accountType}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-secondary p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Gavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold">Willbieten</span>
          </Link>

          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create an Account</CardTitle>
              <CardDescription>
                Join Willbieten to buy and sell at auction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={accountType} onValueChange={(v) => setAccountType(v as "personal" | "company")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="personal" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Common Fields */}
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="displayName">
                        {accountType === "company" ? "Contact Person Name *" : "Display Name *"}
                      </Label>
                      <Input
                        id="displayName"
                        placeholder={accountType === "company" ? "John Doe" : "How you want to be known"}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+43 XXX XXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Required for verification</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Min 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">Confirm *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Account Fields */}
                  <TabsContent value="personal" className="mt-0 space-y-4">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Personal accounts require email and phone verification. Once verified, you can both buy and sell items on the platform.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Company Account Fields */}
                  <TabsContent value="company" className="mt-0 space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        placeholder="Willbieten GmbH"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="companyRegNumber">Austrian Registration Number (FN) *</Label>
                      <Input
                        id="companyRegNumber"
                        placeholder="FN 123456a"
                        value={companyRegNumber}
                        onChange={(e) => setCompanyRegNumber(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Firmenbuchnummer from the Austrian Commercial Register
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="companyAddress">Company Address *</Label>
                      <Textarea
                        id="companyAddress"
                        placeholder="Street, City, Postal Code, Austria"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="swiftCode">Bank SWIFT/BIC Code *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="swiftCode"
                          placeholder="BKAUATWW"
                          value={swiftCode}
                          onChange={(e) => {
                            setSwiftCode(e.target.value.toUpperCase())
                            setSwiftValid(null)
                            setSwiftError(null)
                          }}
                          className={swiftValid === true ? "border-green-500" : swiftValid === false ? "border-destructive" : ""}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={validateSwift}
                          disabled={swiftValidating || !swiftCode.trim()}
                        >
                          {swiftValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : swiftValid === true ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            "Validate"
                          )}
                        </Button>
                      </div>
                      {swiftError && (
                        <p className="text-xs text-destructive">{swiftError}</p>
                      )}
                      {swiftValid && (
                        <p className="text-xs text-green-600">Valid Austrian bank SWIFT code</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be from an Austrian bank (country code AT)
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Company Registration Document *</Label>
                      <div className="rounded-lg border-2 border-dashed border-border p-4">
                        {companyDoc ? (
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{companyDoc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(companyDoc.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setCompanyDoc(null)}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Upload proof of registration from Firmenbuch
                            </span>
                            <span className="text-xs text-muted-foreground">
                              PDF, JPEG, or PNG (max 10MB)
                            </span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) setCompanyDoc(file)
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Company accounts require admin approval. You will be notified once your application is reviewed.
                      </p>
                    </div>
                  </TabsContent>

                  {/* CAPTCHA and Submit */}
                  <div className="flex justify-center pt-2">
                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      options={{ theme: "light", size: "normal" }}
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !captchaToken}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : accountType === "company" ? (
                      "Submit Application"
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
