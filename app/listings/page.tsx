import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ListingCard } from "@/components/listing-card"
import { ListingsFilters } from "@/components/listings/filters"
import { Loader2 } from "lucide-react"

interface Props {
  searchParams: Promise<{
    q?: string
    category?: string
    type?: string
    condition?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }>
}

async function ListingsGrid({
  searchParams,
}: {
  searchParams: {
    q?: string
    category?: string
    type?: string
    condition?: string
    sort?: string
    minPrice?: string
    maxPrice?: string
  }
}) {
  const supabase = await createClient()

  let query = supabase
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
      auction_end,
      categories(name)
    `)
    .eq("status", "active")

  if (searchParams.q) {
    query = query.ilike("title", `%${searchParams.q}%`)
  }

  if (searchParams.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", searchParams.category)
      .single()
    if (cat) {
      query = query.eq("category_id", cat.id)
    }
  }

  if (searchParams.type === "auction") {
    query = query.in("listing_type", ["auction", "both"])
  } else if (searchParams.type === "buy_now") {
    query = query.in("listing_type", ["buy_now", "both"])
  }

  if (searchParams.condition) {
    query = query.eq("condition", searchParams.condition)
  }

  // Sort
  const sort = searchParams.sort || "newest"
  switch (sort) {
    case "price_asc":
      query = query.order("starting_price", { ascending: true })
      break
    case "price_desc":
      query = query.order("starting_price", { ascending: false })
      break
    case "ending_soon":
      query = query.order("auction_end", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: listings } = await query.limit(24)

  if (!listings || listings.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
        <p className="text-lg font-medium text-foreground">No listings found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    )
  }

  return (
    <>
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
            endTime={listing.auction_end}
            bidCount={listing.bid_count || 0}
            condition={listing.condition}
            categoryName={category?.name}
          />
        )
      })}
    </>
  )
}

export default async function ListingsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            Browse Listings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Find your next treasure
          </p>
        </div>

        <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}>
          <ListingsFilters categories={categories || []} />
        </Suspense>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Suspense
            fallback={
              <div className="col-span-full flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ListingsGrid searchParams={resolvedParams} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  )
}
