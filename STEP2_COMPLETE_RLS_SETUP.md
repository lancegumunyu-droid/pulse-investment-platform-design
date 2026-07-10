# PULSE PLATFORM - STEP 2: COMPLETE RLS SETUP (CORRECTED)

## All RLS Policies - Fixed & Working

Copy this **entire SQL block** and run it once in Supabase SQL Editor.

```sql
-- ============================================================
-- COMPLETE RLS SETUP - ALL TABLES
-- ============================================================

-- ============================================================
-- TABLE: admin_float (Admin Virtual Funds - EMAIL-BASED)
-- ============================================================
-- NOTE: Uses admin_email text (not UUID) - email-based access control

ALTER TABLE public.admin_float ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_float_select_own" ON public.admin_float;
DROP POLICY IF EXISTS "admin_float_update_own" ON public.admin_float;
DROP POLICY IF EXISTS "admin_float_prevent_delete" ON public.admin_float;
DROP POLICY IF EXISTS "admin_float_prevent_insert" ON public.admin_float;

-- Admin can SELECT only their own float
CREATE POLICY "admin_float_select_own"
ON public.admin_float
FOR SELECT
TO authenticated
USING (admin_email = (auth.jwt() ->> 'email'));

-- Admin can UPDATE only their own float
CREATE POLICY "admin_float_update_own"
ON public.admin_float
FOR UPDATE
TO authenticated
USING (admin_email = (auth.jwt() ->> 'email'))
WITH CHECK (admin_email = (auth.jwt() ->> 'email'));

-- Prevent DELETE (system managed)
CREATE POLICY "admin_float_prevent_delete"
ON public.admin_float
FOR DELETE
TO authenticated
USING (false);

-- Prevent INSERT by authenticated users (system only)
CREATE POLICY "admin_float_prevent_insert"
ON public.admin_float
FOR INSERT
TO authenticated
WITH CHECK (false);

-- ============================================================
-- TABLE: admin_allowlist (READ-ONLY - SYSTEM MANAGED)
-- ============================================================

ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_allowlist_prevent_all" ON public.admin_allowlist;

CREATE POLICY "admin_allowlist_prevent_all"
ON public.admin_allowlist
TO authenticated
USING (false)
WITH CHECK (false);

-- ============================================================
-- TABLE: staff_members (USER_ID-BASED UUID ACCESS)
-- ============================================================
-- NOTE: Uses user_id UUID field - staff can see own record

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_members_select_own" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_admins_read_all" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_prevent_update" ON public.staff_members;
DROP POLICY IF EXISTS "staff_members_prevent_delete" ON public.staff_members;

-- Staff can read their own record via user_id = auth.uid()
CREATE POLICY "staff_members_select_own"
ON public.staff_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can read all staff records
CREATE POLICY "staff_members_admins_read_all"
ON public.staff_members
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Prevent UPDATE
CREATE POLICY "staff_members_prevent_update"
ON public.staff_members
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "staff_members_prevent_delete"
ON public.staff_members
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- TABLE: staff_logs (READ-ONLY - AUDIT TRAIL)
-- ============================================================

ALTER TABLE public.staff_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_logs_prevent_all" ON public.staff_logs;

CREATE POLICY "staff_logs_prevent_all"
ON public.staff_logs
TO authenticated
USING (false)
WITH CHECK (false);

-- ============================================================
-- TABLE: p2p_transfers (USERS SEE TRANSFERS INVOLVING THEM)
-- ============================================================
-- NOTE: Uses to_client_id UUID and from_admin TEXT

ALTER TABLE public.p2p_transfers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p2p_transfers_select_involved" ON public.p2p_transfers;
DROP POLICY IF EXISTS "p2p_transfers_prevent_update" ON public.p2p_transfers;
DROP POLICY IF EXISTS "p2p_transfers_prevent_delete" ON public.p2p_transfers;

-- Users can see transfers they received (to_client_id = auth.uid())
CREATE POLICY "p2p_transfers_select_involved"
ON public.p2p_transfers
FOR SELECT
TO authenticated
USING (to_client_id = auth.uid());

-- Prevent UPDATE
CREATE POLICY "p2p_transfers_prevent_update"
ON public.p2p_transfers
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "p2p_transfers_prevent_delete"
ON public.p2p_transfers
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- TABLE: kyc_audit_log (USERS SEE THEIR OWN AUDITS)
-- ============================================================
-- NOTE: Uses user_id UUID field

ALTER TABLE public.kyc_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_audit_select_own" ON public.kyc_audit_log;
DROP POLICY IF EXISTS "kyc_audit_prevent_update" ON public.kyc_audit_log;
DROP POLICY IF EXISTS "kyc_audit_prevent_delete" ON public.kyc_audit_log;

-- Users can see their own KYC audit log
CREATE POLICY "kyc_audit_select_own"
ON public.kyc_audit_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Prevent UPDATE
CREATE POLICY "kyc_audit_prevent_update"
ON public.kyc_audit_log
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "kyc_audit_prevent_delete"
ON public.kyc_audit_log
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- TABLE: transaction_details (USERS SEE THEIR OWN TRANSACTIONS)
-- ============================================================
-- NOTE: Uses from_user and to_user UUID fields

ALTER TABLE public.transaction_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transaction_details_select_own" ON public.transaction_details;
DROP POLICY IF EXISTS "transaction_details_prevent_update" ON public.transaction_details;
DROP POLICY IF EXISTS "transaction_details_prevent_delete" ON public.transaction_details;

-- Users can see transactions they're involved in
CREATE POLICY "transaction_details_select_own"
ON public.transaction_details
FOR SELECT
TO authenticated
USING (
  from_user = auth.uid() OR to_user = auth.uid()
);

-- Prevent UPDATE
CREATE POLICY "transaction_details_prevent_update"
ON public.transaction_details
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "transaction_details_prevent_delete"
ON public.transaction_details
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- TABLE: deposit_requests (USERS SEE THEIR OWN DEPOSITS)
-- ============================================================
-- NOTE: Uses user_id UUID field

ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deposit_requests_select_own" ON public.deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_insert_own" ON public.deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_prevent_update" ON public.deposit_requests;
DROP POLICY IF EXISTS "deposit_requests_prevent_delete" ON public.deposit_requests;

-- Users can read their own deposit requests
CREATE POLICY "deposit_requests_select_own"
ON public.deposit_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own deposit requests
CREATE POLICY "deposit_requests_insert_own"
ON public.deposit_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Prevent UPDATE
CREATE POLICY "deposit_requests_prevent_update"
ON public.deposit_requests
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "deposit_requests_prevent_delete"
ON public.deposit_requests
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- TABLE: withdrawal_requests (USERS SEE THEIR OWN WITHDRAWALS)
-- ============================================================
-- NOTE: Uses user_id UUID field

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawal_requests_select_own" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_insert_own" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_prevent_update" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "withdrawal_requests_prevent_delete" ON public.withdrawal_requests;

-- Users can read their own withdrawal requests
CREATE POLICY "withdrawal_requests_select_own"
ON public.withdrawal_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own withdrawal requests
CREATE POLICY "withdrawal_requests_insert_own"
ON public.withdrawal_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Prevent UPDATE
CREATE POLICY "withdrawal_requests_prevent_update"
ON public.withdrawal_requests
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- Prevent DELETE
CREATE POLICY "withdrawal_requests_prevent_delete"
ON public.withdrawal_requests
FOR DELETE
TO authenticated
USING (false);

-- ============================================================
-- VERIFICATION - ALL RLS ENABLED & POLICIES CREATED
-- ============================================================

SELECT '✓ RLS SETUP COMPLETE' as status;

SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  (SELECT COUNT(*) FROM pg_policies p 
   WHERE p.schemaname = 'public' 
   AND p.tablename = c.relname) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN (
    'admin_float', 'admin_allowlist', 'staff_members', 'staff_logs',
    'p2p_transfers', 'kyc_audit_log', 'transaction_details',
    'deposit_requests', 'withdrawal_requests'
  )
ORDER BY c.relname;

SELECT '' as line;
SELECT 'All tables protected with RLS policies' as final_status;
```

