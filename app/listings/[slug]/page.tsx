import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BidPanel } from "@/components/listings/bid-panel"
import { Badge } from "@/components/ui/badge"
import { Gavel, ShoppingCart, Clock, User, MapPin, Package } from "lucide-react"
import { getSettings } from "@/lib/settings"
import type { Metadata } from "next"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description")
    .eq("slug", slug)
    .single()

  return {
    title: listing ? `${listing.title} - Willbieten GmbH` : "Listing - Willbieten GmbH",
    description: listing?.description || "View this listing on Willbieten",
  }
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      categories(name, slug),
      profiles!listings_seller_id_fkey(id, display_name, avatar_url)
    `)
    .eq("slug", slug)
    .single()

  if (!listing) notFound()

  // Get listing images
  const { data: listingImages } = await supabase
    .from("listing_images")
    .select("url, display_order")
    .eq("listing_id", listing.id)
    .order("display_order", { ascending: true })

  const imageUrls = listingImages?.map((img) => img.url) || []

  // Get recent bids
  const { data: bids } = await supabase
    .from("bids")
    .select("id, amount, created_at, profiles(display_name)")
    .eq("listing_id", listing.id)
    .order("amount", { ascending: false })
    .limit(10)

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's verification status
  let isVerified = false
  if (user) {
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("email_verified, phone_verified")
      .eq("id", user.id)
      .single()
    isVerified = !!userProfile?.email_verified && !!userProfile?.phone_verified
  }

  // Get platform settings for commission info
  const settings = await getSettings()

  const seller = listing.profiles as unknown as { id: string; display_name: string | null; avatar_url: string | null } | null
  const category = listing.categories as unknown as { name: string; slug: string } | null
  const currentPrice = listing.current_bid || listing.starting_price
  const taxRate = settings.tax_rate
  const commissionRate = settings.commission_rate
  const isOwner = user?.id === listing.seller_id
  const isNotActive = listing.status !== "active"
  const isTimeExpired = new Date(listing.auction_end) < new Date()
  const isEnded = isNotActive || isTimeExpired

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/listings" className="hover:text-foreground">Listings</a>
          <span>/</span>
          {category && (
            <>
              <a href={`/listings?category=${category.slug}`} className="hover:text-foreground">
                {category.name}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{listing.title}</span>
        </nav>

        {isNotActive && (
          <div className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
            listing.status === "sold"
              ? "border-accent/30 bg-accent/10 text-accent"
              : listing.status === "ended_early"
                ? "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}>
            {listing.status === "sold" && "This item has been sold."}
            {listing.status === "ended_early" && "This auction was ended early by the seller."}
            {listing.status === "cancelled" && "This listing has been cancelled."}
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: Image + Description */}
          <div className="flex-1">
            {/* Image area */}
            <div className="mb-6 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[0]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-16 w-16" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>

            {/* Title + badges */}
            <div className="mb-4 flex flex-wrap items-start gap-2">
              {(listing.listing_type === "auction" || listing.listing_type === "both") && (
                <Badge variant="default" className="gap-1">
                  <Gavel className="h-3 w-3" />
                  Auction
                </Badge>
              )}
              {(listing.listing_type === "buy_now" || listing.listing_type === "both") && (
                <Badge variant="secondary" className="gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  Buy Now
                </Badge>
              )}
              <Badge variant="outline" className="capitalize">{listing.condition.replace("_", " ")}</Badge>
              {listing.status === "sold" && <Badge variant="default" className="bg-accent text-accent-foreground">Sold</Badge>}
              {listing.status === "ended_early" && <Badge variant="outline" className="border-amber-500 text-amber-600">Ended Early</Badge>}
              {listing.status === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
              {listing.status === "active" && isTimeExpired && <Badge variant="destructive">Ended</Badge>}
            </div>

            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground text-balance md:text-3xl">
              {listing.title}
            </h1>

            {/* Seller info */}
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                {seller?.display_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {seller?.display_name || "Anonymous Seller"}
                </p>
                <p className="text-xs text-muted-foreground">Seller</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Description</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Details table */}
            <div className="mt-6">
              <h2 className="mb-3 text-lg font-semibold text-foreground">Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">{category?.name || "Uncategorized"}</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="text-sm font-medium capitalize text-foreground">{listing.condition.replace("_", " ")}</p>
                </div>
                {listing.shipping_info && (
                  <div className="col-span-2 rounded-lg border border-border bg-card p-3">
                    <p className="text-xs text-muted-foreground">Shipping</p>
                    <p className="text-sm font-medium text-foreground">{listing.shipping_info}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bid history */}
            {bids && bids.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-lg font-semibold text-foreground">
                  Bid History ({listing.bid_count} {listing.bid_count === 1 ? "bid" : "bids"})
                </h2>
                <div className="rounded-lg border border-border">
                  {bids.map((bid, i) => {
                    const bidder = bid.profiles as unknown as { display_name: string | null } | null
                    return (
                      <div
                        key={bid.id}
                        className={`flex items-center justify-between px-4 py-3 ${
                          i < bids.length - 1 ? "border-b border-border" : ""
                        } ${i === 0 ? "bg-accent/10" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                            {bidder?.display_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {bidder?.display_name || "Anonymous"}
                              {i === 0 && <span className="ml-2 text-xs text-accent">Highest</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(bid.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
                          {formatCurrency(bid.amount)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Bid panel */}
          <div className="w-full lg:w-96">
            <div className="sticky top-24">
              <BidPanel
                listingId={listing.id}
                listingType={listing.listing_type}
                currentPrice={currentPrice}
                startingPrice={listing.starting_price}
                buyNowPrice={listing.buy_now_price}
                bidCount={listing.bid_count || 0}
                endTime={listing.auction_end}
                taxPct={taxRate}
                commissionPct={commissionRate}
                isLoggedIn={!!user}
                isOwner={isOwner}
                isEnded={isEnded}
                listingStatus={listing.status}
                isVerified={isVerified}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
