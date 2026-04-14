-- Add account_type to differentiate personal vs company accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'company'));

-- Add company-specific fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_registration_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_registration_doc_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_swift_code TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_status TEXT DEFAULT 'pending' CHECK (company_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_rejection_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_reviewed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_reviewed_by UUID REFERENCES profiles(id);

-- Update verification fields for personal accounts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_company_status ON profiles(company_status) WHERE account_type = 'company';
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON profiles(account_type);
