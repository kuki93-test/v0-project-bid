"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2, Save, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export default function AdminCategoriesPage() {
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newIcon, setNewIcon] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug, icon")
      .order("name")

    setCategories(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleAdd = async () => {
    if (!newName.trim() || !newSlug.trim()) {
      toast.error("Name and slug are required")
      return
    }
    setAdding(true)
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      slug: newSlug.trim().toLowerCase().replace(/\s+/g, "-"),
      icon: newIcon.trim() || null,
    })

    if (error) {
      toast.error(error.message || "Failed to add category")
    } else {
      toast.success("Category added")
      setNewName("")
      setNewSlug("")
      setNewIcon("")
      fetchCategories()
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    // Check if category has listings
    const { count } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)

    if (count && count > 0) {
      toast.error(`Cannot delete: ${count} listing(s) use this category`)
      return
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete category")
      return
    }
    toast.success("Category deleted")
    fetchCategories()
  }

  const updateCategory = async (id: string, field: string, value: string) => {
    const { error } = await supabase
      .from("categories")
      .update({ [field]: value })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update")
    } else {
      toast.success("Updated")
      fetchCategories()
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
        Categories
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input
                placeholder="Electronics"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                }}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Slug</Label>
              <Input
                placeholder="electronics"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Icon (optional)</Label>
              <Input
                placeholder="laptop"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gap-2">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet.</p>
          ) : (
            <div className="grid gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <Input
                    defaultValue={cat.name}
                    className="max-w-[200px]"
                    onBlur={(e) => {
                      if (e.target.value !== cat.name) updateCategory(cat.id, "name", e.target.value)
                    }}
                  />
                  <Input
                    defaultValue={cat.slug}
                    className="max-w-[200px]"
                    onBlur={(e) => {
                      if (e.target.value !== cat.slug) updateCategory(cat.id, "slug", e.target.value)
                    }}
                  />
                  <Input
                    defaultValue={cat.icon || ""}
                    placeholder="icon"
                    className="max-w-[120px]"
                    onBlur={(e) => {
                      if (e.target.value !== (cat.icon || "")) updateCategory(cat.id, "icon", e.target.value)
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(cat.id)}
                    className="ml-auto gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
