import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/home/hero"
import { CategoryGrid } from "@/components/home/category-grid"
import { FeaturedListings } from "@/components/home/featured-listings"
import { HowItWorks } from "@/components/home/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedListings />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
