import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTAFooter() {
  return (
    <>
      <section className="border-t border-border px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Ready to ship faster?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Join thousands of teams already building on Arc. Start for free and scale when you need to.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2 rounded-full px-8">
              Get Started for Free
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              Arc
            </Link>
            <nav className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Status
              </Link>
            </nav>
          </div>
          <p className="text-sm text-muted-foreground">
            {"© 2026 Arc, Inc. All rights reserved."}
          </p>
        </div>
      </footer>
    </>
  )
}
