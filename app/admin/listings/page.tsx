"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Search, Trash2, Eye, Ban } from "lucide-react"
import Link from "next/link"

interface AdminListing {
  id: string
  title: string
  slug: string | null
  status: string
  listing_type: string
  starting_price: number
  current_bid: number | null
  buy_now_price: number | null
  bid_count: number
  auction_end: string
  created_at: string
  profiles: { display_name: string | null } | null
  categories: { name: string } | null
}

export default function AdminListingsPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<AdminListing[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("listings")
      .select("id, title, slug, status, listing_type, starting_price, current_bid, buy_now_price, bid_count, auction_end, created_at, profiles(display_name), categories(name)")
      .order("created_at", { ascending: false })

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }
    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`)
    }

    const { data } = await query.limit(50)
    setListings((data as unknown as AdminListing[]) || [])
    setLoading(false)
  }, [supabase, search, statusFilter])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const updateStatus = async (listingId: string, newStatus: string) => {
    const { error } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId)

    if (error) {
      toast.error("Failed to update listing")
      return
    }
    toast.success(`Listing marked as ${newStatus}`)
    fetchListings()
  }

  const deleteListing = async (listingId: string) => {
    // Delete related images and bids first
    await supabase.from("listing_images").delete().eq("listing_id", listingId)
    await supabase.from("bids").delete().eq("listing_id", listingId)
    const { error } = await supabase.from("listings").delete().eq("id", listingId)

    if (error) {
      toast.error("Failed to delete listing")
      return
    }
    toast.success("Listing deleted")
    fetchListings()
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "active": return "default"
      case "sold": return "secondary"
      case "ended_early": return "outline"
      case "cancelled": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
        Listings Management
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="ended_early">Ended Early</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={fetchListings}>Search</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listings ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No listings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Seller</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Bids</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => {
                    const seller = listing.profiles as unknown as { display_name: string | null } | null
                    const price = listing.current_bid || listing.starting_price
                    return (
                      <tr key={listing.id} className="border-b border-border">
                        <td className="max-w-[200px] truncate py-3 font-medium text-foreground">
                          {listing.title}
                        </td>
                        <td className="py-3 text-muted-foreground">{seller?.display_name || "N/A"}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="capitalize">{listing.listing_type.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-3">${(price / 100).toFixed(2)}</td>
                        <td className="py-3">{listing.bid_count}</td>
                        <td className="py-3">
                          <Badge variant={statusColor(listing.status)} className="capitalize">{listing.status.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {listing.slug && (
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/listings/${listing.slug}`}><Eye className="h-3 w-3" /></Link>
                              </Button>
                            )}
                            {listing.status === "active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(listing.id, "cancelled")}
                                className="gap-1"
                              >
                                <Ban className="h-3 w-3" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteListing(listing.id)}
                              className="gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
