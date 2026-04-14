import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper"
import { Navbar } from "@/components/navbar"
import { isAdminEmail } from "@/lib/admin"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has admin access based on email domain
  const isAdmin = isAdminEmail(user.email)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <DashboardWrapper isAdmin={isAdmin}>
          {children}
        </DashboardWrapper>
      </div>
    </div>
  )
}
