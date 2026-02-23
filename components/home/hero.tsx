import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Users, TrendingUp } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary px-4 py-20 md:py-28">
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-accent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
        {/* Text content */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5">
            <span className="text-xs font-medium text-primary-foreground/80">Trusted Marketplace</span>
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight tracking-tight text-primary-foreground text-balance md:text-5xl lg:text-6xl">
            Buy & Sell with
            <br />
            <span className="text-accent">Confidence</span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-primary-foreground/70">
            The trusted online auction platform with verified users, secure payments, and transparent commissions. Start bidding or list your items today.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="gap-2">
              <Link href="/listings">
                Start Browsing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link href="/auth/sign-up">
                Become a Seller
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Verified Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Fair Commissions</span>
            </div>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative flex-1">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <Image
              src="/images/hero-auction.jpg"
              alt="Premium auction items including vintage watches and collectibles"
              width={600}
              height={400}
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
