"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { User, LogOut, LayoutDashboard, Gavel, Menu, Search } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const userRole = user?.user_metadata?.role as string | undefined

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gavel className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-foreground">
              BidVault
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/listings" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Browse
            </Link>
            <Link href="/listings?type=auction" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Auctions
            </Link>
            <Link href="/listings?type=buy_now" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Buy Now
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/listings" className="hidden md:flex">
            <Button variant="ghost" size="icon" aria-label="Search listings">
              <Search className="h-4 w-4" />
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm md:inline">{user.email?.split("@")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {userRole === "seller" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/listings/new" className="flex items-center gap-2">
                        <Gavel className="h-4 w-4" />
                        Create Listing
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                <Link href="/listings" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                  Browse All
                </Link>
                <Link href="/listings?type=auction" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                  Auctions
                </Link>
                <Link href="/listings?type=buy_now" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                  Buy Now
                </Link>
                <div className="my-2 h-px bg-border" />
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                      Dashboard
                    </Link>
                    <button onClick={() => { handleSignOut(); setOpen(false) }} className="text-left text-sm font-medium text-destructive">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                      Log In
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
