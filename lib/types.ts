export type UserRole = 'buyer' | 'seller'

export type ListingType = 'auction' | 'buy_now' | 'both'

export type ListingStatus = 'draft' | 'active' | 'ended' | 'sold' | 'cancelled'

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  role: UserRole
  email_verified: boolean
  phone_verified: boolean
  is_banned: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface Listing {
  id: string
  seller_id: string
  category_id: string | null
  title: string
  description: string | null
  listing_type: ListingType
  condition: ListingCondition
  starting_price: number
  reserve_price: number | null
  buy_now_price: number | null
  current_bid: number | null
  bid_count: number
  auction_end: string | null
  status: ListingStatus
  location: string | null
  shipping_info: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}

export interface ListingWithDetails extends Listing {
  seller?: Profile
  category?: Category
  images?: ListingImage[]
}

export interface ListingImage {
  id: string
  listing_id: string
  url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Bid {
  id: string
  listing_id: string
  bidder_id: string
  amount: number
  is_winning: boolean
  created_at: string
  bidder?: Profile
}

export interface Transaction {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  amount: number
  buyer_commission: number
  seller_commission: number
  platform_fee: number
  total_buyer_pays: number
  seller_receives: number
  status: TransactionStatus
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  listing_id: string | null
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

export interface PlatformSettings {
  key: string
  value: string
  description: string | null
  updated_at: string
}
