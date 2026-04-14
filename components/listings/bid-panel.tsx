"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Clock, Gavel, ShoppingCart, AlertCircle, ShieldAlert, StopCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

function getTimeRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now()
  if (diff <= 0) return "Ended"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}

interface BidPanelProps {
  listingId: string
  listingType: string
  currentPrice: number
  startingPrice: number
  buyNowPrice: number | null
  bidCount: number
  endTime: string
  taxPct: number
  commissionPct: number
  isLoggedIn: boolean
  isOwner: boolean
  isEnded: boolean
  listingStatus?: string
  isVerified?: boolean
}

export function BidPanel({
  listingId,
  listingType,
  currentPrice,
  startingPrice,
  buyNowPrice,
  bidCount,
  endTime,
  taxPct,
  commissionPct,
  isLoggedIn,
  isOwner,
  isEnded,
  listingStatus = "active",
  isVerified = false,
}: BidPanelProps) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime))
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const minBid = currentPrice + 100 // At least $1 more than current
  const isAuction = listingType === "auction" || listingType === "both"
  const hasBuyNow = listingType === "buy_now" || listingType === "both"

  useEffect(() => {
    if (isEnded) return
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(endTime))
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime, isEnded])

  const handlePlaceBid = async () => {
    const amount = Math.round(parseFloat(bidAmount) * 100)
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is ${formatCurrency(minBid)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to place bid")
      if (data.autoConfirmed) {
        toast.success("Your bid matched the Buy Now price -- purchase confirmed!")
      } else {
        toast.success("Bid placed successfully!")
      }
      setBidAmount("")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place bid"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, type: "buy_now" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start checkout")
      router.push(`/checkout/${data.sessionId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const taxAmount = Math.round(currentPrice * (taxPct / 100))
  const commissionAmount = Math.round(currentPrice * (commissionPct / 100))
  const totalAmount = currentPrice + taxAmount + commissionAmount

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Timer */}
      {isAuction && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg px-3 py-2 ${
          isEnded ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"
        }`}>
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            {listingStatus === "sold" ? "Sold" :
             listingStatus === "ended_early" ? "Ended Early" :
             listingStatus === "cancelled" ? "Cancelled" :
             isEnded ? "Auction Ended" : `Ends in ${timeLeft}`}
          </span>
        </div>
      )}

      {/* Current price */}
      {isAuction && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {bidCount > 0 ? "Current Bid" : "Starting Price"}
          </p>
          <p className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            {formatCurrency(currentPrice)}
          </p>
          <p className="text-xs text-muted-foreground">
            {bidCount} {bidCount === 1 ? "bid" : "bids"}
          </p>
        </div>
      )}

      {/* Buy now price */}
      {hasBuyNow && buyNowPrice && (
        <div className={isAuction ? "mb-4 rounded-lg border border-border bg-secondary/50 p-3" : "mb-4"}>
          <p className="text-sm text-muted-foreground">
            {isAuction ? "Buy It Now" : "Price"}
          </p>
          <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
            {formatCurrency(buyNowPrice)}
          </p>
        </div>
      )}

      <Separator className="my-4" />

      {/* Price breakdown */}
      <div className="mb-4 rounded-lg bg-muted p-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Item Price</span>
          <span>{formatCurrency(currentPrice)}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Tax ({taxPct}%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>Commission ({commissionPct}%)</span>
          <span>{formatCurrency(commissionAmount)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-sm font-medium text-foreground">
          <span>Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Actions */}
      {!isLoggedIn ? (
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/login">Log in to bid</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/auth/sign-up" className="text-primary underline">Sign up</Link>
          </p>
        </div>
      ) : isOwner ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            This is your listing
          </div>
          {isAuction && !isEnded && listingStatus === "active" && (
            <EndEarlyButton listingId={listingId} onEnd={() => router.refresh()} />
          )}
        </div>
      ) : !isVerified ? (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Verification required
          </div>
          <p className="text-xs text-muted-foreground">
            Verify your email and phone number to place bids or buy items.
          </p>
          <Button variant="outline" size="sm" asChild className="mt-1 w-fit">
            <Link href="/dashboard/profile">Go to Profile</Link>
          </Button>
        </div>
      ) : isEnded ? (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          {listingStatus === "sold" ? "This item has been sold" :
           listingStatus === "ended_early" ? "This auction was ended early" :
           listingStatus === "cancelled" ? "This listing was cancelled" :
           "This auction has ended"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isAuction && (
            <div>
              <Label htmlFor="bid-amount" className="mb-1.5 text-sm">
                Your Bid (min {formatCurrency(minBid)})
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                  <Input
                    id="bid-amount"
                    type="number"
                    step="0.01"
                    min={(minBid / 100).toFixed(2)}
                    placeholder={(minBid / 100).toFixed(2)}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
                <Button onClick={handlePlaceBid} disabled={loading} className="gap-2">
                  <Gavel className="h-4 w-4" />
                  Bid
                </Button>
              </div>
            </div>
          )}

          {hasBuyNow && buyNowPrice && (
            <Button
              onClick={handleBuyNow}
              disabled={loading}
              variant={isAuction ? "secondary" : "default"}
              className="w-full gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy Now {formatCurrency(buyNowPrice)}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function EndEarlyButton({ listingId, onEnd }: { listingId: string; onEnd: () => void }) {
  const [loading, setLoading] = useState(false)

  const handleEndEarly = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/listings/end-early", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to end auction")
      if (data.hasBids) {
        toast.success("Auction ended! Sold to the highest bidder.")
      } else {
        toast.success("Auction ended early with no bids.")
      }
      onEnd()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to end auction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full gap-2">
          <StopCircle className="h-4 w-4" />
          End Auction Early
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End auction early?</AlertDialogTitle>
          <AlertDialogDescription>
            {"If there are bids, the item will be sold to the highest bidder. This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleEndEarly} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{"Ending..."}</>
            ) : (
              "Confirm End Early"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
