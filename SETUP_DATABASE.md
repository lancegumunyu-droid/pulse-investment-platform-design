# PULSE Platform - Database Setup Instructions

## IMPORTANT: Execute This Before Going Live

Your Pulse Investment Platform requires database schema updates to enable the complete admin approval system.

---

## Step 1: Go to Supabase Console

1. Navigate to: https://supabase.com/dashboard
2. Select your Pulse project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

---

## Step 2: Copy and Execute Migration

Copy the entire content below and paste into the SQL Editor:

```sql
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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_float table
CREATE TABLE IF NOT EXISTS admin_float (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL UNIQUE,
  pulse_tokens_balance DECIMAL(18, 2) DEFAULT 10000,
  usd_balance DECIMAL(18, 2) DEFAULT 10000,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_approvals ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON profiles(email_confirmed);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_user_id ON admin_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_approvals_admin_id ON admin_approvals(admin_id);
```

Click the "Run" button (or press Ctrl+Enter)

---

## Step 3: Create Admin Accounts

Still in SQL Editor, create admin user accounts:

```sql
-- Create main admin account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'admin@pulse.com',
  crypt('PulseAdmin@2024!Secure', gen_salt('bf')),
  NOW()
);

-- Create manager admin account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'manager@pulse.com',
  crypt('Manager@Pulse#2024Secure', gen_salt('bf')),
  NOW()
);
```

---

## Step 4: Create Admin Profiles

```sql
-- Get the IDs from the newly created users (run separately)
SELECT id, email FROM auth.users WHERE email IN ('admin@pulse.com', 'manager@pulse.com');

-- Then create their profiles (replace UUID values with actual IDs):
INSERT INTO profiles (id, full_name, email, is_admin, approval_status, email_confirmed)
VALUES 
  ('ADMIN_UUID_HERE', 'Main Admin', 'admin@pulse.com', true, 'approved', true),
  ('MANAGER_UUID_HERE', 'Approval Manager', 'manager@pulse.com', true, 'approved', true);

-- Create their admin floats
INSERT INTO admin_float (admin_id, pulse_tokens_balance, usd_balance)
VALUES 
  ('ADMIN_UUID_HERE', 10000, 10000),
  ('MANAGER_UUID_HERE', 10000, 10000);
```

---

## Step 5: Verify Setup

Run this query to verify everything is working:

```sql
SELECT 
  id, 
  email, 
  approval_status, 
  email_confirmed, 
  pulse_tokens_balance,
  kyc_status
FROM profiles
LIMIT 10;
```

---

## What This Does

- Adds approval workflow columns to user profiles
- Creates admin audit trail table
- Sets up admin float management (USD + PULSE tokens)
- Enables KYC status tracking
- Creates performance indexes
- Establishes Row Level Security

---

## Admin Login Credentials

After setup, admins can login at: `/admin/login`

**Main Admin:**
- Email: admin@pulse.com
- Password: PulseAdmin@2024!Secure

**Approval Manager:**
- Email: manager@pulse.com
- Password: Manager@Pulse#2024Secure

---

## Next Steps

1. Execute migration above
2. Create admin accounts
3. Verify schema with final query
4. Test admin login at `/admin/login`
5. Deploy to production

Your Pulse platform is ready for launch!
