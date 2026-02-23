-- Add early end fee setting
INSERT INTO platform_settings (key, value, description) VALUES
  ('early_end_fee_rate', '2', 'Percentage fee charged to sellers for ending an auction early')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, description = EXCLUDED.description;
