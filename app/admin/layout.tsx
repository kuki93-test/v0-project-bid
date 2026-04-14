import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { isAdminEmail } from "@/lib/admin"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Only @willbieten.net email addresses have admin access
  if (!isAdminEmail(user.email)) redirect("/dashboard")

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-background p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
