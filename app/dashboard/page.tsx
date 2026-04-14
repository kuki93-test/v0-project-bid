import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const displayName = user.user_metadata?.display_name || user.email?.split("@")[0]

  // Fetch seller stats
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

  // Fetch buyer stats
  const { count: bidCount } = await supabase
    .from("bids")
    .select("*", { count: "exact", head: true })
    .eq("bidder_id", user.id)

  const { data: recentBids } = await supabase
    .from("bids")
    .select("id, amount, created_at, listings(title, slug, current_bid, auction_end, status, winner_id)")
    .eq("bidder_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardContent
      displayName={displayName}
      userId={user.id}
      sellerStats={{
        listingCount: listingCount || 0,
        activeCount: activeCount || 0,
        recentListings: recentListings || [],
      }}
      buyerStats={{
        bidCount: bidCount || 0,
        recentBids: (recentBids || []).map(bid => ({
          ...bid,
          listings: bid.listings as unknown as {
            title: string
            slug: string
            current_bid: number
            auction_end: string
            status: string
            winner_id: string | null
          } | null
        })),
      }}
    />
  )
}
