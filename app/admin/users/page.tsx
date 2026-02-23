"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Search, Ban, CheckCircle, Shield, ShieldOff } from "lucide-react"

interface UserProfile {
  id: string
  display_name: string | null
  role: string | null
  phone: string | null
  email_verified: boolean
  phone_verified: boolean
  is_admin: boolean
  banned: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("profiles")
      .select("id, display_name, role, phone, email_verified, phone_verified, is_admin, banned, created_at")
      .order("created_at", { ascending: false })

    if (search.trim()) {
      query = query.ilike("display_name", `%${search.trim()}%`)
    }

    const { data } = await query.limit(50)
    setUsers(data || [])
    setLoading(false)
  }, [supabase, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleBan = async (userId: string, currentBanned: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ banned: !currentBanned })
      .eq("id", userId)

    if (error) {
      toast.error("Failed to update user")
      return
    }
    toast.success(currentBanned ? "User unbanned" : "User banned")
    fetchUsers()
  }

  const toggleAdmin = async (userId: string, currentAdmin: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: !currentAdmin })
      .eq("id", userId)

    if (error) {
      toast.error("Failed to update admin status")
      return
    }
    toast.success(currentAdmin ? "Admin access removed" : "Admin access granted")
    fetchUsers()
  }

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
        User Management
      </h1>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={fetchUsers}>Search</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Verified</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{user.display_name || "Unnamed"}</span>
                          {user.is_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="capitalize">{user.role || "N/A"}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={user.email_verified ? "default" : "destructive"} className="text-xs">
                            {user.email_verified ? "Email" : "No Email"}
                          </Badge>
                          <Badge variant={user.phone_verified ? "default" : "destructive"} className="text-xs">
                            {user.phone_verified ? "Phone" : "No Phone"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3">
                        {user.banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-300">Active</Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={user.banned ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => toggleBan(user.id, user.banned)}
                            className="gap-1"
                          >
                            {user.banned ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                            {user.banned ? "Unban" : "Ban"}
                          </Button>
                          <Button
                            variant={user.is_admin ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleAdmin(user.id, user.is_admin)}
                            className="gap-1"
                          >
                            {user.is_admin ? <ShieldOff className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                            {user.is_admin ? "Remove Admin" : "Make Admin"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
