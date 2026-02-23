import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ListingCard } from "@/components/listing-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function FeaturedListings() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      slug,
      listing_type,
      starting_price,
      buy_now_price,
      current_bid,
      bid_count,
      condition,
      end_time,
      categories(name)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8)

  const hasListings = listings && listings.length > 0

  return (
    <section className="bg-secondary/50 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
              Featured Listings
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover the latest items up for auction and sale
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden gap-2 md:inline-flex">
            <Link href="/listings">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {hasListings ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => {
              const category = listing.categories as unknown as { name: string } | null
              return (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  slug={listing.slug}
                  imageUrl={null}
                  currentPrice={listing.current_bid || listing.starting_price}
                  buyNowPrice={listing.buy_now_price}
                  listingType={listing.listing_type}
                  endTime={listing.end_time}
                  bidCount={listing.bid_count || 0}
                  condition={listing.condition}
                  categoryName={category?.name}
                />
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
            <p className="text-lg font-medium text-foreground">No listings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to list an item on BidVault
            </p>
            <Button asChild className="mt-4">
              <Link href="/auth/sign-up">Become a Seller</Link>
            </Button>
          </div>
        )}

        <div className="mt-6 text-center md:hidden">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/listings">
              View All Listings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
