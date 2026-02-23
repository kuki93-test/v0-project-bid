import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
          <CheckCircle className="h-10 w-10 text-accent" />
        </div>

        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
          Payment Successful!
        </h1>

        <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
          Your purchase has been completed. You can track the status of your purchase in your dashboard. The seller will be notified.
        </p>

        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/dashboard/purchases">View Purchases</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/listings">Continue Browsing</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
