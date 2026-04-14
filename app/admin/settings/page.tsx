"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Save, Loader2 } from "lucide-react"

interface Setting {
  key: string
  value: string
  description: string | null
}

const settingLabels: Record<string, { label: string; description: string; suffix: string }> = {
  tax_rate: { label: "Tax Rate", description: "Value added tax percentage charged on each purchase", suffix: "%" },
  commission_rate: { label: "Commission Rate", description: "Platform commission percentage charged on each purchase", suffix: "%" },
  platform_currency: { label: "Platform Currency", description: "Default currency code for listings (e.g., EUR, USD)", suffix: "" },
}

export default function AdminSettingsPage() {
  const supabase = createClient()
  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("platform_settings")
      .select("key, value, description")
      .order("key")

    if (data) {
      setSettings(data)
      const vals: Record<string, string> = {}
      data.forEach((s) => { vals[s.key] = s.value })
      setValues(vals)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const setting of settings) {
        const newValue = values[setting.key]
        if (newValue !== setting.value) {
          const { error } = await supabase
            .from("platform_settings")
            .update({ value: newValue })
            .eq("key", setting.key)

          if (error) throw error
        }
      }
      toast.success("Settings saved successfully")
      fetchSettings()
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          Platform Settings
        </h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          Platform Settings
        </h1>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-4">
        {settings.map((setting) => {
          const meta = settingLabels[setting.key] || {
            label: setting.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            description: setting.description || "",
            suffix: "",
          }
          return (
            <Card key={setting.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 max-w-xs">
                  <Input
                    value={values[setting.key] || ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [setting.key]: e.target.value }))}
                  />
                  {meta.suffix && (
                    <Label className="text-sm text-muted-foreground">{meta.suffix}</Label>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
