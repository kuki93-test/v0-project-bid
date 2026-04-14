import { createClient } from "@/lib/supabase/server"

export interface PlatformSettings {
  buyer_commission_rate: number
  seller_commission_rate: number
  min_bid_increment: number
  max_auction_duration_days: number
  platform_name: string
  platform_currency: string
  early_end_fee_pct: number
}

const DEFAULTS: PlatformSettings = {
  buyer_commission_rate: 5,
  seller_commission_rate: 5,
  min_bid_increment: 1,
  max_auction_duration_days: 30,
  platform_name: "Willbieten GmbH",
  platform_currency: "USD",
  early_end_fee_pct: 2,
}

export async function getSettings(): Promise<PlatformSettings> {
  const supabase = await createClient()
  const { data } = await supabase.from("platform_settings").select("key, value")

  if (!data || data.length === 0) return DEFAULTS

  const map: Record<string, string> = {}
  for (const row of data) {
    map[row.key] = row.value
  }

  return {
    buyer_commission_rate: parseFloat(map.buyer_commission_rate ?? String(DEFAULTS.buyer_commission_rate)),
    seller_commission_rate: parseFloat(map.seller_commission_rate ?? String(DEFAULTS.seller_commission_rate)),
    min_bid_increment: parseFloat(map.min_bid_increment ?? String(DEFAULTS.min_bid_increment)),
    max_auction_duration_days: parseInt(map.max_auction_duration_days ?? String(DEFAULTS.max_auction_duration_days)),
    platform_name: map.platform_name ?? DEFAULTS.platform_name,
    platform_currency: map.platform_currency ?? DEFAULTS.platform_currency,
    early_end_fee_pct: parseFloat(map.early_end_fee_pct ?? String(DEFAULTS.early_end_fee_pct)),
  }
}
