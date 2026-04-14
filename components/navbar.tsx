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
import { User, LogOut, LayoutDashboard, Gavel, Menu, Search, Bell } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; is_read: boolean; created_at: string; listing_id: string | null }>>([])
  const [unreadCount, setUnreadCount] = useState(0)

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

  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); return }
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at, listing_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [user, supabase])

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
              Willbieten
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

          {user && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 py-1 text-xs"
                      onClick={async () => {
                        const ids = notifications.filter(n => !n.is_read).map(n => n.id)
                        for (const id of ids) {
                          await supabase.from("notifications").update({ is_read: true }).eq("id", id)
                        }
                        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                        setUnreadCount(0)
                      }}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <Link
                        key={n.id}
                        href="/dashboard/bids"
                        className={`flex flex-col gap-1 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/50 ${!n.is_read ? "bg-primary/5" : ""}`}
                        onClick={async () => {
                          if (!n.is_read) {
                            await supabase.from("notifications").update({ is_read: true }).eq("id", n.id)
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x))
                            setUnreadCount(prev => Math.max(0, prev - 1))
                          }
                        }}
                      >
                        <p className={`text-xs font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60">{new Date(n.created_at).toLocaleString()}</p>
                      </Link>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}

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
