-- Table to store OTP codes for email and phone verification
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'phone')),
  code text NOT NULL,
  target text NOT NULL, -- the email or phone number
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Users can read their own codes
CREATE POLICY "verification_codes_select_own" ON public.verification_codes
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert codes (via service role or security definer)
CREATE POLICY "verification_codes_insert" ON public.verification_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own codes (mark as used)
CREATE POLICY "verification_codes_update_own" ON public.verification_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Clean up old codes automatically
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_type ON public.verification_codes(user_id, type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.verification_codes(expires_at);
