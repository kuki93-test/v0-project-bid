-- Seed platform settings with configurable commission rates
INSERT INTO platform_settings (key, value, description) VALUES
  ('buyer_commission_rate', '5', 'Percentage commission charged to buyers on purchases'),
  ('seller_commission_rate', '5', 'Percentage commission charged to sellers on sales'),
  ('min_bid_increment', '1', 'Minimum bid increment in dollars'),
  ('max_auction_duration_days', '30', 'Maximum number of days an auction can run'),
  ('platform_name', 'BidVault', 'Name of the auction platform'),
  ('platform_currency', 'USD', 'Default currency for the platform')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;
