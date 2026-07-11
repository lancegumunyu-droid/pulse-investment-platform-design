-- Add approval workflow columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejected_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add KYC status column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected'));

-- Add token and balance columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pulse_tokens_balance DECIMAL(18, 2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usd_balance DECIMAL(18, 2) DEFAULT 0;

-- Create admin_approvals table for audit trail
CREATE TABLE IF NOT EXISTS admin_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  admin_id UUID,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'float_topup')),
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT action_check CHECK (action IS NOT NULL)
);

-- Create or update admin_float table
CREATE TABLE IF NOT EXISTS admin_float (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL UNIQUE,
  pulse_tokens_balance DECIMAL(18, 2) DEFAULT 10000,
  usd_balance DECIMAL(18, 2) DEFAULT 10000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Set up RLS policies for approval system
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_approvals_insert" ON admin_approvals
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "admin_approvals_view" ON admin_approvals
  FOR SELECT TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON profiles(email_confirmed);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_user_id ON admin_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_admin_id ON admin_approvals(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_created_at ON admin_approvals(created_at);
