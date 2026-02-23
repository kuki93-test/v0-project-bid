import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)
}

export default async function SalesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, total_amount, seller_fee, status, created_at, listings(title, slug)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Sales
      </h1>

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => {
            const listing = tx.listings as unknown as { title: string; slug: string } | null
            return (
              <Link
                key={tx.id}
                href={listing ? `/listings/${listing.slug}` : "#"}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{listing?.title || "Unknown"}</p>
                  <p className="mt-1 text-xs capitalize text-muted-foreground">{tx.status} - {new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
                    {formatCurrency(tx.total_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {"Fee: "}{formatCurrency(tx.seller_fee)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <DollarSign className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No sales yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Completed sales will appear here</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/listings/new">Create a Listing</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
