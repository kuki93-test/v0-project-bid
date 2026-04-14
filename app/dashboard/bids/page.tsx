import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Gavel } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function MyBidsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: bids } = await supabase
    .from("bids")
    .select("id, amount, created_at, listings(title, slug, current_bid, auction_end, status, winner_id)")
    .eq("bidder_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        My Bids
      </h1>

      {bids && bids.length > 0 ? (
        <div className="flex flex-col gap-3">
          {bids.map((bid) => {
            const listing = bid.listings as unknown as { title: string; slug: string; current_bid: number; auction_end: string; status: string; winner_id: string | null } | null
            const isHighestBid = listing && bid.amount === listing.current_bid
            const isNotActive = listing ? listing.status !== "active" : false
            const isTimeExpired = listing ? new Date(listing.auction_end) < new Date() : false
            const isEnded = isNotActive || isTimeExpired
            const isWinner = listing?.winner_id === user.id

            let statusLabel: string
            let statusVariant: "default" | "secondary" | "destructive" | "outline" = "secondary"
            let statusClass = ""

            if (isEnded && isWinner) {
              statusLabel = "Won"
              statusVariant = "default"
              statusClass = "bg-accent text-accent-foreground"
            } else if (isEnded && !isWinner && isHighestBid) {
              // Highest bid but not the winner (edge case)
              statusLabel = "Won"
              statusVariant = "default"
              statusClass = "bg-accent text-accent-foreground"
            } else if (isEnded && !isWinner) {
              statusLabel = listing?.status === "cancelled" ? "Cancelled" : "Lost"
              statusVariant = "destructive"
            } else if (isHighestBid && !isEnded) {
              statusLabel = "Winning"
              statusClass = "bg-accent text-accent-foreground"
            } else {
              statusLabel = "Outbid"
              statusVariant = "secondary"
            }

            return (
              <Link
                key={bid.id}
                href={listing ? `/listings/${listing.slug}` : "#"}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{listing?.title || "Unknown Listing"}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(bid.created_at).toLocaleString()}</span>
                    <Badge variant={statusVariant} className={`text-xs ${statusClass}`}>{statusLabel}</Badge>
                    {isEnded && listing?.status === "ended_early" && (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Ended Early</Badge>
                    )}
                  </div>
                </div>
                <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
                  {formatCurrency(bid.amount)}
                </p>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Gavel className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No bids yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start bidding on listings to see your activity here</p>
            <Button asChild className="mt-4">
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
