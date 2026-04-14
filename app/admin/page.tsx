import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, DollarSign, Gavel, TrendingUp, ShoppingCart } from "lucide-react"

export default async function AdminOverviewPage() {
  const supabase = await createClient()

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalListings },
    { count: activeListings },
    { count: totalTransactions },
    { count: totalBids },
    { data: recentTransactions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("transactions").select("*", { count: "exact", head: true }),
    supabase.from("bids").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("id, amount, buyer_commission, seller_commission, created_at, listings(title)").order("created_at", { ascending: false }).limit(10),
  ])

  const totalRevenue = recentTransactions?.reduce(
    (sum, t) => sum + (t.buyer_commission || 0) + (t.seller_commission || 0), 0
  ) || 0

  const stats = [
    { label: "Total Users", value: totalUsers ?? 0, icon: Users, color: "text-blue-600" },
    { label: "Total Listings", value: totalListings ?? 0, icon: Package, color: "text-emerald-600" },
    { label: "Active Listings", value: activeListings ?? 0, icon: ShoppingCart, color: "text-amber-600" },
    { label: "Total Bids", value: totalBids ?? 0, icon: Gavel, color: "text-rose-600" },
    { label: "Transactions", value: totalTransactions ?? 0, icon: DollarSign, color: "text-indigo-600" },
    { label: "Platform Revenue", value: `$${(totalRevenue / 100).toFixed(2)}`, icon: TrendingUp, color: "text-emerald-600" },
  ]

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
        Admin Overview
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions && recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Listing</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Buyer Fee</th>
                    <th className="pb-3 font-medium">Seller Fee</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => {
                    const listing = t.listings as unknown as { title: string } | null
                    return (
                      <tr key={t.id} className="border-b border-border">
                        <td className="py-3 font-medium text-foreground">{listing?.title || "N/A"}</td>
                        <td className="py-3">${((t.amount || 0) / 100).toFixed(2)}</td>
                        <td className="py-3">${((t.buyer_commission || 0) / 100).toFixed(2)}</td>
                        <td className="py-3">${((t.seller_commission || 0) / 100).toFixed(2)}</td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
