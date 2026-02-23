-- Add slug column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS listings_slug_unique ON public.listings(slug);