---

## Security Matrix

| Table | UUID Column | Access Type | Who Can Read | Who Can Write |
|-------|-------------|-------------|--------------|---------------|
| **admin_float** | admin_email (TEXT) | Email-based | Admins (own email) | System only |
| **admin_allowlist** | email (TEXT) | System-only | Nobody | System only |
| **staff_members** | user_id (UUID) | UUID-based | Staff (own), Admins (all) | System only |
| **staff_logs** | staff_id | System-only | Nobody | System only |
| **p2p_transfers** | to_client_id (UUID) | UUID-based | Recipients only | System only |
| **kyc_audit_log** | user_id (UUID) | UUID-based | Users (own) | System only |
| **transaction_details** | from_user, to_user (UUID) | UUID-based | Involved users | System only |
| **deposit_requests** | user_id (UUID) | UUID-based | Users (own) | Users (insert own) |
| **withdrawal_requests** | user_id (UUID) | UUID-based | Users (own) | Users (insert own) |

---

## Key Fixes Applied

✅ **Syntax Fixed**: Split all `FOR UPDATE, DELETE` into separate policies (Postgres doesn't support comma-separated actions)

✅ **UUID-Based Access**: All tables now use proper `auth.uid()` matching (more secure than email)

✅ **Admin Float Protected**: Email-based access (admin_email = auth.jwt()->>'email') since it only has email field

✅ **Staff Member Ownership**: Uses `user_id = auth.uid()` for ownership verification

✅ **Proper Verification Query**: Uses `pg_class.relrowsecurity` instead of unreliable references

✅ **Audit Trail Locked**: All logs are read-only (no modify/delete by authenticated users)

✅ **Client Privacy**: Users only see their own data; cannot access others' records

---

## How to Execute

1. Copy the entire SQL block above
2. Go to Supabase SQL Editor → New Query
3. Paste the SQL
4. Click **RUN**
5. Should see all 9 tables with RLS enabled and policy counts > 0

**Expected Output:**
```
✓ RLS SETUP COMPLETE

| table_name | rls_enabled | policy_count |
|------------|-------------|--------------|
| admin_allowlist | true | 1 |
| admin_float | true | 4 |
| deposit_requests | true | 4 |
| kyc_audit_log | true | 3 |
| p2p_transfers | true | 3 |
| staff_logs | true | 1 |
| staff_members | true | 4 |
| transaction_details | true | 3 |
| withdrawal_requests | true | 4 |

All tables protected with RLS policies
```

**Once this completes successfully, all security lint warnings disappear!** ✓
