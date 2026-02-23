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
} from "lucide-react"

interface DashboardSidebarProps {
  role: string
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

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const links = role === "seller" ? sellerLinks : buyerLinks

  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <nav className="sticky top-24 flex flex-col gap-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {role === "seller" ? "Seller" : "Buyer"} Dashboard
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
      </nav>
    </aside>
  )
}
