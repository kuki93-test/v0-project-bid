import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PayNowButton } from "@/components/dashboard/pay-now-button"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get paid transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, amount, total_buyer_pays, status, created_at, listing_id, listings(title, slug)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  // Get won auctions that are NOT yet paid (winner_id = user but no transaction)
  const { data: wonListings } = await supabase
    .from("listings")
    .select("id, title, slug, current_bid, starting_price, status, auction_end")
    .eq("winner_id", user.id)
    .in("status", ["sold", "ended_early"])

  // Filter out listings that already have a transaction
  const paidListingIds = new Set(transactions?.map(t => t.listing_id) || [])
  const unpaidWins = wonListings?.filter(l => !paidListingIds.has(l.id)) || []

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        My Purchases
      </h1>

      {/* Unpaid won auctions */}
      {unpaidWins.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CreditCard className="h-4 w-4 text-amber-600" />
            Awaiting Payment
          </h2>
          <div className="flex flex-col gap-3">
            {unpaidWins.map((listing) => {
              const price = listing.current_bid || listing.starting_price
              return (
                <div
                  key={listing.id}
                  className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-50/50 p-4 dark:bg-amber-950/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{listing.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="border-amber-500 text-amber-600 text-xs">Won - Payment Required</Badge>
                      <span>{listing.status === "ended_early" ? "Ended early" : "Auction ended"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
                      {formatCurrency(price)}
                    </p>
                    <PayNowButton listingId={listing.id} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed purchases */}
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
        {unpaidWins.length > 0 ? "Completed Purchases" : ""}
      </h2>

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => {
            const listing = tx.listings as unknown as { title: string; slug: string } | null
            return (
              <Link
                key={tx.id}
                href={listing ? `/listings/${listing.slug}` : "#"}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{listing?.title || "Unknown"}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={tx.status === "completed" ? "default" : "secondary"} className="text-xs capitalize">
                      {tx.status}
                    </Badge>
                    <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
                  {formatCurrency(tx.total_buyer_pays || tx.amount)}
                </p>
              </Link>
            )
          })}
        </div>
      ) : unpaidWins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <ShoppingBag className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No purchases yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Items you buy will appear here</p>
            <Button asChild className="mt-4">
              <Link href="/listings">Browse Listings</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
