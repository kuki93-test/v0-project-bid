"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export default function CheckoutPage() {
  const params = useParams()
  const sessionId = params.sessionId as string
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch(`/api/checkout/session?id=${sessionId}`)
      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      }
    }
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret || "")
  }, [clientSecret])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          Complete Your Purchase
        </h1>

        {clientSecret ? (
          <div className="rounded-xl border border-border bg-card p-6">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ fetchClientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>
    </div>
  )
}
