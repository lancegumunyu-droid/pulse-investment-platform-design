-- PULSE Investment Platform - Complete Database Schema
-- Neon PostgreSQL Database
-- Version: 2.4
-- Created: 2026-07-12

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES: USER MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(5),
  date_of_birth DATE,
  status VARCHAR(50) DEFAULT 'active',
  kyc_status VARCHAR(50) DEFAULT 'pending', -- pending, submitted, verified, rejected
  kyc_approved_at TIMESTAMP,
  kyc_approved_by UUID,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  verification_token VARCHAR(255) UNIQUE,
  verification_token_expires TIMESTAMP,
  reset_token VARCHAR(255) UNIQUE,
  reset_token_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  profile_picture_url VARCHAR(500),
  bio TEXT,
  preferred_language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(100),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  device_fingerprint VARCHAR(255),
  last_ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLES: KYC & VERIFICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS kyc_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- passport, drivers_license, national_id
  document_number VARCHAR(100) NOT NULL,
  document_image_url VARCHAR(500),
  selfie_image_url VARCHAR(500),
  address_line_1 VARCHAR(255),
  address_line_2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  submission_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_active_kyc UNIQUE (user_id, submission_status) WHERE submission_status != 'rejected'
);

CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_expires TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  verification_attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLES: WALLET & BALANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(20, 2) DEFAULT 0.00,
  available_balance DECIMAL(20, 2) DEFAULT 0.00,
  pending_balance DECIMAL(20, 2) DEFAULT 0.00,
  welcome_bonus DECIMAL(20, 2) DEFAULT 0.00,
  welcome_bonus_used BOOLEAN DEFAULT FALSE,
  total_deposits DECIMAL(20, 2) DEFAULT 0.00,
  total_withdrawals DECIMAL(20, 2) DEFAULT 0.00,
  total_earnings DECIMAL(20, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'USDT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id),
  type VARCHAR(50) NOT NULL, -- deposit, withdrawal, investment, referral_bonus, welcome_bonus, earning
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, completed, rejected, cancelled
  description TEXT,
  approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  requires_approval BOOLEAN DEFAULT TRUE,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approval_note TEXT,
  reference_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLES: DEPOSITS & WITHDRAWALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  payment_method VARCHAR(50) NOT NULL, -- bank_transfer, crypto, card
  bank_account VARCHAR(100),
  crypto_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, completed, rejected
  admin_approval_status VARCHAR(50) DEFAULT 'pending',
  admin_approved_by UUID REFERENCES users(id),
  admin_approved_at TIMESTAMP,
  admin_approval_note TEXT,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  payment_method VARCHAR(50) NOT NULL, -- bank_transfer, crypto, wallet
  bank_account VARCHAR(100),
  crypto_address VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, processing, completed, rejected
  admin_approval_status VARCHAR(50) DEFAULT 'pending',
  admin_approved_by UUID REFERENCES users(id),
  admin_approved_at TIMESTAMP,
  admin_approval_note TEXT,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================================================
-- TABLES: INVESTMENTS & EARNINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  roi_percentage DECIMAL(5, 2),
  duration_days INT,
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- active, completed, cancelled
  expected_return DECIMAL(20, 2),
  actual_return DECIMAL(20, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID REFERENCES investments(id),
  amount DECIMAL(20, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  earning_type VARCHAR(50) DEFAULT 'roi', -- roi, referral_bonus, welcome_bonus
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLES: REFERRAL PROGRAM
-- ============================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed
  bonus_amount DECIMAL(20, 2) DEFAULT 35.00,
  bonus_awarded BOOLEAN DEFAULT FALSE,
  bonus_awarded_at TIMESTAMP,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_referral UNIQUE (referrer_id, referred_user_id)
);

-- ============================================================================
-- TABLES: ADMIN & OPERATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- admin, manager, reviewer, moderator
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- users, transactions, kyc, deposits, withdrawals
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approval_queues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- kyc, deposit, withdrawal
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, approved, rejected
  assigned_to UUID REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLES: SYSTEM & SECURITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(100) NOT NULL, -- login, logout, failed_login, ip_change, suspicious_activity
  description TEXT,
  ip_address VARCHAR(45),
  device_info JSONB,
  severity VARCHAR(50) DEFAULT 'info', -- info, warning, critical
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  email_type VARCHAR(50) NOT NULL, -- verification, welcome, kya_approved, deposit_request, withdrawal_request, referral_invitation
  subject VARCHAR(255),
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  failure_reason TEXT
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_kyc_submissions_user_id ON kyc_submissions(user_id);
CREATE INDEX idx_kyc_submissions_status ON kyc_submissions(submission_status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_approval_status ON transactions(approval_status);
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_status ON deposits(status);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_approval_queues_status ON approval_queues(status);
CREATE INDEX idx_approval_queues_entity_type ON approval_queues(entity_type);
CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_logs(event_type);

-- ============================================================================
-- CONSTRAINTS & TRIGGERS
-- ============================================================================

-- Update timestamp on user update
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

-- Auto-update wallet balances
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE wallets SET updated_at = CURRENT_TIMESTAMP WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_update_wallet
AFTER UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- ============================================================================

-- Admin user (email: admin@pulse.com)
-- DO NOT RUN IN PRODUCTION - only for development

-- ============================================================================
-- GRANT PERMISSIONS (if using app user)
-- ============================================================================

-- Uncomment and adjust user name for production:
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "app-user";
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO "app-user";
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO "app-user";

COMMIT;
