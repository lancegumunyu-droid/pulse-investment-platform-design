# Pulse — Pan-African Investment Platform

A production-ready, full-stack investment platform enabling investors across Southern Africa to invest in vetted projects, earn yields, and participate in governance.

**Tech Stack:** Next.js 16 | React 19 | Supabase | Tailwind CSS | Zustand | TypeScript

---

## Overview

Pulse is a complete platform for managing investment portfolios:
- **Investor Dashboard** (`/app`) — Real-time portfolio, KYC, deposits, investments, staking
- **Public Website** (`/`) — Marketing site, about, projects, contact, legal
- **Admin Dashboard** — KYC reviews, withdrawal approvals, yield distribution
- **Payments** — NOWPayments crypto integration (USDT, BTC deposits)
- **Database** — Supabase with RLS, audit logs, triggers

---

## Quick Start

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

All required variables are automatically provided by Vercel + Supabase integration:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
POSTGRES_URL_NON_POOLING=<postgres-url>
```

**Optional (Crypto Payments):**
```env
NOWPAYMENTS_API_KEY=<your-api-key>
NOWPAYMENTS_IPN_SECRET=<your-ipn-secret>
NOWPAYMENTS_SANDBOX=true
```

---

## Core Features

### 1. Authentication & KYC
- Email/password signup via Supabase Auth
- KYC submission: full name, ID number, DOB, country
- Admin approval/rejection workflow
- Unlock investments $500+ only with verified KYC

### 2. Deposits & Payments
- **Real Crypto:** USDT (TRC-20) or BTC via NOWPayments
- **Sandbox:** Test deposits when keys not configured
- IPN webhook auto-confirms on-chain → instant balance credit

### 3. Investments
- Browse available projects
- Allocate capital → auto tier upgrade
- Track holdings with yield targets
- Tier-based features (higher tiers unlock more projects)

### 4. Staking & Governance
- Stake PULSE tokens @ 24.8% APY
- Vote on platform proposals
- Earn passive yield (admin-disbursed)

### 5. Withdrawals
- Request cash withdrawals
- Admin approval + optional refund on rejection
- Payout to connected wallet

### 6. Admin Panel
- Real-time KYC queue (pending submissions)
- Withdrawal approvals/refunds
- Yield distribution to any user
- Add new admins by email
- User list with balances

---

## Database Schema

All tables RLS-protected, audit-logged:

| Table | Rows | Purpose |
|-------|------|---------|
| `profiles` | ~100s | Users, roles, KYC status, tier, referral code |
| `accounts` | ~100s | Balances (cash, invested, staked, tokens, pending yield) |
| `transactions` | ~1000s | Audit log (deposits, investments, withdrawals, yield) |
| `holdings` | ~1000s | Individual investments per user |
| `staking_positions` | ~100s | Governance token stakes + APY |
| `kyc_submissions` | ~100s | Identity submissions + admin review |
| `governance_votes` | ~100s | Proposal votes |
| `admin_allowlist` | ~10s | Emails authorized as admins |

---

## File Structure

```
app/
├── (site)/                 # Public marketing site
│   ├── page.tsx           # Homepage
│   ├── about/page.tsx
│   ├── projects/page.tsx
│   ├── contact/page.tsx
│   └── legal/             # Terms, Privacy, Risk
├── (investor)/
│   └── app/page.tsx       # Investor dashboard
├── auth/
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   └── callback/route.ts
├── api/nowpayments/
│   ├── create/route.ts    # Create payment
│   └── ipn/route.ts       # Webhook
├── actions/
│   ├── pulse.ts           # User mutations
│   └── admin.ts           # Admin mutations
└── middleware.ts          # Session refresh

components/pulse/
├── app.tsx                # Main shell
├── store.tsx              # Zustand + actions
├── auth-form.tsx
├── modals.tsx             # KYC, deposit, invest, etc.
├── views/                 # Dashboard sections
└── ui-bits.tsx

lib/pulse/
├── types.ts
├── service.ts             # Service-role client
├── data-access.ts         # DB helpers
└── ../supabase/           # Auth clients
```

---

## Key Workflows

### User Sign-Up Flow
```
Sign-up (email/pass) → Supabase Auth → 
Profile + Account auto-created (trigger) → 
Redirect to /app → Dashboard empty state
```

### KYC Submission
```
User: Profile → KYC → Submit form →
Status: pending → 
Admin Dashboard: Review queue → Approve/Reject →
User: kyc_status = verified OR rejected
```

### Deposit (NOWPayments)
```
User: Wallet → Deposit → $100 USD →
API: /nowpayments/create → Get pay address + amount →
User: Sends crypto → 
IPN: Confirms on-chain → 
API: /nowpayments/ipn (HMAC verified) →
Balance: +$100 USD
```

### Investment
```
User: Invest tab → Pick project → $500 → Confirm →
Server: Check balance, KYC, tier →
DB: Adjust balances, create holding →
Tier: Auto-upgrade if invested total ↑
```

### Admin Approval
```
Admin: Dashboard → KYC/Withdrawal queue →
Review: Reject or approve →
Action: Update profile + transaction records →
User: Sees updated status instantly
```

---

## Server Actions

**User actions** (`app/actions/pulse.ts`):
- `fetchSnapshot()` — Get current state
- `simulateDeposit(amount)` — Sandbox
- `invest(amount, projectId)`
- `stake(amount)`, `unstake(amount)`
- `submitKyc(input)`
- `setWallet(address)`
- `requestWithdrawal(amount)`

**Admin actions** (`app/actions/admin.ts`):
- `getAdminSnapshot()` — All queues + users
- `reviewKyc(id, decision)`
- `reviewWithdrawal(id, decision)`
- `disburseYield(userId, amount)`
- `addAdminByEmail(email)`

---

## Deployment

### To Vercel

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Import project to Vercel**
   - Connect GitHub repo
   - Environment variables auto-loaded from Supabase integration
   - Deploy

3. **Configure domain:**
   - Vercel → Project Settings → Domains
   - Add custom domain (e.g., `pulse.africa`)

4. **Set NOWPayments IPN:**
   - NOWPayments Account Settings → API → IPN Callback URL
   - Set to: `https://your-domain.com/api/nowpayments/ipn`

---

## Testing Checklist

- [ ] Sign up → See empty dashboard
- [ ] Submit KYC → See pending status
- [ ] Deposit (sandbox) → Balance credits
- [ ] Invest → Holding appears, tier upgrades
- [ ] Stake → Position created, yield pending
- [ ] Request withdrawal → Admin queue shows it
- [ ] As admin: Approve KYC → User sees verified
- [ ] As admin: Disburse yield → Balance credits
- [ ] Connect wallet → See in profile

---

## Security

- **Auth:** Supabase Auth + httpOnly cookies
- **Authorization:** RLS + server-side role checks  
- **Scope:** Every query filtered by `auth.uid()`
- **Payments:** NOWPayments HMAC-SHA512 verified
- **Audit:** All mutations logged to `transactions`

---

## Support

- **Supabase Issues:** [supabase.com/docs](https://supabase.com/docs)
- **Next.js Questions:** [nextjs.org/docs](https://nextjs.org/docs)
- **Platform Help:** Contact via `/contact` form

---

**Built with ❤️ by Pulse Team**
