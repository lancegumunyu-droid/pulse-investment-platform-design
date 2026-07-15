-- =============================================================================
-- PULSE SECURITY MIGRATION
-- Purpose: Enable RLS on all tables, define roles, create SECURITY DEFINER
--          functions for every balance-mutating operation.
--          Clients can NEVER touch wallets/balances directly.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. ROLES
-- ---------------------------------------------------------------------------
-- We use two Postgres roles beyond the owner:
--   authenticated  → every signed-in user (app passes their user_id via JWT claim)
--   service_role   → our Next.js server / Edge Functions (bypasses RLS)
-- If these roles already exist the CREATE OR REPLACE is a no-op on the role itself.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
END $$;

-- Grant connect / usage so the roles can actually reach the schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- ---------------------------------------------------------------------------
-- 1. ENABLE RLS ON ALL TABLES (force = true so even owner is checked)
-- ---------------------------------------------------------------------------
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queues      ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications  ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. REVOKE ALL direct table privileges from clients
--    (neondb_owner keeps full access; service_role bypasses RLS via BYPASSRLS)
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- Re-grant narrow SELECT only where clients need it
GRANT SELECT ON users               TO authenticated;
GRANT SELECT ON user_profiles       TO authenticated;
GRANT SELECT ON wallets             TO authenticated;
GRANT SELECT ON transactions        TO authenticated;
GRANT SELECT ON deposits            TO authenticated;
GRANT SELECT ON withdrawals         TO authenticated;
GRANT SELECT ON investments         TO authenticated;
GRANT SELECT ON earnings            TO authenticated;
GRANT SELECT ON referrals           TO authenticated;

-- Clients may INSERT their own deposit/withdrawal REQUEST rows only (no UPDATE)
GRANT INSERT ON deposits    TO authenticated;
GRANT INSERT ON withdrawals TO authenticated;
GRANT INSERT ON investments TO authenticated;

-- No client can ever touch these:
-- wallets, transactions (balance ledger), admin_users, approval_queues,
-- audit_logs, security_logs, email_logs, email_verifications
-- → already REVOKED above; only service_role/owner can touch them.

-- ---------------------------------------------------------------------------
-- 3. ROW-LEVEL SECURITY POLICIES
-- ---------------------------------------------------------------------------

-- ---- users ----
DROP POLICY IF EXISTS users_select_own   ON users;
CREATE POLICY users_select_own ON users
  FOR SELECT TO authenticated
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- ---- user_profiles ----
DROP POLICY IF EXISTS profiles_select_own ON user_profiles;
CREATE POLICY profiles_select_own ON user_profiles
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---- wallets: read own only, ZERO writes from clients ----
DROP POLICY IF EXISTS wallets_select_own ON wallets;
CREATE POLICY wallets_select_own ON wallets
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---- transactions: read own only ----
DROP POLICY IF EXISTS txn_select_own ON transactions;
CREATE POLICY txn_select_own ON transactions
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---- deposits: read own, insert own request (pending only) ----
DROP POLICY IF EXISTS dep_select_own    ON deposits;
DROP POLICY IF EXISTS dep_insert_own    ON deposits;
CREATE POLICY dep_select_own ON deposits
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
CREATE POLICY dep_insert_own ON deposits
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
    AND status = 'pending'
    AND approval_status = 'pending'
    AND admin_approval_status IS NULL      -- cannot pre-approve themselves
    AND approved_by IS NULL
    AND approved_at IS NULL
  );

-- ---- withdrawals: read own, insert own request (pending only) ----
DROP POLICY IF EXISTS wd_select_own  ON withdrawals;
DROP POLICY IF EXISTS wd_insert_own  ON withdrawals;
CREATE POLICY wd_select_own ON withdrawals
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
CREATE POLICY wd_insert_own ON withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
    AND status = 'pending'
    AND approval_status = 'pending'
    AND approved_by IS NULL
    AND approved_at IS NULL
  );

-- ---- investments: read own, insert own ----
DROP POLICY IF EXISTS inv_select_own ON investments;
DROP POLICY IF EXISTS inv_insert_own ON investments;
CREATE POLICY inv_select_own ON investments
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
CREATE POLICY inv_insert_own ON investments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
    AND status = 'pending'
  );

