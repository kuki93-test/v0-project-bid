"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, Gavel, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"

interface ListingCardProps {
  id: string
  title: string
  slug: string
  imageUrl: string | null
  currentPrice: number
  buyNowPrice: number | null
  listingType: "auction" | "buy_now" | "both"
  endTime: string
  bidCount: number
  condition: string
  categoryName?: string
}

function getTimeRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now()
  if (diff <= 0) return "Ended"
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

export function ListingCard({
  id,
  title,
  slug,
  imageUrl,
  currentPrice,
  buyNowPrice,
  listingType,
  endTime,
  bidCount,
  condition,
  categoryName,
}: ListingCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime))
  const isEnded = timeLeft === "Ended"

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(endTime))
    }, 30000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <Link
      href={`/listings/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Gavel className="h-10 w-10" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {listingType === "auction" || listingType === "both" ? (
            <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
              <Gavel className="h-3 w-3" />
              Auction
            </Badge>
          ) : null}
          {listingType === "buy_now" || listingType === "both" ? (
            <Badge variant="secondary" className="gap-1">
              <ShoppingCart className="h-3 w-3" />
              Buy Now
            </Badge>
          ) : null}
        </div>

        {/* Timer */}
        {!isEnded && (listingType === "auction" || listingType === "both") && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-foreground/80 px-2 py-1 text-xs font-medium text-background">
            <Clock className="h-3 w-3" />
            {timeLeft}
          </div>
        )}
        {isEnded && (
          <div className="absolute bottom-2 right-2 rounded-md bg-destructive/90 px-2 py-1 text-xs font-medium text-primary-foreground">
            Ended
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {categoryName && (
            <span className="text-xs text-muted-foreground">{categoryName}</span>
          )}
          <span className="text-xs capitalize text-muted-foreground">{condition}</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">
              {listingType === "buy_now" ? "Price" : "Current Bid"}
            </p>
            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
              {formatCurrency(currentPrice)}
            </p>
          </div>
          {(listingType === "auction" || listingType === "both") && (
            <p className="text-xs text-muted-foreground">
              {bidCount} {bidCount === 1 ? "bid" : "bids"}
            </p>
          )}
        </div>

        {buyNowPrice && (listingType === "both") && (
          <p className="text-xs text-accent font-medium">
            {"Buy Now: "}{formatCurrency(buyNowPrice)}
          </p>
        )}
      </div>
    </Link>
  )
}
