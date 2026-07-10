# Complete Testing Guide for Pulse

## Pre-Testing Setup

1. **Environment vars confirmed:**
   ```bash
   # Supabase integration connected in Vercel
   NEXT_PUBLIC_SUPABASE_URL = set ✅
   NEXT_PUBLIC_SUPABASE_ANON_KEY = set ✅
   SUPABASE_SERVICE_ROLE_KEY = set ✅
   ```

2. **Admin accounts created:**
   - 6 test admin emails in `admin_allowlist`
   - Ready for sign-up

3. **Database ready:**
   - 8 tables created with RLS
   - All triggers active
   - Audit logging enabled

---

## Test Environment Levels

### Level 1: Local Dev (http://localhost:3000)
- Full functionality except:
  - "Supabase not configured" on auth pages (expected in preview)
- Use for quick testing

### Level 2: Vercel Preview (https://your-branch.vercel.app)
- All Supabase env vars loaded
- Full authentication works
- Use for testing auth flows

### Level 3: Production (https://your-domain.com)
- Final testing before launch
- Real users will use this URL
- NOWPayments live (if configured)

---

## Test Flows

### Test 1: Sign-Up & Admin Access

**Objective:** Verify authentication and admin promotion works

**Steps:**

1. Go to `/auth/sign-up`
2. Enter email: `admin1@pulsetest.co.za`
3. Enter password: `TestPass123!`
4. Click "Sign Up"
5. See verification email prompt
6. Verify email (check console in dev, inbox in prod)
7. Redirected to `/app`
8. See empty dashboard
9. Click profile (top right)
10. Look for "Admin Dashboard" link
11. **Expected:** Admin dashboard appears

**Pass Criteria:**
- ✅ Sign-up completes
- ✅ Verification works
- ✅ Redirected to `/app`
- ✅ Admin dashboard accessible
- ✅ Profile shows role = "admin"

**Fail Criteria:**
- ❌ Sign-up fails
- ❌ Can't verify email
- ❌ No admin dashboard link
- ❌ Stuck on loading

---

### Test 2: Investor Sign-Up

**Objective:** Verify investor accounts can be created and see investor dashboard

**Steps:**

1. Go to `/auth/sign-up`
2. Enter email: `investor1@pulsetest.co.za`
3. Enter password: `TestPass123!`
4. Sign up → Verify
5. See `/app` dashboard
6. Click Profile
7. **Expected:** NO "Admin Dashboard" link (only investors)

**Pass Criteria:**
- ✅ Non-allowlist email creates investor account
- ✅ Profile shows role = "investor"
- ✅ No admin functions visible
- ✅ Correct dashboard shown

---

### Test 3: KYC Submission (Investor → Admin)

**Objective:** Verify KYC flow end-to-end

**As Investor:**

1. Sign up with `investor1@pulsetest.co.za`
2. Go to `/app` → Profile
3. Scroll to "KYC" section
4. Click "Submit KYC"
5. Fill form:
   - Full Name: `John Test Investor`
   - ID Number: `SA123456789`
   - Date of Birth: `1990-01-15`
   - Country: `South Africa`
6. Click "Submit"
7. **Expected:** "✅ KYC Submitted" message
8. Profile shows `kyc_status = pending`

**In Database:**

```sql
SELECT * FROM public.kyc_submissions 
WHERE user_id = '<investor-id>' 
ORDER BY created_at DESC LIMIT 1;
```

**Expected:** Row with `status = 'pending'`

**As Admin:**

1. Sign up with `admin1@pulsetest.co.za`
2. Go to `/app` → Profile → Admin Dashboard
3. Look for "KYC Queue" section
4. See John Test Investor in pending submissions
5. Review their details:
   - Full Name: John Test Investor
   - ID Number: SA123456789
   - Status: pending
6. Click "Approve"
7. **Expected:** Status changes to "approved" ✅
8. Notification shows "KYC approved"

**As Investor (refresh page):**

1. Go to `/app` → Profile
2. See `kyc_status = verified` ✅
3. See message "You're KYC verified!"

**Pass Criteria:**
- ✅ Investor can submit KYC
- ✅ Admin sees in queue
- ✅ Admin can approve
- ✅ Investor sees verified status
- ✅ Database row updated

