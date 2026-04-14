"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

export function PayNowButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, type: "auction_win" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create checkout")

      router.push(`/checkout/${data.sessionId}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start payment")
      setLoading(false)
    }
  }

  return (
    <Button onClick={handlePay} disabled={loading} size="sm" className="gap-2 shrink-0">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      Pay Now
    </Button>
  )
}
