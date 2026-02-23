import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, Package, DollarSign, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const role = (user.user_metadata?.role as string) || "buyer"
  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0]

  if (role === "seller") {
    // Seller stats
    const { count: listingCount } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)

    const { count: activeCount } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .eq("status", "active")

    const { data: recentListings } = await supabase
      .from("listings")
      .select("id, title, slug, status, current_bid, starting_price, bid_count, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">Seller Dashboard</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/listings/new">Create Listing</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{listingCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{activeCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent listings */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Listings</h2>
          {recentListings && recentListings.length > 0 ? (
            <div className="rounded-lg border border-border">
              {recentListings.map((listing, i) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    i < recentListings.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.bid_count} bids - {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(listing.current_bid || listing.starting_price)}
                    </p>
                    <p className={`text-xs capitalize ${listing.status === "active" ? "text-accent" : "text-muted-foreground"}`}>
                      {listing.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <p className="text-sm text-muted-foreground">No listings yet</p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/dashboard/listings/new">Create your first listing</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Buyer dashboard
  const { count: bidCount } = await supabase
    .from("bids")
    .select("*", { count: "exact", head: true })
    .eq("bidder_id", user.id)

  const { data: recentBids } = await supabase
    .from("bids")
    .select("id, amount, created_at, listings(title, slug, current_bid, auction_end)")
    .eq("bidder_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm text-muted-foreground">Buyer Dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bids</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{bidCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Watchlist</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">0</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent bids */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Bids</h2>
        {recentBids && recentBids.length > 0 ? (
          <div className="rounded-lg border border-border">
            {recentBids.map((bid, i) => {
              const listing = bid.listings as unknown as { title: string; slug: string; current_bid: number; auction_end: string } | null
              return (
                <Link
                  key={bid.id}
                  href={listing ? `/listings/${listing.slug}` : "#"}
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    i < recentBids.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{listing?.title || "Unknown Listing"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(bid.amount)}
                  </p>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <p className="text-sm text-muted-foreground">No bids placed yet</p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/listings">Browse Listings</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
