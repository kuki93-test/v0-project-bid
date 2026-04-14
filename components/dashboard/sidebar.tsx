"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Gavel,
  ShoppingBag,
  Heart,
  User,
  Plus,
  Package,
  DollarSign,
  Shield,
  ShoppingCart,
  Store,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface DashboardSidebarProps {
  isAdmin?: boolean
  mode: "buying" | "selling"
  onModeChange: (mode: "buying" | "selling") => void
}

const buyerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bids", label: "My Bids", icon: Gavel },
  { href: "/dashboard/purchases", label: "Purchases", icon: ShoppingBag },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

const sellerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "My Listings", icon: Package },
  { href: "/dashboard/listings/new", label: "Create Listing", icon: Plus },
  { href: "/dashboard/sales", label: "Sales", icon: DollarSign },
  { href: "/dashboard/profile", label: "Profile", icon: User },
]

export function DashboardSidebar({ isAdmin = false, mode, onModeChange }: DashboardSidebarProps) {
  const pathname = usePathname()
  const links = mode === "selling" ? sellerLinks : buyerLinks

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 flex flex-col gap-1">
        {/* Mode Toggle */}
        <div className="mb-4 rounded-lg border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mode
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => onModeChange("buying")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-md p-2 text-xs font-medium transition-colors",
                mode === "buying"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <ShoppingCart className="h-4 w-4" />
              Buying
            </button>
            <button
              onClick={() => onModeChange("selling")}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-md p-2 text-xs font-medium transition-colors",
                mode === "selling"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Store className="h-4 w-4" />
              Selling
            </button>
          </div>
        </div>

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {mode === "selling" ? "Seller" : "Buyer"} Dashboard
        </p>
        {links.map((link) => {
          const isActive = pathname === link.href || 
            (link.href !== "/dashboard" && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="my-3 h-px bg-border" />
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>
    </aside>
  )
}
