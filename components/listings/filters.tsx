"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, X } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
}

interface ListingsFiltersProps {
  categories: Category[]
}

export function ListingsFilters({ categories }: ListingsFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          current.delete(key)
        } else {
          current.set(key, value)
        }
      })
      return current.toString()
    },
    [searchParams]
  )

  const handleFilter = (key: string, value: string) => {
    const qs = createQueryString({ [key]: value })
    router.push(`${pathname}${qs ? `?${qs}` : ""}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    handleFilter("q", searchQuery)
  }

  const clearFilters = () => {
    setSearchQuery("")
    router.push(pathname)
  }

  const hasFilters = searchParams.toString().length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={searchParams.get("category") || "all"}
          onValueChange={(val) => handleFilter("category", val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("type") || "all"}
          onValueChange={(val) => handleFilter("type", val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="auction">Auction</SelectItem>
            <SelectItem value="buy_now">Buy Now</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("condition") || "all"}
          onValueChange={(val) => handleFilter("condition", val)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="like_new">Like New</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") || "newest"}
          onValueChange={(val) => handleFilter("sort", val)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="ending_soon">Ending Soon</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
