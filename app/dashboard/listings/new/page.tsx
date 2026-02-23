"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Upload, X, ImageIcon, ShieldAlert } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

export default function CreateListingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [verificationChecked, setVerificationChecked] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [listingType, setListingType] = useState("both")
  const [condition, setCondition] = useState("good")
  const [startingPrice, setStartingPrice] = useState("")
  const [buyNowPrice, setBuyNowPrice] = useState("")
  const [duration, setDuration] = useState("7") // days
  const [shippingInfo, setShippingInfo] = useState("")

  useEffect(() => {
    const loadData = async () => {
      // Load categories
      const { data } = await supabase.from("categories").select("id, name, slug").order("name")
      if (data) setCategories(data)

      // Check verification status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email_verified, phone_verified")
          .eq("id", user.id)
          .single()
        setIsVerified(!!profile?.email_verified && !!profile?.phone_verified)
      }
      setVerificationChecked(true)
    }
    loadData()
  }, [supabase])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false })

      if (error) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data: urlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path)

      newUrls.push(urlData.publicUrl)
    }

    setImageUrls((prev) => [...prev, ...newUrls])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString(36)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error("Title is required"); return }
    if (!categoryId) { toast.error("Please select a category"); return }
    if (!startingPrice && listingType !== "buy_now") { toast.error("Starting price is required for auctions"); return }
    if (!buyNowPrice && (listingType === "buy_now" || listingType === "both")) { toast.error("Buy now price is required"); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Not authenticated"); setLoading(false); return }

    const endTime = new Date()
    endTime.setDate(endTime.getDate() + parseInt(duration))

    const slug = generateSlug(title)
    const startPriceCents = Math.round(parseFloat(startingPrice || "0") * 100)
    const buyNowCents = buyNowPrice ? Math.round(parseFloat(buyNowPrice) * 100) : null

    const { data: inserted, error } = await supabase
      .from("listings")
      .insert({
        title: title.trim(),
        slug,
        description: description.trim(),
        category_id: categoryId,
        seller_id: user.id,
        listing_type: listingType,
        condition,
        starting_price: startPriceCents,
        buy_now_price: buyNowCents,
        current_bid: null,
        bid_count: 0,
        auction_end: endTime.toISOString(),
        shipping_info: shippingInfo.trim() || null,
        status: "active",
      })
      .select("id")
      .single()

    if (error || !inserted) {
      toast.error(error?.message || "Failed to create listing")
      setLoading(false)
      return
    }

    // Insert images into listing_images table
    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, i) => ({
        listing_id: inserted.id,
        url,
        display_order: i,
      }))
      await supabase.from("listing_images").insert(imageRows)
    }

    toast.success("Listing created successfully!")
    router.push(`/listings/${slug}`)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground">
        Create New Listing
      </h1>

      {verificationChecked && !isVerified && (
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Verification required</AlertTitle>
          <AlertDescription>
            {"You must verify both your email and phone number before creating listings. "}
            <Link href="/dashboard/profile" className="font-medium underline underline-offset-2">
              Go to Profile Settings
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Describe your item clearly to attract buyers</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Vintage Rolex Submariner 1960s"
                className="mt-1.5"
                maxLength={200}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item in detail - condition, history, specs..."
                className="mt-1.5 min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Condition *</Label>
                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload photos of your item (up to 5)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, i) => (
                <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                  <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {imageUrls.length < 5 && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  <span className="text-xs">{uploading ? "Uploading" : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
            {imageUrls.length === 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-3 w-3" />
                Listings with images get more attention
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing & Duration</CardTitle>
            <CardDescription>Set your listing type, price, and auction duration</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <Label>Listing Type *</Label>
              <Select value={listingType} onValueChange={setListingType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auction">Auction Only</SelectItem>
                  <SelectItem value="buy_now">Buy Now Only</SelectItem>
                  <SelectItem value="both">Auction + Buy Now</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(listingType === "auction" || listingType === "both") && (
                <div>
                  <Label htmlFor="starting-price">Starting Price ($) *</Label>
                  <Input
                    id="starting-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                </div>
              )}
              {(listingType === "buy_now" || listingType === "both") && (
                <div>
                  <Label htmlFor="buy-now-price">Buy Now Price ($) *</Label>
                  <Input
                    id="buy-now-price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={buyNowPrice}
                    onChange={(e) => setBuyNowPrice(e.target.value)}
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>

            {(listingType === "auction" || listingType === "both") && (
              <div>
                <Label>Auction Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="5">5 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="shipping">Shipping Information</Label>
              <Input
                id="shipping"
                value={shippingInfo}
                onChange={(e) => setShippingInfo(e.target.value)}
                placeholder="e.g., Free shipping, Buyer pays shipping"
                className="mt-1.5"
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading || !isVerified} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Listing...
            </>
          ) : !isVerified ? (
            "Verify email & phone to create listing"
          ) : (
            "Create Listing"
          )}
        </Button>
      </form>
    </div>
  )
}
