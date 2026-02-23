"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Profile {
  id: string
  display_name: string | null
  phone: string | null
  phone_verified: boolean
  email_verified: boolean
  role: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
        setDisplayName(data.display_name || "")
        setPhone(data.phone || "")
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        phone,
      })
      .eq("id", profile.id)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      toast.success("Profile updated")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Profile Settings
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Info</CardTitle>
          <CardDescription>Your account details and verification status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Role:</span>
            <Badge variant="outline" className="capitalize">{profile?.role}</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Email:</span>
            <Badge variant={profile?.email_verified ? "default" : "secondary"}>
              {profile?.email_verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Phone:</span>
            <Badge variant={profile?.phone_verified ? "default" : "secondary"}>
              {profile?.phone_verified ? "Verified" : "Not Verified"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your display name and contact information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="mt-1.5"
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
