import { createClient } from "@/lib/supabase/server"

export interface PlatformSettings {
  tax_rate: number
  commission_rate: number
  min_bid_increment: number
  max_auction_duration_days: number
  platform_name: string
  platform_currency: string
}

const DEFAULTS: PlatformSettings = {
  tax_rate: 20,
  commission_rate: 15,
  min_bid_increment: 1,
  max_auction_duration_days: 30,
  platform_name: "Willbieten GmbH",
  platform_currency: "EUR",
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
    tax_rate: parseFloat(map.tax_rate ?? String(DEFAULTS.tax_rate)),
    commission_rate: parseFloat(map.commission_rate ?? String(DEFAULTS.commission_rate)),
    min_bid_increment: parseFloat(map.min_bid_increment ?? String(DEFAULTS.min_bid_increment)),
    max_auction_duration_days: parseInt(map.max_auction_duration_days ?? String(DEFAULTS.max_auction_duration_days)),
    platform_name: map.platform_name ?? DEFAULTS.platform_name,
    platform_currency: map.platform_currency ?? DEFAULTS.platform_currency,
  }
}
