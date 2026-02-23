-- Add ended_early to the listing_status enum
ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'ended_early';
