# Admin Credentials & Testing Guide

## Quick Start for Testing

### Admin Test Accounts (Pre-registered)

These emails are already in the admin allowlist. Sign up with any of these to become an admin:

| Email | Role | Password | Notes |
|-------|------|----------|-------|
| `admin1@pulsetest.co.za` | Admin | You set it | Primary admin |
| `admin2@pulsetest.co.za` | Admin | You set it | Secondary admin |
| `support@pulsetest.co.za` | Admin | You set it | Support team |
| `finance@pulsetest.co.za` | Admin | You set it | Finance team |
| `lance@pulse.co.za` | Admin | You set it | Founder |
| `you@pulse.co.za` | Admin | You set it | Your account |

### Investor Test Accounts

Sign up with any email to test investor features (not pre-registered, no special access):

| Email | Role | Purpose |
|-------|------|---------|
| `investor1@pulsetest.co.za` | Investor | Test KYC flow |
| `investor2@pulsetest.co.za` | Investor | Test deposits |
| `investor3@pulsetest.co.za` | Investor | Test investments |

---

## Sign Up Flow

### To Become an Admin:

1. Go to `https://your-domain.com/auth/sign-up` (or `http://localhost:3000/auth/sign-up` in dev)
2. Enter one of the **Admin Test Accounts** emails above
3. Set a password (any password, you'll remember it for testing)
4. Click "Sign Up"
5. Verify your email (check console in dev, or check email in production)
6. Go to `/app`
7. Click on your **Profile** (top right)
8. You'll see **"Admin Dashboard"** button
9. Click it → Full admin panel loaded

### To Test Investor Features:

1. Go to `/auth/sign-up`
2. Enter any email (doesn't need to be in allowlist)
3. Set a password
4. Sign up → Verify email → Go to `/app`
5. You're now an investor with:
   - Empty portfolio
   - No KYC status
   - $0 balance
   - Ready to test features

---

## Admin Dashboard Functions

### Once logged in as admin:

**1. KYC Queue** (top section)
- See pending KYC submissions from investors
- Review: Full Name, ID Number, DOB, Country
- Approve → User unlocks investments $500+
- Reject → User sees rejected status, can resubmit

**2. Withdrawal Queue** (middle section)
- See pending withdrawal requests
- Review: User, amount, wallet
- Approve → Process payment, deduct balance
- Reject → Refund to cash balance

**3. Yield Distribution** (bottom)
- Input user ID + amount
- Click "Disburse" → Credits user's balance instantly
- Logged in transactions

**4. User List** (right sidebar)
- See all users with balances
- Cash balance, invested balance, staked balance
- KYC status for each user
- Click to view details (coming soon)

**5. Add Admin** (top bar)
- Input email address
- Click "Add Admin"
- Email added to allowlist
- User can sign up → becomes admin

---

## Testing Workflows

### Workflow 1: KYC Submission & Approval

**As Investor:**
1. Sign up with `investor1@pulsetest.co.za`
2. Go to `/app` → Profile
3. Scroll to "KYC" section
4. Fill in:
   - Full Name: `John Doe`
   - ID Number: `123456789`
   - DOB: `1990-01-15`
   - Country: `South Africa`
5. Click "Submit KYC"
6. See "✅ Submitted" status

**As Admin:**
1. Sign up with `admin1@pulsetest.co.za`
2. Go to `/app` → Profile → Admin Dashboard
3. See John Doe in KYC Queue with "pending" status
4. Click "Approve" or "Reject"
5. If approved: John's profile shows `kyc_status = verified`
6. John can now invest $500+

### Workflow 2: Deposit (Sandbox)

**As Investor:**
1. Go to `/app` → Wallet tab
2. Click "Deposit"
3. Enter amount: `$1000`
4. In dev: See "✅ Sandbox deposit successful"
5. In production: Directed to NOWPayments
6. Balance updated: Cash balance +$1000

### Workflow 3: Investment

**As Investor:**
1. Go to `/app` → Invest tab
2. See available projects
3. Click "Invest" on a project
4. Enter amount: `$500`
5. Click "Confirm"
6. See holding created
7. Your tier automatically upgrades

### Workflow 4: Staking

**As Investor:**
1. Go to `/app` → Stake tab
2. Enter amount: `$100`
3. Click "Stake"
4. See staking position with 24.8% APY
5. Pending yield accruing

### Workflow 5: Withdrawal Request

**As Investor:**
1. Go to `/app` → Withdraw tab
2. Enter amount: `$500`
3. Enter wallet: `0x...`
4. Click "Request"
5. See "pending" status

**As Admin:**
1. Go to Admin Dashboard
2. See withdrawal request in queue
3. Click "Approve" or "Reject"
4. If approved: Balance deducted, transaction logged
5. If rejected: Refund to cash balance

---

## Database Access (for debugging)

### Supabase Dashboard:

1. Go to [supabase.com](https://supabase.com)
2. Sign in with your account
3. Open your Pulse project
4. Go to **SQL Editor**
5. Run queries to inspect data:

```sql
-- View all users
SELECT id, email, role, kyc_status, tier FROM public.profiles LIMIT 20;

-- View all balances
SELECT u.email, a.cash_balance, a.invested_balance, a.staked_balance, a.token_balance
FROM public.accounts a
JOIN public.profiles u ON a.user_id = u.id;

-- View KYC submissions
SELECT u.email, k.full_name, k.status, k.created_at 
FROM public.kyc_submissions k
JOIN public.profiles u ON k.user_id = u.id
ORDER BY k.created_at DESC;

-- View all transactions
SELECT u.email, t.type, t.amount, t.status, t.created_at
FROM public.transactions t
JOIN public.profiles u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- View admin allowlist
SELECT email FROM public.admin_allowlist;
```

---

## Troubleshooting

### "Supabase not configured" message

**In dev preview:**
- This is expected if Supabase env vars haven't loaded yet
- Deploy to Vercel (production) to bypass this

**In production:**
- Check Vercel → Project Settings → Environment Variables
- Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Redeploy

### Can't sign up

- Make sure email is entered correctly
- Check email (might be in spam)
- If stuck on verification, check Supabase Auth logs

### Admin dashboard doesn't appear

1. Verify your email is in `admin_allowlist`:
   ```sql
   SELECT * FROM public.admin_allowlist WHERE email = 'your@email.com';
   ```
2. If not there, add it:
   ```sql
   INSERT INTO public.admin_allowlist (email) VALUES ('your@email.com');
   ```
3. Log out and back in
4. Try again

### Test data not showing

- Make sure you're logged in as the right user
- Check that you're in `/app` not `/` (marketing site)
- Verify email is verified

---

## Production First Admin Setup

Once deployed to production:

1. **Choose first admin email** (e.g., `lance@pulse.co.za`)
2. **Add to allowlist** (done above, already in DB)
3. **Go to production URL** (e.g., `https://pulse.africa`)
4. **Sign up** with that email
5. **Verify email** (check inbox)
6. **Access admin dashboard** at `/app` → Profile
7. **Add more admins** using admin dashboard
8. **Start reviewing KYC submissions** from real investors

---

## API Testing (for Developers)

### Test User Actions:

```bash
# These are server actions, tested via UI
# But you can also call them programmatically:

curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"action": "simulateDeposit", "amount": 1000}'
```

### Test Admin Actions:

Only accessible as authenticated admin:

```bash
# Get admin snapshot
curl -X GET http://localhost:3000/app \
  -H "Authorization: Bearer <session-token>"
```

---

## Quick Reference: What to Test

- [ ] Sign up as investor
- [ ] Sign up as admin (using allowlist email)
- [ ] Submit KYC as investor
- [ ] Approve KYC as admin
- [ ] Deposit (sandbox)
- [ ] Invest in project
- [ ] Stake tokens
- [ ] Request withdrawal
- [ ] Approve withdrawal as admin
- [ ] Disburse yield as admin
- [ ] Add new admin
- [ ] Check transaction history

---

## Questions?

Refer to:
- **QUICK_REFERENCE.md** for commands
- **ADMIN_API_SECURITY.md** for full API docs
- **README.md** for architecture
- **DEPLOYMENT.md** for production setup

All documentation is in your repo root.
