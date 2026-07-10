-- ============================================================
-- Pulse Investment Group — full database migration
-- Run once in the Supabase SQL editor or via psql.
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS / DO blocks).
-- ============================================================

-- ──────────────────────────────────────
-- 1. profiles  (extends auth.users)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  role            TEXT NOT NULL DEFAULT 'investor',   -- 'investor' | 'admin'
  kyc_status      TEXT NOT NULL DEFAULT 'none',       -- 'none' | 'pending' | 'verified' | 'rejected'
  wallet_address  TEXT,
  referral_code   TEXT UNIQUE DEFAULT ('PLS-' || upper(substr(gen_random_uuid()::text, 1, 6))),
  tier            INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile row whenever a new user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET email     = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────
-- 2. accounts  (financial balances)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.accounts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cash_balance     NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (cash_balance >= 0),
  invested_balance NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (invested_balance >= 0),
  staked_balance   NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (staked_balance >= 0),
  token_balance    NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (token_balance >= 0),
  pending_yield    NUMERIC(18,8) NOT NULL DEFAULT 0 CHECK (pending_yield >= 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create an account row for every new profile.
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.accounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ──────────────────────────────────────
-- 3. transactions  (immutable ledger)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,       -- deposit | withdrawal | investment | stake | unstake | token_purchase | yield
  amount       NUMERIC(18,8) NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'USD',
  status       TEXT NOT NULL DEFAULT 'pending',   -- pending | completed | failed | cancelled
  reference    TEXT,                              -- NOWPayments payment_id or similar
  meta         JSONB NOT NULL DEFAULT '{}',
  processed_by UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON public.transactions(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_status_type_idx ON public.transactions(status, type);

-- ──────────────────────────────────────
-- 4. holdings  (investment positions)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.holdings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id        TEXT NOT NULL,
  amount            NUMERIC(18,8) NOT NULL CHECK (amount > 0),
  tier              INTEGER NOT NULL DEFAULT 0,
  target_yield_low  NUMERIC(5,2),
  target_yield_high NUMERIC(5,2),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS holdings_user_id_idx ON public.holdings(user_id);

-- ──────────────────────────────────────
-- 5. staking_positions
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staking_positions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount     NUMERIC(18,8) NOT NULL CHECK (amount > 0),
  apy        NUMERIC(5,2) NOT NULL DEFAULT 24.8,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staking_user_id_idx ON public.staking_positions(user_id);

-- ──────────────────────────────────────
-- 6. kyc_submissions
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kyc_submissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  id_number   TEXT NOT NULL,
  date_of_birth DATE,
  country     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kyc_status_idx ON public.kyc_submissions(status);

-- ──────────────────────────────────────
-- 7. governance_votes
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.governance_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposal_id TEXT NOT NULL,
  choice      TEXT NOT NULL,   -- 'for' | 'against' | 'abstain'
  weight      NUMERIC(18,8) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, proposal_id)
);

-- ──────────────────────────────────────
-- 8. admin_allowlist
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────
-- 9. staff_members (team management)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL,
  department      TEXT NOT NULL,              -- 'Operations' | 'Finance' | 'KYC' | 'Support' | 'Development'
  position        TEXT NOT NULL,              -- Job title
  role            TEXT NOT NULL DEFAULT 'staff',  -- 'staff' | 'manager' | 'director'
  status          TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'inactive' | 'suspended'
  permissions     TEXT[] NOT NULL DEFAULT '{}',   -- Array of permission strings
  date_hired      DATE,
  phone           TEXT,
  country         TEXT,
  notes           TEXT,
  created_by      UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_email_idx ON public.staff_members(email);
CREATE INDEX IF NOT EXISTS staff_department_idx ON public.staff_members(department);
CREATE INDEX IF NOT EXISTS staff_status_idx ON public.staff_members(status);

-- ──────────────────────────────────────
-- 10. staff_logs (audit trail for staff)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,              -- 'created' | 'updated' | 'suspended' | 'deleted'
  changes     JSONB NOT NULL DEFAULT '{}', -- What changed
  performed_by UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS staff_logs_staff_id_idx ON public.staff_logs(staff_id);

-- ============================================================
-- Row Level Security
-- All mutation goes through service-role server actions only.
-- Client-side (anon key) can only read their own data.
-- ============================================================

ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_allowlist  ENABLE ROW LEVEL SECURITY;