-- ---- earnings: read own only ----
DROP POLICY IF EXISTS earn_select_own ON earnings;
CREATE POLICY earn_select_own ON earnings
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---- referrals: read own only ----
DROP POLICY IF EXISTS ref_select_own ON referrals;
CREATE POLICY ref_select_own ON referrals
  FOR SELECT TO authenticated
  USING (
    referrer_id  = current_setting('app.current_user_id', true)::uuid OR
    referred_user_id = current_setting('app.current_user_id', true)::uuid
  );

-- ---- admin_users: ZERO client access ----
-- No policies = no rows returned to authenticated/anon (RLS blocks all)

-- ---- approval_queues, audit_logs, security_logs, email_logs: server only ----
-- No policies = blocked for clients

-- ---- email_verifications: select own (for verify flow) ----
DROP POLICY IF EXISTS ev_select_own ON email_verifications;
CREATE POLICY ev_select_own ON email_verifications
  FOR SELECT TO authenticated
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- ---------------------------------------------------------------------------
-- 4. SECURITY DEFINER FUNCTIONS — the ONLY way balances can change
--    These run as neondb_owner (definer), bypass RLS, and enforce business
--    rules before touching wallets or transactions.
-- ---------------------------------------------------------------------------

-- 4a. approve_deposit
--     Called only by server/admin. Credits wallet after admin approval.
CREATE OR REPLACE FUNCTION approve_deposit(
  p_deposit_id  uuid,
  p_admin_id    uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit  deposits%ROWTYPE;
  v_wallet   wallets%ROWTYPE;
BEGIN
  -- Lock deposit row
  SELECT * INTO v_deposit FROM deposits
  WHERE id = p_deposit_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Deposit not found');
  END IF;
  IF v_deposit.approval_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Deposit is not pending');
  END IF;

  -- Verify admin
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = p_admin_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;

  -- Update deposit status
  UPDATE deposits SET
    approval_status      = 'approved',
    status               = 'completed',
    approved_by          = p_admin_id,
    approved_at          = now(),
    admin_approval_status= 'approved',
    admin_approved_by    = p_admin_id,
    admin_approved_at    = now(),
    updated_at           = now()
  WHERE id = p_deposit_id;

  -- Credit wallet (upsert safe)
  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_deposit.user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, balance, available_balance, pending_balance,
                         total_deposits, currency, created_at, updated_at)
    VALUES (v_deposit.user_id, v_deposit.amount, v_deposit.amount, 0,
            v_deposit.amount, v_deposit.currency, now(), now());
  ELSE
    UPDATE wallets SET
      balance           = balance           + v_deposit.amount,
      available_balance = available_balance + v_deposit.amount,
      total_deposits    = total_deposits    + v_deposit.amount,
      updated_at        = now()
    WHERE user_id = v_deposit.user_id;
  END IF;

  -- Write immutable ledger entry
  INSERT INTO transactions
    (user_id, type, amount, currency, status, description,
     approval_status, requires_approval, approved_at, approved_by,
     reference_id, created_at, updated_at)
  VALUES
    (v_deposit.user_id, 'deposit', v_deposit.amount, v_deposit.currency,
     'completed', 'Deposit approved by admin',
     'approved', false, now(), p_admin_id,
     p_deposit_id::text, now(), now());

  -- Audit
  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'approve_deposit', 'deposit', p_deposit_id,
          jsonb_build_object('amount', v_deposit.amount, 'user_id', v_deposit.user_id),
          now());

  RETURN jsonb_build_object('ok', true, 'amount', v_deposit.amount);
END;
$$;

