"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ExternalLink,
  User
} from "lucide-react"
import { toast } from "sonner"

interface CompanyProfile {
  id: string
  email: string
  display_name: string | null
  phone: string | null
  company_name: string | null
  company_registration_number: string | null
  company_address: string | null
  bank_swift_code: string | null
  company_registration_doc_url: string | null
  company_status: string | null
  company_rejection_reason: string | null
  company_reviewed_at: string | null
  email_verified_at: string | null
  phone_verified_at: string | null
  created_at: string
}

interface Props {
  company: CompanyProfile
  showActions?: boolean
}

export function CompanyReviewCard({ company, showActions = true }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/companies/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: company.id, action: "approve" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to approve")
      toast.success("Company application approved")
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to approve")
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/admin/companies/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: company.id, 
          action: "reject",
          reason: rejectReason 
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reject")
      toast.success("Company application rejected")
      setRejectDialogOpen(false)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject")
    } finally {
      setLoading(false)
    }
  }

  const statusBadge = {
    pending: <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>,
    approved: <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Approved</Badge>,
    rejected: <Badge variant="destructive">Rejected</Badge>,
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{company.company_name || "Unnamed Company"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Applied {new Date(company.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {statusBadge[company.company_status as keyof typeof statusBadge] || statusBadge.pending}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Company Details */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Reg. No:</span>
            <span className="font-medium">{company.company_registration_number || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">SWIFT:</span>
            <span className="font-mono font-medium">{company.bank_swift_code || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Contact:</span>
            <span className="font-medium">{company.display_name || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{company.email}</span>
            {company.email_verified_at && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{company.phone || "N/A"}</span>
            {company.phone_verified_at && <CheckCircle2 className="h-3 w-3 text-green-500" />}
          </div>
          <div className="flex items-start gap-2 text-sm md:col-span-2">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground whitespace-pre-line">
              {company.company_address || "No address provided"}
            </span>
          </div>
        </div>

        {/* Registration Document */}
        {company.company_registration_doc_url && (
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Registration Document</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`/api/company-doc?pathname=${encodeURIComponent(company.company_registration_doc_url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View Document
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {company.company_status === "rejected" && company.company_rejection_reason && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
            <p className="text-sm text-destructive/80">{company.company_rejection_reason}</p>
          </div>
        )}

        {/* Reviewed Info */}
        {company.company_reviewed_at && (
          <p className="text-xs text-muted-foreground">
            Reviewed on {new Date(company.company_reviewed_at).toLocaleString()}
          </p>
        )}

        {/* Actions */}
        {showActions && company.company_status === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleApprove} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex-1" disabled={loading}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Application</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this company application. 
                    This will be shared with the applicant.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="reason">Rejection Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="e.g., Invalid registration document, company not found in registry..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Rejection
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
