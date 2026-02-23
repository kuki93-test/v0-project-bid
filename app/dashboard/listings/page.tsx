import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ExternalLink, Package } from "lucide-react"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function MyListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, slug, status, listing_type, starting_price, buy_now_price, current_bid, bid_count, auction_end, created_at, categories(name)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          My Listings
        </h1>
        <Button asChild className="gap-2">
          <Link href="/dashboard/listings/new">
            <Plus className="h-4 w-4" />
            Create Listing
          </Link>
        </Button>
      </div>

      {listings && listings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => {
            const category = listing.categories as unknown as { name: string } | null
            const isEnded = listing.status !== "active" || new Date(listing.auction_end) < new Date()
            return (
              <div
                key={listing.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{listing.title}</h3>
                    <Badge variant={listing.status === "active" ? "default" : "secondary"} className="capitalize text-xs shrink-0">
                      {listing.status}
                    </Badge>
                    {isEnded && listing.status === "active" && (
                      <Badge variant="destructive" className="text-xs shrink-0">Ended</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {category && <span>{category.name}</span>}
                    <span className="capitalize">{listing.listing_type.replace("_", " ")}</span>
                    <span>{listing.bid_count} bids</span>
                    <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatCurrency(listing.current_bid || listing.starting_price)}
                    </p>
                    {listing.buy_now_price && (
                      <p className="text-xs text-muted-foreground">
                        {"BN: "}{formatCurrency(listing.buy_now_price)}
                      </p>
                    )}
                  </div>
                  <Link href={`/listings/${listing.slug}`}>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Package className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first listing to start selling</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/listings/new">Create Listing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