-- 4b. reject_deposit
CREATE OR REPLACE FUNCTION reject_deposit(
  p_deposit_id     uuid,
  p_admin_id       uuid,
  p_reason         text DEFAULT 'Rejected by admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deposit deposits%ROWTYPE;
BEGIN
  SELECT * INTO v_deposit FROM deposits WHERE id = p_deposit_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Deposit not found'); END IF;
  IF v_deposit.approval_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Deposit is not pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;

  UPDATE deposits SET
    approval_status      = 'rejected',
    status               = 'rejected',
    rejected_by          = p_admin_id,
    rejected_at          = now(),
    rejection_reason     = p_reason,
    admin_approval_status= 'rejected',
    updated_at           = now()
  WHERE id = p_deposit_id;

  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'reject_deposit', 'deposit', p_deposit_id,
          jsonb_build_object('reason', p_reason, 'user_id', v_deposit.user_id), now());

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 4c. approve_withdrawal
--     Deducts balance and marks withdrawal complete.
CREATE OR REPLACE FUNCTION approve_withdrawal(
  p_withdrawal_id  uuid,
  p_admin_id       uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wd     withdrawals%ROWTYPE;
  v_wallet wallets%ROWTYPE;
BEGIN
  SELECT * INTO v_wd FROM withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Withdrawal not found'); END IF;
  IF v_wd.approval_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Withdrawal is not pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = v_wd.user_id FOR UPDATE;
  IF v_wallet.available_balance < v_wd.amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Insufficient balance');
  END IF;

  -- Deduct
  UPDATE wallets SET
    balance           = balance           - v_wd.amount,
    available_balance = available_balance - v_wd.amount,
    total_withdrawals = total_withdrawals + v_wd.amount,
    updated_at        = now()
  WHERE user_id = v_wd.user_id;

  UPDATE withdrawals SET
    approval_status      = 'approved',
    status               = 'completed',
    approved_by          = p_admin_id,
    approved_at          = now(),
    admin_approval_status= 'approved',
    admin_approved_by    = p_admin_id,
    admin_approved_at    = now(),
    updated_at           = now()
  WHERE id = p_withdrawal_id;

  INSERT INTO transactions
    (user_id, type, amount, currency, status, description,
     approval_status, requires_approval, approved_at, approved_by,
     reference_id, created_at, updated_at)
  VALUES
    (v_wd.user_id, 'withdrawal', v_wd.amount, v_wd.currency,
     'completed', 'Withdrawal approved by admin',
     'approved', false, now(), p_admin_id,
     p_withdrawal_id::text, now(), now());

  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'approve_withdrawal', 'withdrawal', p_withdrawal_id,
          jsonb_build_object('amount', v_wd.amount, 'user_id', v_wd.user_id), now());

  RETURN jsonb_build_object('ok', true, 'amount', v_wd.amount);
END;
$$;

