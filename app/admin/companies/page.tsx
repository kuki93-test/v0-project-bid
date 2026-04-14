import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Clock, CheckCircle2, XCircle } from "lucide-react"
import { CompanyReviewCard } from "@/components/admin/company-review-card"

export default async function AdminCompaniesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) redirect("/dashboard")

  // Get company applications
  const { data: companies } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_type", "company")
    .order("created_at", { ascending: false })

  const pending = companies?.filter(c => c.company_status === "pending") || []
  const approved = companies?.filter(c => c.company_status === "approved") || []
  const rejected = companies?.filter(c => c.company_status === "rejected") || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
          Company Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and approve company registration applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approved.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejected.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-amber-500" />
          Pending Applications ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No pending applications</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pending.map((company) => (
              <CompanyReviewCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>

      {/* Approved Companies */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Approved Companies ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No approved companies yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {approved.map((company) => (
              <CompanyReviewCard key={company.id} company={company} showActions={false} />
            ))}
          </div>
        )}
      </div>

      {/* Rejected Applications */}
      {rejected.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <XCircle className="h-5 w-5 text-destructive" />
            Rejected Applications ({rejected.length})
          </h2>
          <div className="grid gap-4">
            {rejected.map((company) => (
              <CompanyReviewCard key={company.id} company={company} showActions={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
