# PULSE STEP 1 - QUICK START REFERENCE CARD

Print this or save to phone for quick reference while executing.

---

## YOUR ADMIN ACCOUNTS

```
ADMIN 1: Lance Gumunyu
Email:    lancegumunyu@gmail.com
Password: Test123@
Role:     Director (Full)
Float:    50,000 PULSE + $10,000 USD

ADMIN 2: Samkelisiwe Chiliza
Email:    samkelisiwechiliza2@gmail.com
Password: Test123@@
Role:     Manager (KYC)
Float:    50,000 PULSE + $10,000 USD

ADMIN 3: (Your Assignment)
Email:    admin3@pulse.local
Float:    50,000 PULSE + $10,000 USD

ADMIN 4: (Your Assignment)
Email:    admin4@pulse.local
Float:    50,000 PULSE + $10,000 USD
```

---

## EXECUTION CHECKLIST

- [ ] Open STEP1_COMPLETE_SQL_SETUP.md
- [ ] Go to https://supabase.com/dashboard
- [ ] Select: pulse-investment-platform project
- [ ] Click: SQL Editor → New Query
- [ ] Run SECTION 1: Database Migration (/scripts/migrate.sql)
- [ ] Run SECTION 2A: Admin Allowlist
- [ ] Run SECTION 2B: Staff Records
- [ ] Run SECTION 3: Admin Float
- [ ] Run SECTION 4: P2P Transfers
- [ ] Run SECTION 5: KYC Audit Log
- [ ] Run SECTION 6: Transaction Tracking
- [ ] Run SECTION 7: Deposits & Withdrawals
- [ ] Run SECTION 8: Verification
- [ ] All tables created ✓

---

## TEST FLOW

- [ ] Sign up at /auth/sign-up (use test email)
- [ ] Verify email
- [ ] Submit KYC
- [ ] Login as Lance (lancegumunyu@gmail.com, Test123@)
- [ ] Approve KYC in admin dashboard
- [ ] Disburse $1,000 to test user
- [ ] Verify user balance increased
- [ ] Verify admin float decreased
- [ ] Complete test flow ✓

---

## VERIFICATION QUERIES

Run after all sections completed:

```sql
-- See all tables count
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL SELECT 'accounts', COUNT(*) FROM public.accounts
...

-- Check admin float
SELECT admin_email, pulse_balance, usd_balance FROM public.admin_float;

-- Check staff
SELECT email, full_name, role FROM public.staff_members;
```

---

## COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| "Table already exists" | Normal - safe to re-run, uses CREATE IF NOT EXISTS |
| "Constraint violation" | Check data - likely duplicate email or invalid value |
| "RLS policy error" | Run all sections in order - policies depend on tables |
| "Reference error" | Run migrations first (Section 1) before staff/float |

---

## GO-LIVE CHECKLIST

- [ ] All 16 tables created
- [ ] 4 admins in admin_float table
- [ ] 4 staff records created
- [ ] RLS policies enabled
- [ ] Test signup → KYC → Approval flow works
- [ ] Test admin disburse works
- [ ] Supabase Auth Email enabled
- [ ] Vercel deployed with updated code
- [ ] Clients can sign up and submit KYC
- [ ] Everything working → GO LIVE

---

## IMPORTANT URLS

- Dashboard: https://supabase.com/dashboard
- SQL Editor: SQL Editor tab in Supabase
- App URL: https://pulse-investment-platform-6auij6irw.vercel.app
- Sign Up: /auth/sign-up
- Login: /auth/login
- Admin Panel: /app (after login as admin)

---

## SUPPORT

Admin 1 (Lance):
  lancegumunyu@gmail.com

Admin 2 (Samkelisiwe):
  samkelisiwechiliza2@gmail.com

---

## KEY FILES

- STEP1_COMPLETE_SQL_SETUP.md — All SQL to execute
- CLIENT_ONBOARDING_GUIDE.md — Client instructions
- scripts/migrate.sql — Master migration file
- app/actions/admin.ts — Admin functions

---

**TOTAL TIME: ~5 minutes**
**RESULT: Complete production-ready database**

You've got this! 🚀
