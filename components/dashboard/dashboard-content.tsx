"use client"

import { useDashboardMode } from "./dashboard-wrapper"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gavel, Package, DollarSign, ShoppingBag } from "lucide-react"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100)
}

interface Listing {
  id: string
  title: string
  slug: string
  status: string
  current_bid: number | null
  starting_price: number
  bid_count: number
  created_at: string
}

interface Bid {
  id: string
  amount: number
  created_at: string
  listings: {
    title: string
    slug: string
    current_bid: number
    auction_end: string
    status: string
    winner_id: string | null
  } | null
}

interface DashboardContentProps {
  displayName: string
  userId: string
  sellerStats: {
    listingCount: number
    activeCount: number
    recentListings: Listing[]
  }
  buyerStats: {
    bidCount: number
    recentBids: Bid[]
  }
}

export function DashboardContent({ displayName, userId, sellerStats, buyerStats }: DashboardContentProps) {
  const { mode } = useDashboardMode()

  if (mode === "selling") {
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
              <p className="text-2xl font-bold text-foreground">{sellerStats.listingCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{sellerStats.activeCount}</p>
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

        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Listings</h2>
          {sellerStats.recentListings.length > 0 ? (
            <div className="rounded-lg border border-border">
              {sellerStats.recentListings.map((listing, i) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.slug}`}
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    i < sellerStats.recentListings.length - 1 ? "border-b border-border" : ""
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

  // Buying mode
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
            <p className="text-2xl font-bold text-foreground">{buyerStats.bidCount}</p>
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

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Bids</h2>
        {buyerStats.recentBids.length > 0 ? (
          <div className="rounded-lg border border-border">
            {buyerStats.recentBids.map((bid, i) => {
              const listing = bid.listings
              const isEnded = listing ? listing.status !== "active" || new Date(listing.auction_end) < new Date() : false
              const isWinner = listing?.winner_id === userId
              const isHighest = listing && bid.amount === listing.current_bid

              let statusText = ""
              let statusColor = "text-muted-foreground"
              if (isEnded && (isWinner || isHighest)) {
                statusText = "Won"
                statusColor = "text-accent"
              } else if (isEnded) {
                statusText = listing?.status === "cancelled" ? "Cancelled" : "Lost"
                statusColor = "text-destructive"
              } else if (isHighest) {
                statusText = "Winning"
                statusColor = "text-accent"
              } else {
                statusText = "Outbid"
              }

              return (
                <Link
                  key={bid.id}
                  href={listing ? `/listings/${listing.slug}` : "#"}
                  className={`flex items-center justify-between px-4 py-3 transition-colors hover:bg-secondary/50 ${
                    i < buyerStats.recentBids.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{listing?.title || "Unknown Listing"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(bid.amount)}
                    </p>
                    <p className={`text-xs font-medium ${statusColor}`}>{statusText}</p>
                  </div>
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
