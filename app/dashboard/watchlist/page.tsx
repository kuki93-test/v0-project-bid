import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WatchlistPage() {
  return (
    <div>
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Watchlist
      </h1>

      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <Heart className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground">Your watchlist is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">Save listings you are interested in to keep track of them</p>
          <Button asChild className="mt-4">
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