-- profiles: users can read their own row
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='own profile') THEN
    CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
END $$;

-- accounts: users can read their own row
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='accounts' AND policyname='own account') THEN
    CREATE POLICY "own account" ON public.accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- transactions: users can read their own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='transactions' AND policyname='own transactions') THEN
    CREATE POLICY "own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- holdings: users can read their own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='holdings' AND policyname='own holdings') THEN
    CREATE POLICY "own holdings" ON public.holdings FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- staking_positions: users can read their own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staking_positions' AND policyname='own staking') THEN
    CREATE POLICY "own staking" ON public.staking_positions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- kyc_submissions: users can read their own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kyc_submissions' AND policyname='own kyc') THEN
    CREATE POLICY "own kyc" ON public.kyc_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- governance_votes: users can read their own rows
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='governance_votes' AND policyname='own votes') THEN
    CREATE POLICY "own votes" ON public.governance_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- admin_allowlist: no direct client access (service role only)

-- staff_members: only admins can read all staff, staff can read their own
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_members' AND policyname='admins can read all staff') THEN
    CREATE POLICY "admins can read all staff" ON public.staff_members FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- staff_logs: only admins and affected staff can read
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='staff_logs' AND policyname='staff logs access') THEN
    CREATE POLICY "staff logs access" ON public.staff_logs FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR
      EXISTS (SELECT 1 FROM public.staff_members WHERE id = staff_id AND user_id = auth.uid())
    );
  END IF;
END $$;

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_logs ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────
-- 11. admin_float (admin virtual funds)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_float (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email     TEXT UNIQUE NOT NULL,
  pulse_balance   NUMERIC(18,8) NOT NULL DEFAULT 50000.0,
  usd_balance     NUMERIC(18,8) NOT NULL DEFAULT 10000.0,
  pulse_used      NUMERIC(18,8) NOT NULL DEFAULT 0,
  usd_used        NUMERIC(18,8) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_float_email_idx ON public.admin_float(admin_email);

-- ──────────────────────────────────────
-- 12. p2p_transfers (admin disburse/client transfers)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.p2p_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_admin      TEXT NOT NULL,
  to_client_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(18,8) NOT NULL,
  currency        TEXT NOT NULL,
  transfer_type   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'completed',
  description     TEXT,
  approved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS p2p_transfers_from_idx ON public.p2p_transfers(from_admin);
CREATE INDEX IF NOT EXISTS p2p_transfers_to_idx ON public.p2p_transfers(to_client_id);
CREATE INDEX IF NOT EXISTS p2p_transfers_status_idx ON public.p2p_transfers(status);

-- ──────────────────────────────────────
-- 13. kyc_audit_log (KYC compliance tracking)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kyc_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kyc_id          UUID NOT NULL REFERENCES public.kyc_submissions(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action          TEXT NOT NULL,
  reviewed_by     UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kyc_audit_user_idx ON public.kyc_audit_log(user_id);
CREATE INDEX IF NOT EXISTS kyc_audit_action_idx ON public.kyc_audit_log(action);

-- ──────────────────────────────────────
-- 14. transaction_details (complex transaction tracking)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transaction_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  from_user       UUID REFERENCES public.profiles(id),
  to_user         UUID REFERENCES public.profiles(id),
  meta_json       JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transaction_details_txn_idx ON public.transaction_details(transaction_id);

-- ──────────────────────────────────────
-- 15. deposit_requests (deposit flow tracking)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(18,8) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  payment_method  TEXT,
  reference       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  approved_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS deposits_user_idx ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS deposits_status_idx ON public.deposit_requests(status);

-- ──────────────────────────────────────
-- 16. withdrawal_requests (withdrawal flow with admin approval)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount          NUMERIC(18,8) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  wallet_address  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending',
  approved_by     UUID REFERENCES public.profiles(id),
  approval_date   TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS withdrawals_user_idx ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS withdrawals_status_idx ON public.withdrawal_requests(status);

-- Additional transaction indexes for performance
CREATE INDEX IF NOT EXISTS transactions_created_idx ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_user_type_idx ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS transactions_type_status_idx ON public.transactions(type, status);

-- ============================================================
-- Done.
-- ============================================================
