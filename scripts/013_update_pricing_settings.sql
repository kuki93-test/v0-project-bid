-- Remove old commission settings and add new tax/commission structure
DELETE FROM platform_settings WHERE key IN ('buyer_commission_rate', 'seller_commission_rate', 'early_end_fee_pct');

-- Add new pricing settings
INSERT INTO platform_settings (key, value, description)
VALUES 
  ('tax_rate', '20', 'Value added tax percentage'),
  ('commission_rate', '15', 'Platform commission percentage'),
  ('platform_currency', 'EUR', 'Default currency code')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;