---

### Test 4: Deposit (Sandbox)

**Objective:** Verify deposit flow and balance updates

**Steps:**

1. Sign up as investor
2. Go to `/app` → Wallet
3. Click "Deposit"
4. Enter amount: `$1000`
5. Select currency: `USD`
6. Click "Confirm"

**In Dev/Preview:**
- **Expected:** "✅ Sandbox deposit successful"
- Balance updates: Cash balance +$1000
- See transaction in history

**In Production (with NOWPayments):**
- **Expected:** Redirect to NOWPayments payment page
- User sends crypto
- Webhook triggers → Balance credits

**Pass Criteria:**
- ✅ Deposit modal appears
- ✅ Amount validation works
- ✅ Balance updates instantly (sandbox)
- ✅ Transaction logged
- ✅ Can see in transaction history

---

### Test 5: Investment

**Objective:** Verify investment flow and tier upgrades

**Setup:**
- Investor must have $500+ cash balance
- Investor must be KYC verified

**Steps:**

1. Go to `/app` → Invest
2. See available projects
3. Click "Invest" on first project
4. Enter amount: `$500`
5. Click "Confirm"
6. **Expected:** "✅ Investment successful"
7. See holding in portfolio
8. Tier auto-upgraded (if balance >= $2000 invested)

**In Database:**

