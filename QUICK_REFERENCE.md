# Pulse Platform — Quick Reference Card

Print this or bookmark it.

---

## URLs

| Page | URL | Auth Required |
|------|-----|---|
| **Public Site** | | |
| Homepage | `/` | ❌ |
| About | `/about` | ❌ |
| Projects | `/projects` | ❌ |
| Contact | `/contact` | ❌ |
| Terms of Service | `/legal/terms` | ❌ |
| Privacy Policy | `/legal/privacy` | ❌ |
| Risk Disclaimer | `/legal/risk-disclaimer` | ❌ |
| **Authentication** | | |
| Sign Up | `/auth/sign-up` | ❌ |
| Log In | `/auth/login` | ❌ |
| Email Callback | `/auth/callback` | ❌ (auto) |
| **Investor App** | | |
| Dashboard | `/app` | ✅ |
| Admin Dashboard | `/app` (admin view) | ✅ + admin role |

---

## Admin Setup (5 mins)

### Add First Admin
```sql
INSERT INTO public.admin_allowlist (email) VALUES ('your@email.com');
```

### Sign Up
Go to `/auth/sign-up` with that email.

### Access Admin
Go to `/app` → Profile → "Admin dashboard"

---

## Server Actions (User)

| Action | Purpose |
|--------|---------|
| `fetchSnapshot()` | Get current portfolio |
| `simulateDeposit(amount)` | Sandbox deposit (test) |
| `invest(amount, projectId)` | Invest in project |
| `buyToken(cost, pulse)` | Buy PULSE tokens |
| `stake(amount)` | Stake PULSE (24.8% APY) |
| `unstake(amount)` | Unstake PULSE |
| `requestWithdrawal(amount)` | Request cash withdrawal |
| `submitKyc({...})` | Submit identity verification |
| `castVote(proposalId, choice)` | Vote on proposal |
| `setWallet(address)` | Connect/disconnect wallet |

---

## Server Actions (Admin)

| Action | Purpose |
|--------|---------|
| `getAdminSnapshot()` | Get all queues + users |
| `reviewKyc(id, 'approved')` | Approve KYC |
| `reviewKyc(id, 'rejected')` | Reject KYC |
| `reviewWithdrawal(id, 'approved')` | Approve withdrawal |
| `reviewWithdrawal(id, 'rejected')` | Reject & refund |
| `disburseYield(userId, amount)` | Credit yield to user |
| `addAdminByEmail(email)` | Add new admin |

---

## REST APIs

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/nowpayments/create` | POST | ✅ Session | Create payment |
| `/api/nowpayments/ipn` | POST | HMAC | Webhook (NOWPayments) |

---

## Database Tables

| Table | Rows | Purpose |
|-------|------|---------|
| `profiles` | ~100s | Users, roles, KYC status |
| `accounts` | ~100s | Balances |
| `transactions` | ~1000s | Audit log |
| `holdings` | ~1000s | Individual investments |
| `staking_positions` | ~100s | Staking records |
| `kyc_submissions` | ~100s | ID verification |
| `governance_votes` | ~100s | Proposal votes |
| `admin_allowlist` | ~10s | Admin emails |

---

## Environment Variables

**Required (auto-set by Supabase integration):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL_NON_POOLING`

**Optional (add later for payments):**
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

**Test mode:**
- `NOWPAYMENTS_SANDBOX=true`

---

## Common Tasks

### I want to review KYC submissions
1. Go to `/app` (must be logged in as admin)
2. Click "Admin dashboard"
3. See "KYC Queue" tab
4. Click submission → Approve or Reject

### I want to approve a withdrawal
1. Admin dashboard → "Withdrawal Queue" tab
2. Click request → "Approve" or "Reject & Refund"

### I want to give a user yield
1. Admin dashboard → "Users" tab
2. Click user → "Disburse Yield"
3. Enter amount
4. Confirm

### I want to add another admin
1. Admin dashboard → "Add Admin" button
2. Enter email
3. They'll auto-promote when they sign up (or instantly if already registered)

### I want to test crypto payments
1. Set `NOWPAYMENTS_SANDBOX=true` in Vercel
2. User deposits → Goes to NOWPayments sandbox
3. Send test amount to sandbox address
4. Verify IPN callback credits balance

### I want to disable payments temporarily
1. Unset `NOWPAYMENTS_API_KEY` in Vercel
2. Deposits show "Sandbox mode" instead
3. Users can still test with `simulateDeposit()`

---

## Status Codes & Error Messages

| Code | Message | Cause | Fix |
|------|---------|-------|-----|
| 401 | "Not authenticated" | Session expired or missing | Sign in again |
| 403 | "Admin access required" | User is not admin | Add to admin_allowlist |
| 400 | "Insufficient balance" | Not enough cash/tokens | Deposit first |
| 400 | "KYC required for $500+" | Large investment without ID verification | Submit KYC |
| 501 | "NOWPayments not configured" | API keys missing | Add to Vercel Vars |
| 502 | "NOWPayments error" | Payment processor error | Check API key, try again |

---

## File Structure (Key Files)

```
app/
├── actions/
│   ├── pulse.ts          ← User mutations
│   └── admin.ts          ← Admin mutations
├── api/
│   └── nowpayments/
│       ├── create/route.ts   ← Payment creation
│       └── ipn/route.ts      ← Webhook handler
├── auth/
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   └── callback/route.ts
└── (investor)/
    └── app/page.tsx     ← Main dashboard

components/pulse/
├── app.tsx              ← Shell + navigation
├── store.tsx            ← Zustand state
├── views/               ← Dashboard sections
├── modals.tsx           ← Forms & dialogs
└── auth-form.tsx        ← Login/signup

lib/pulse/
├── types.ts             ← TypeScript interfaces
├── service.ts           ← Supabase service client
└── data-access.ts       ← DB query helpers
```

---

## Security Checklist

- ✅ Session stored in httpOnly cookie (can't be stolen)
- ✅ All balances stored server-side (can't be hacked)
- ✅ Admin actions verified server-side (no client-side bypasses)
- ✅ RLS blocks users from reading other users' data
- ✅ All inputs validated & sanitized
- ✅ Payment signatures HMAC-verified (can't be faked)
- ✅ No secrets in code or git
- ✅ Every financial transaction audited

---

## Support

| Problem | Solution |
|---------|----------|
| Forgot password | Sign in → (feature coming soon) or contact admin |
| Can't deposit | Check KYC status (need verified for $500+) or use sandbox |
| Payment stuck | Check NOWPayments account → Payment details |
| Admin stuck in review queue | Admin dashboard → "Process" button → Check status |
| Database questions | Check Supabase dashboard → SQL editor |
| Deployment issues | Check Vercel logs → Deployments tab |

---

## Key Metrics to Monitor

**Daily:**
- Number of pending KYC submissions
- Number of pending withdrawals
- Total deposits today
- Failed payments (check status)

**Weekly:**
- Active users
- Total invested amount
- Total staked amount
- Transaction volume

**Monthly:**
- Cost (Vercel + Supabase)
- Performance (LCP, CLS, INP)
- Error rate
- User growth

---

**Version 1.0 — Production Ready**

Last updated: July 2026