-- 4d. reject_withdrawal — unlocks funds
CREATE OR REPLACE FUNCTION reject_withdrawal(
  p_withdrawal_id  uuid,
  p_admin_id       uuid,
  p_reason         text DEFAULT 'Rejected by admin'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_wd withdrawals%ROWTYPE;
BEGIN
  SELECT * INTO v_wd FROM withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'Withdrawal not found'); END IF;
  IF v_wd.approval_status <> 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Withdrawal is not pending');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;

  -- Return locked funds to available balance
  UPDATE wallets SET
    available_balance = available_balance + v_wd.amount,
    pending_balance   = GREATEST(pending_balance - v_wd.amount, 0),
    updated_at        = now()
  WHERE user_id = v_wd.user_id;

  UPDATE withdrawals SET
    approval_status      = 'rejected',
    status               = 'rejected',
    rejected_by          = p_admin_id,
    rejected_at          = now(),
    rejection_reason     = p_reason,
    admin_approval_status= 'rejected',
    updated_at           = now()
  WHERE id = p_withdrawal_id;

  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'reject_withdrawal', 'withdrawal', p_withdrawal_id,
          jsonb_build_object('reason', p_reason, 'amount', v_wd.amount, 'user_id', v_wd.user_id), now());

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 4e. admin_credit — owner manually credits a user (admin float / bonuses)
CREATE OR REPLACE FUNCTION admin_credit(
  p_admin_id   uuid,
  p_user_id    uuid,
  p_amount     numeric,
  p_reason     text DEFAULT 'Admin credit'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Amount must be positive');
  END IF;

  UPDATE wallets SET
    balance           = balance           + p_amount,
    available_balance = available_balance + p_amount,
    updated_at        = now()
  WHERE user_id = p_user_id;

  INSERT INTO transactions
    (user_id, type, amount, currency, status, description,
     approval_status, requires_approval, approved_at, approved_by, created_at, updated_at)
  VALUES
    (p_user_id, 'credit', p_amount, 'USD', 'completed', p_reason,
     'approved', false, now(), p_admin_id, now(), now());

  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'admin_credit', 'wallet', p_user_id,
          jsonb_build_object('amount', p_amount, 'reason', p_reason), now());

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 4f. admin_debit
CREATE OR REPLACE FUNCTION admin_debit(
  p_admin_id   uuid,
  p_user_id    uuid,
  p_amount     numeric,
  p_reason     text DEFAULT 'Admin adjustment'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_wallet wallets%ROWTYPE;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE user_id = p_admin_id AND is_active = true) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Not authorised');
  END IF;

  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  IF v_wallet.available_balance < p_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Insufficient balance');
  END IF;

  UPDATE wallets SET
    balance           = balance           - p_amount,
    available_balance = available_balance - p_amount,
    updated_at        = now()
  WHERE user_id = p_user_id;

  INSERT INTO transactions
    (user_id, type, amount, currency, status, description,
     approval_status, requires_approval, approved_at, approved_by, created_at, updated_at)
  VALUES
    (p_user_id, 'debit', p_amount, 'USD', 'completed', p_reason,
     'approved', false, now(), p_admin_id, now(), now());

  INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes, created_at)
  VALUES (p_admin_id, 'admin_debit', 'wallet', p_user_id,
          jsonb_build_object('amount', p_amount, 'reason', p_reason), now());

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 4g. check_device_fingerprint
--     Returns whether this fingerprint already has a verified account.
--     Safe to call from the client — read-only, no sensitive data exposed.
CREATE OR REPLACE FUNCTION check_device_fingerprint(p_fingerprint text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM user_profiles up
  JOIN users u ON u.id = up.user_id
  WHERE up.device_fingerprint = p_fingerprint
    AND u.email_verified = true
    AND u.status <> 'banned';

  RETURN jsonb_build_object(
    'exists', v_count > 0,
    'count',  v_count
  );
END;
$$;

-- Grant execute on functions to authenticated role
GRANT EXECUTE ON FUNCTION check_device_fingerprint(text) TO authenticated;
-- All other functions are server-only (called via service connection string, not client JWT)
REVOKE ALL ON FUNCTION approve_deposit(uuid, uuid)          FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION reject_deposit(uuid, uuid, text)     FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION approve_withdrawal(uuid, uuid)       FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION reject_withdrawal(uuid, uuid, text)  FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION admin_credit(uuid, uuid, numeric, text) FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION admin_debit(uuid, uuid, numeric, text)  FROM PUBLIC, authenticated, anon;

-- ---------------------------------------------------------------------------
-- 5. DEVICE FINGERPRINT TABLE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS device_signups (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash  text NOT NULL,       -- SHA-256 of the client fingerprint
  user_id           uuid REFERENCES users(id) ON DELETE CASCADE,
  signup_at         timestamptz NOT NULL DEFAULT now(),
  ip_address        text,
  blocked           boolean NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_signups_fingerprint
  ON device_signups (fingerprint_hash);

CREATE INDEX IF NOT EXISTS idx_device_signups_user
  ON device_signups (user_id);

ALTER TABLE device_signups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON device_signups FROM anon, authenticated;
-- Only service_role/owner can read/write device_signups

-- ---------------------------------------------------------------------------
-- 6. AUDIT TRIGGER on wallets — log every balance change automatically
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_wallet_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.balance IS DISTINCT FROM NEW.balance OR
                            OLD.available_balance IS DISTINCT FROM NEW.available_balance) THEN
    INSERT INTO audit_logs (action, entity_type, entity_id, changes, created_at)
    VALUES (
      'wallet_balance_changed',
      'wallet',
      NEW.id,
      jsonb_build_object(
        'old_balance', OLD.balance,
        'new_balance', NEW.balance,
        'old_available', OLD.available_balance,
        'new_available', NEW.available_balance,
        'delta', NEW.balance - OLD.balance
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wallet_audit_trigger ON wallets;
CREATE TRIGGER wallet_audit_trigger
  AFTER UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION trg_wallet_audit();