```sql
SELECT * FROM public.holdings 
WHERE user_id = '<investor-id>' 
ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- `amount = 500`
- `project_id = set`
- `tier = appropriate`

**Pass Criteria:**
- ✅ Can invest $500+
- ✅ Holding created
- ✅ Tier auto-upgrades
- ✅ Balance decrements
- ✅ Yield targets shown

---

### Test 6: Staking

**Objective:** Verify staking and APY calculation

**Steps:**

1. Go to `/app` → Stake
2. Enter amount: `$250` (PULSE tokens)
3. Click "Stake"
4. **Expected:** "✅ Staking active"
5. See position with:
   - Amount: $250
   - APY: 24.8%
   - Pending Yield: calculated

**Pass Criteria:**
- ✅ Staking position created
- ✅ APY shows 24.8%
- ✅ Pending yield accruing
- ✅ Can unstake anytime

---

### Test 7: Withdrawal Request

**Objective:** Verify withdrawal flow end-to-end

**As Investor:**

1. Go to `/app` → Withdraw
2. Enter amount: `$300`
3. Enter wallet address: `0x1234567890abcdef`
4. Click "Request"
5. **Expected:** "✅ Withdrawal requested"
6. See status = "pending"

**In Database:**

```sql
SELECT * FROM public.transactions 
WHERE type = 'withdrawal' 
ORDER BY created_at DESC LIMIT 1;
```

**Expected:** Row with `status = 'pending'`

**As Admin:**

1. Go to Admin Dashboard
2. See "$300 withdrawal" in queue
3. Review: investor name, amount, wallet
4. Click "Approve"
5. **Expected:** Status changes to "approved" ✅
6. Balance deducted from investor

**Back as Investor:**

1. Refresh `/app`
2. Cash balance decreased by $300
3. See transaction marked "approved"

**Pass Criteria:**
- ✅ Can request withdrawal
- ✅ Admin sees in queue
- ✅ Admin can approve
- ✅ Balance decrements
- ✅ Marked approved in history

---

### Test 8: Yield Distribution

**Objective:** Verify admin can disburse yield

**Steps:**

1. As admin, go to Admin Dashboard
2. Scroll to "Yield Distribution"
3. Select investor
4. Enter amount: `$50` (yield)
5. Click "Disburse"
6. **Expected:** "✅ Yield disbursed"

**As Investor:**

1. Refresh `/app` → Portfolio
2. See `pending_yield` increased by $50
3. See transaction in history

**Pass Criteria:**
- ✅ Admin can disburse
- ✅ Balance credits instantly
- ✅ Transaction logged
- ✅ Investor sees in portfolio

---

### Test 9: Add New Admin

**Objective:** Verify admin onboarding works

**Steps:**

1. As admin, go to Admin Dashboard
2. Scroll to "Add Admin" section
3. Enter email: `newadmin@pulse.test`
4. Click "Add"
5. **Expected:** "✅ Admin added"

**New Admin:**

1. Go to `/auth/sign-up`
2. Enter `newadmin@pulse.test`
3. Create account
4. Sign up → Verify
5. Go to `/app` → Profile
6. **Expected:** "Admin Dashboard" link visible

**Pass Criteria:**
- ✅ Email added to allowlist
- ✅ New user signs up → auto-promoted
- ✅ Has admin access
- ✅ Can access all admin functions

---

### Test 10: Admin Dashboard Overview

**Objective:** Verify all dashboard components display correctly

**Steps:**

1. As admin, go to `/app` → Profile → Admin Dashboard
2. Verify all sections appear:
   - [ ] KYC Queue (pending submissions)
   - [ ] Withdrawal Queue (pending requests)
   - [ ] Yield Distribution (input form)
   - [ ] User List (right sidebar)
   - [ ] Add Admin (top section)
3. Each section has:
   - [ ] Correct data
   - [ ] Functional buttons
   - [ ] Error handling

**Pass Criteria:**
- ✅ All sections load
- ✅ Data accurate
- ✅ Buttons functional
- ✅ No console errors

---

## Security Testing

### Test 11: Session Security

**Objective:** Verify sessions can't be hijacked

**Steps:**

1. Sign up as investor
2. Open DevTools → Application → Cookies
3. Look for `supabase-auth-token`
4. **Expected:** httpOnly flag set (can't see in JS)
5. Try to copy and use elsewhere
6. **Expected:** Won't work (different device/browser)

**Pass Criteria:**
- ✅ httpOnly flag present
- ✅ Can't access via JS
- ✅ Can't reuse on different device

### Test 12: RLS Protection

**Objective:** Verify cross-user data access is blocked

**Steps:**

1. Sign up as Investor A
2. Note your user ID from browser console
3. Sign in as Investor B (different browser/incognito)
4. Note Investor B's user ID
5. Try to view Investor A's balance via DevTools
6. **Expected:** Can't access via RLS

**In Database (as you, developer):**

```sql
-- This shows RLS in action
-- User can only see their own data
SELECT * FROM public.accounts 
WHERE user_id = '<different-user-id>';
-- Returns empty (RLS blocks it)
```

**Pass Criteria:**
- ✅ Users can't access other users' data
- ✅ Database enforces RLS
- ✅ No data leaks

---

## Performance Testing

### Test 13: Load Times

**Objective:** Verify app loads quickly

**Steps:**

1. Go to `/app`
2. Open DevTools → Network
3. Watch load times
4. **Expected:**
   - LCP (Largest Contentful Paint): < 2.5s
   - FCP (First Contentful Paint): < 1.8s
   - CLS (Cumulative Layout Shift): < 0.1

**Pass Criteria:**
- ✅ Dashboard loads in < 2.5s
- ✅ Smooth interactions
- ✅ No layout jumps

---

## Error Handling

### Test 14: Invalid Inputs

**Steps:**

1. Try to invest with $0
   - **Expected:** Error message "Amount must be > 0"
2. Try KYC with empty fields
   - **Expected:** Error "All fields required"
3. Try withdrawal with invalid amount
   - **Expected:** Error "Amount exceeds balance"

**Pass Criteria:**
- ✅ All inputs validated
- ✅ Clear error messages
- ✅ No silent failures

---

## Final Checklist

- [ ] Sign-up works (investor + admin)
- [ ] KYC flow complete
- [ ] Deposits work (sandbox + real)
- [ ] Investments work
- [ ] Staking works
- [ ] Withdrawals work (request + approve)
- [ ] Yield distribution works
- [ ] Add admin works
- [ ] Admin dashboard complete
- [ ] Session security verified
- [ ] RLS protection verified
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] All documentation accurate
- [ ] Ready to launch

---

## Launch Checklist

Once all tests pass:

- [ ] Deploy to Vercel
- [ ] Set custom domain
- [ ] Test on production URL
- [ ] Announce to testers
- [ ] Monitor for issues
- [ ] Roll out to real investors

---

**Need help?** Refer to:
- ADMIN_CREDENTIALS.md — Test account setup
- QUICK_REFERENCE.md — Common commands
- ADMIN_API_SECURITY.md — Full API details
