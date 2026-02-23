import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminTransactionsPage() {
  const supabase = await createClient()

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id, amount, buyer_commission, seller_commission, status, created_at,
      listings(title),
      buyer:profiles!transactions_buyer_id_fkey(display_name),
      seller:profiles!transactions_seller_id_fkey(display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const totalPlatformRevenue = transactions?.reduce(
    (sum, t) => sum + (t.buyer_commission || 0) + (t.seller_commission || 0), 0
  ) || 0

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
        Transactions
      </h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Platform Revenue</p>
              <p className="text-2xl font-bold text-foreground">${(totalPlatformRevenue / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold text-foreground">{transactions?.length ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Listing</th>
                    <th className="pb-3 font-medium">Buyer</th>
                    <th className="pb-3 font-medium">Seller</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Buyer Fee</th>
                    <th className="pb-3 font-medium">Seller Fee</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const listing = t.listings as unknown as { title: string } | null
                    const buyer = t.buyer as unknown as { display_name: string } | null
                    const seller = t.seller as unknown as { display_name: string } | null
                    return (
                      <tr key={t.id} className="border-b border-border">
                        <td className="max-w-[150px] truncate py-3 font-medium text-foreground">
                          {listing?.title || "N/A"}
                        </td>
                        <td className="py-3 text-muted-foreground">{buyer?.display_name || "N/A"}</td>
                        <td className="py-3 text-muted-foreground">{seller?.display_name || "N/A"}</td>
                        <td className="py-3">${((t.amount || 0) / 100).toFixed(2)}</td>
                        <td className="py-3">${((t.buyer_commission || 0) / 100).toFixed(2)}</td>
                        <td className="py-3">${((t.seller_commission || 0) / 100).toFixed(2)}</td>
                        <td className="py-3">
                          <Badge variant={t.status === "completed" ? "default" : "outline"} className="capitalize">
                            {t.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString()}
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
