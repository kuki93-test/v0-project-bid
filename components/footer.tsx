import Link from "next/link"
import { Gavel } from "lucide-react"

const footerLinks = {
  marketplace: [
    { label: "Browse All", href: "/listings" },
    { label: "Auctions", href: "/listings?type=auction" },
    { label: "Buy Now", href: "/listings?type=buy_now" },
    { label: "Categories", href: "/listings" },
  ],
  account: [
    { label: "Sign Up", href: "/auth/sign-up" },
    { label: "Log In", href: "/auth/login" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sell an Item", href: "/dashboard/listings/new" },
  ],
  support: [
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Fees & Commissions", href: "/#fees" },
    { label: "Safety Tips", href: "#" },
    { label: "Contact Us", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Gavel className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
                BidVault
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The trusted online auction platform. Buy and sell with confidence.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Marketplace</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.account.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Support</h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.support.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {"© 2026 BidVault. All rights reserved."}
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
