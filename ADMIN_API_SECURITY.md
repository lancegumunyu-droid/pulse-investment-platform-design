# Pulse Platform — Admin Setup, APIs & Security

---

## PART 1: ADMIN ACCESS & SETUP

### Admin User Registration

Admins are created via email allowlist. When an email is added to the allowlist:
1. User signs up at `/auth/sign-up` with that email
2. Database trigger `handle_new_user()` checks `admin_allowlist`
3. User is automatically assigned `role: 'admin'`
4. User can access admin dashboard at `/app` → Profile → "Admin dashboard"

### Setting Up Your First Admins

**Option A: Direct Database Insert (Fastest)**

Go to Supabase → SQL Editor and run:
```sql
INSERT INTO public.admin_allowlist (email) VALUES 
('your-email@pulseinvest.co.za'),
('admin2@pulseinvest.co.za'),
('admin3@pulseinvest.co.za');
```

**Option B: Claim Admin (Bootstrap)**

If NO admins exist yet:
1. Any user can go to `/app` → Profile → "Request admin access"
2. They become the first admin automatically
3. They can then add more admins via the admin dashboard

**Option C: Via Admin Dashboard**

Once you have one admin:
1. Admin Dashboard → Add Admin → Enter email
2. If user already registered: instantly promoted
3. If not registered: added to allowlist for next signup

---

## PART 2: COMPLETE API DOCUMENTATION

### USER ACTIONS (Server Actions)

All user actions require authentication (`'use server'`). They live in `/app/actions/pulse.ts`.

#### `fetchSnapshot()`
**Returns:** Current user portfolio state
```typescript
type Snapshot = {
  id: string
  email: string
  fullName: string
  role: 'investor' | 'admin'
  kyc: 'none' | 'pending' | 'verified' | 'rejected'
  wallet: string | null
  tier: number
  cash: number
  invested: number
  staked: number
  pulse: number
  pendingYield: number
  holdings: Array<{ projectId: string; amount: number; tier: number }>
  recentTxns: Transaction[]
}
```
**Error cases:** Not authenticated

---

#### `simulateDeposit(amount: number)`
**Purpose:** Sandbox deposit (when NOWPayments keys not configured)
**Params:**
- `amount` (number, > 0): USD amount

**Returns:** Updated snapshot

**Error cases:**
- Invalid amount
- Not authenticated

**Flow:**
1. Validates amount > 0
2. Adds to cash_balance
3. Records 'deposit' transaction with type='sandbox'

---

#### `invest(amount: number, projectId: string)`
**Purpose:** Allocate capital to a project
**Params:**
- `amount` (number, > 0): USD amount
- `projectId` (string): Project identifier

**Validation:**
- Amount > 0
- Sufficient cash_balance
- If amount > $500: KYC must be verified

**Auto-effects:**
- Tier auto-upgrades based on total invested
- Yield targets populated from tier

**Returns:** Updated snapshot

**Error cases:**
- Insufficient balance
- KYC required for $500+
- Invalid amount

---

#### `buyToken(cost: number, pulse: number)`
**Purpose:** Purchase PULSE tokens (private sale)
**Params:**
- `cost` (number): USD paid
- `pulse` (number): PULSE tokens received

**Returns:** Updated snapshot

**Error cases:**
- Insufficient balance
- Invalid amount

---

#### `stake(amount: number)`
**Purpose:** Stake PULSE tokens (earn 24.8% APY)
**Params:**
- `amount` (number > 0): PULSE tokens to stake

**Auto-effects:**
- Creates staking_position row
- Moves tokens from liquid to staked
- Pending yield accrues daily

**Returns:** Updated snapshot

**Error cases:**
- Not enough liquid PULSE
- Invalid amount

---

#### `unstake(amount: number)`
**Purpose:** Unstake PULSE tokens
**Params:**
- `amount` (number > 0): PULSE tokens to unstake

**Returns:** Updated snapshot

**Error cases:**
- Not enough staked PULSE
- Invalid amount

---

#### `requestWithdrawal(amount: number)`
**Purpose:** Initiate cash withdrawal (requires approval)
**Params:**
- `amount` (number > 0): USD to withdraw

**Validation:**
- KYC must be verified
- Sufficient cash_balance

**Flow:**
1. Holds funds (deducts from balance)
2. Creates pending withdrawal transaction
3. Appears in admin queue

**Returns:** Updated snapshot

**Error cases:**
- KYC not verified
- Insufficient balance
- Invalid amount

---

#### `submitKyc(input: { fullName, idNumber, dateOfBirth?, country? })`
**Purpose:** Submit identity verification
**Params:**
- `fullName` (string, required)
- `idNumber` (string, required)
- `dateOfBirth` (ISO date, optional)
- `country` (string, optional)

**Flow:**
1. Validates fullName & idNumber
2. Inserts into kyc_submissions
3. Sets profile kyc_status to 'pending'
4. Appears in admin review queue

**Returns:** Updated snapshot

**Error cases:**
- Missing fullName or idNumber

---

#### `castVote(proposalId: string, choice: 'for' | 'against' | 'abstain')`
**Purpose:** Vote on governance proposal
**Params:**
- `proposalId` (string): Proposal identifier
- `choice`: Vote direction

**Validation:**
- Must have staked PULSE > 0

**Flow:**
1. Records vote with staked balance as weight
2. Upsert allows changing vote

**Returns:** Updated snapshot

**Error cases:**
- No staked PULSE (can't vote)

---

#### `setWallet(address: string | null)`
**Purpose:** Connect/disconnect blockchain wallet
**Params:**
- `address` (string or null)

**Returns:** Updated snapshot

---

#### `claimAdmin()`
**Purpose:** Become first admin (bootstrap) or claim if on allowlist
**Returns:** Updated snapshot with role='admin'

**Validation:**
- Either: No admins exist yet, OR user email on admin_allowlist

**Error cases:**
- Admin already exists AND user not on allowlist

---

### ADMIN ACTIONS (Server Actions)

All admin actions require `role='admin'`. They live in `/app/actions/admin.ts`.

#### `getAdminSnapshot()`
**Returns:** Full admin view state
```typescript
type AdminSnapshot = {
  totalDeposits: number         // Sum of all cash balances
  totalInvested: number         // Sum of all invested balances
  totalStaked: number           // Sum of all staked balances
  pendingWithdrawals: number    // Count
  pendingKyc: number            // Count
  userCount: number             // Total users
  users: Array<{                // All users
    id: string
    email: string
    fullName: string
    role: string
    kycStatus: string
    cash: number
    invested: number
    staked: number
    createdAt: number (ms)
  }>
  kycQueue: Array<{             // Pending KYC submissions
    id: string
    userId: string
    email: string
    fullName: string
    idNumber: string
    dateOfBirth: string | null
    country: string | null
    status: string
    createdAt: number (ms)
  }>
  withdrawalQueue: Array<{      // Pending withdrawals
    id: string
    userId: string
    email: string
    type: string
    amount: number
    currency: string
    status: string
    createdAt: number (ms)
  }>
  recentTxns: Array<Transaction>
}
```

---

#### `reviewKyc(id: string, decision: 'approved' | 'rejected')`
**Purpose:** Approve or reject KYC submission
**Params:**
- `id` (string): kyc_submissions row ID
- `decision`: Approval decision

**Auto-effects:**
- Updates kyc_submissions status
- Updates user profile kyc_status to 'verified' or 'rejected'
- Sets reviewed_by & reviewed_at

**Returns:** Updated admin snapshot

**Error cases:**
- Submission not found

---

#### `reviewWithdrawal(id: string, decision: 'approved' | 'rejected')`
**Purpose:** Approve withdrawal or reject & refund
**Params:**
- `id` (string): transactions row ID
- `decision`: Approval decision

**Flow:**
- If approved: status → 'completed'
- If rejected: refunds held amount back to user's cash_balance, status → 'cancelled'

**Returns:** Updated admin snapshot

**Error cases:**
- Withdrawal not found or already processed

---

#### `disburseYield(userId: string, amount: number)`
**Purpose:** Credit yield to user account
**Params:**
- `userId` (string)
- `amount` (number > 0): USD yield

**Auto-effects:**
- Adds to user's cash_balance
- Records 'yield' transaction type
- Sets processed_by to admin ID

**Returns:** Updated admin snapshot

**Error cases:**
- Invalid amount
- User not found (FK constraint)

---

#### `addAdminByEmail(email: string)`
**Purpose:** Add new admin by email
**Params:**
- `email` (string): Email to admin

**Auto-effects:**
- Adds to admin_allowlist
- If user already exists: instantly promoted to role='admin'
- If user not registered yet: will auto-promote on signup

**Returns:** Updated admin snapshot

**Error cases:**
- Invalid email format

---

### HTTP ENDPOINTS (REST APIs)

#### `POST /api/nowpayments/create`
**Purpose:** Initiate crypto payment deposit
**Auth:** Requires session (via cookies)

**Request body:**
```json
{
  "amount": 100,
  "payCurrency": "usdttrc20"  // or "btc", etc.
}
```

**Response (200):**
```json
{
  "paymentId": "123456789",
  "payAddress": "TUHm...k1",
  "payAmount": "100.00",
  "payCurrency": "usdttrc20",
  "amount": 100
}
```

**Response (501 - Not configured):**
```json
{
  "error": "not_configured",
  "message": "NOWPayments API key is not set. Use the sandbox deposit for now."
}
```

**Flow:**
1. User provides amount & pay currency
2. Creates NOWPayments payment order
3. Returns payment address & amount user must send
4. Creates pending deposit transaction (reference = payment_id)
5. Waits for IPN webhook confirmation

**Error cases:**
- Unauthorized (no session)
- Invalid amount
- NOWPayments API unreachable
- API key not configured

---

#### `POST /api/nowpayments/ipn`
**Purpose:** Webhook handler for NOWPayments payment confirmation
**Auth:** HMAC-SHA512 signature (X-NOWPayments-Sig header)

**Signature verification:**
1. Sort payload object keys alphabetically
2. JSON-stringify the sorted payload
3. HMAC-SHA512 with IPN_SECRET
4. Compare with X-NOWPayments-Sig header (timing-safe)

**Payload:**
```json
{
  "payment_id": "123456789",
  "payment_status": "finished",
  "order_id": "user-id:uuid",
  "price_amount": 100,
  "price_currency": "usd",
  "pay_amount": "100.123456",
  "pay_currency": "usdttrc20"
}
```

**Payment statuses handled:**
- `finished` or `confirmed`: Credit user, update txn status='completed'
- `failed`, `expired`, `refunded`: Set txn status='failed'

**Response (200):**
```json
{ "ok": true }
```

**Response (401):**
```json
{ "error": "invalid_signature" }
```

**Error cases:**
- Invalid signature
- IPN_SECRET not configured
- Bad JSON payload
- No matching transaction (silently ignored)

---

## PART 3: SECURITY ARCHITECTURE

### Authentication & Session

**Session Management:**
- Supabase Auth handles email/password via JWT
- Cookies are httpOnly (can't be accessed by JavaScript)
- Server actions automatically inject session via middleware
- Session refreshed on each request (proxy.ts)

**Protection:**
```
User Signs Up
  ↓
Supabase Auth creates JWT + Refresh Token
  ↓
httpOnly Cookie stored (domain-locked, secure flag)
  ↓
Middleware intercepts every request
  ↓
Session refreshed if near expiry
  ↓
Server actions check auth.getUser()
```

---

### Authorization (Role-Based Access Control)

**Roles:**
- `investor`: Default role, access to own dashboard
- `admin`: Full admin dashboard + all approval functions

**Enforcement:**
1. **Frontend:** UI hides/disables admin features if role != 'admin'
2. **Backend:** Every admin action calls `requireAdmin()` which:
   - Checks `auth.getUser()` exists
   - Queries `profiles` table for role='admin'
   - Throws if not admin

**Example:**
```typescript
async function requireAdmin() {
  const user = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  const { data: profile } = await db
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') throw new Error('Admin access required')
}
```

---

### Row-Level Security (RLS)

All tables have RLS enabled. Policies:

| Table | Policy | Effect |
|-------|--------|--------|
| profiles | `own_profile` | Users can read/update only their own row |
| accounts | `own_account` | Users can read only their own account |
| transactions | `own_txns` | Users can read only their own transactions |
| holdings | `own_holdings` | Users can read only their own holdings |
| staking_positions | `own_staking` | Users can read only their own stakes |
| kyc_submissions | `own_kyc` | Users can read/insert only their own |
| governance_votes | `own_votes` | Users can read/insert only their own |
| admin_allowlist | RLS enabled | No direct user access |

**Example:**
```sql
CREATE POLICY own_profile ON public.profiles 
  FOR ALL TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);
```

All SELECT queries in server actions use **service-role client** (bypasses RLS) because:
1. We need to read other users' data (admin views)
2. We verify authorization in the code first
3. Service role + `requireAdmin()` = safe

---

### Data Validation & Sanitization

**Input Validation:**
```typescript
// User supplies amount
const amount = Number(body.amount)
if (!(amount > 0)) throw new Error('Invalid amount')
if (amount > 999999) throw new Error('Amount too large')

// User supplies email
const clean = email.trim().toLowerCase()
if (!clean.includes('@')) throw new Error('Invalid email')

// User supplies text
const name = input.fullName.trim()
if (!name || name.length > 255) throw new Error('Invalid name')
```

**Parameterized Queries:**
All Supabase queries use built-in parameterization (no SQL injection risk):
```typescript
// Safe: parameters bound separately
db.from('profiles').update({ tier: 5 }).eq('id', userId)

// Supabase SDK prevents SQL injection automatically
```

**XSS Protection:**
- React auto-escapes JSX (no raw `innerHTML`)
- User data displayed as text nodes only
- No markdown or rich text rendering from user input

---

### Payment Security

**NOWPayments HMAC Verification:**
```typescript
// 1. Receive webhook with X-NOWPayments-Sig header
const signature = req.headers.get('x-nowpayments-sig')

// 2. Sort payload object keys alphabetically
const sorted = sortObject(payload)

// 3. HMAC-SHA512 with IPN secret
const expected = crypto
  .createHmac('sha512', IPN_SECRET)
  .update(JSON.stringify(sorted))
  .digest('hex')

// 4. Timing-safe comparison (no timing attacks)
const valid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
)
```

**Prevents:**
- Man-in-the-middle attacks (signature invalid)
- Replay attacks (NOWPayments adds nonce to payload)
- Timing-based signature forgery

---

### Audit Logging

Every financial transaction is recorded in the `transactions` table:

| Type | Example | Trigger |
|------|---------|---------|
| deposit | User deposits $100 | simulateDeposit() or IPN webhook |
| investment | User invests $500 in project | invest() |
| withdrawal | User requests $1000 payout | requestWithdrawal() |
| stake | User stakes 1000 PULSE | stake() |
| unstake | User unstakes 500 PULSE | unstake() |
| token_purchase | User buys 10000 PULSE | buyToken() |
| yield | Admin distributes $50 yield | disburseYield() |

**Audit trail:**
- `user_id`: Who did it
- `type`: What happened
- `amount`: How much
- `status`: 'pending', 'completed', 'failed'
- `processed_by`: Admin ID (if admin-initiated)
- `meta`: Extra context (project ID, order ID, etc.)
- `created_at`: When (UTC, immutable)

---

### Environment Variable Security

**Sensitive vars (server-only):**
- `SUPABASE_SERVICE_ROLE_KEY` — Never exposed to browser
- `NOWPAYMENTS_IPN_SECRET` — Never exposed to browser
- `NOWPAYMENTS_API_KEY` — Never exposed to browser
- `POSTGRES_URL_NON_POOLING` — Never exposed to browser

**Public vars (safe for browser):**
- `NEXT_PUBLIC_SUPABASE_URL` — Public API endpoint
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public auth key (limited RLS scope)

**Enforcement:**
```typescript
// ✅ Correct — server action only
'use server'
const secret = process.env.NOWPAYMENTS_IPN_SECRET

// ❌ Wrong — exposed to browser
const secret = process.env.NEXT_PUBLIC_NOWPAYMENTS_SECRET
```

---

### DDoS & Rate Limiting

**NOWPayments protects webhook endpoint:**
- IPN can be replayed, but duplicate transactions are idempotent (status check)
- No state change if txn already completed

**Best practices for your deployment:**
1. Use Vercel's built-in DDoS protection
2. Set rate limits on `/api/*` routes (optional)
3. Monitor Supabase usage dashboards

---

## PART 4: OPTIMIZATION CHECKLIST

### Performance

- [x] Next.js 16 with Turbopack (automatic bundling)
- [x] Server components for data fetching (no waterfall)
- [x] Zustand for client state (minimal re-renders)
- [x] Supabase indexes on frequently-queried columns
- [x] RLS policies compiled and indexed
- [x] No N+1 queries (admin view batches all queries)
- [ ] Enable Next.js Image optimization (optional)
- [ ] Add caching headers to static assets
- [ ] Monitor Core Web Vitals (Vercel Analytics)

### Code Quality

- [x] TypeScript strict mode throughout
- [x] ESLint configured (run via `pnpm lint`)
- [x] All server actions have proper error handling
- [x] All APIs return consistent JSON responses
- [x] Comprehensive JSDoc comments on key functions
- [x] No console.log statements in production
- [ ] Add unit tests for critical paths (optional)
- [ ] Add E2E tests for user flows (optional)

### Security

- [x] httpOnly cookies for session
- [x] HTTPS enforced (Vercel handles)
- [x] CORS configured (Vercel handles)
- [x] No hardcoded secrets in code
- [x] All user inputs validated
- [x] RLS enabled on all tables
- [x] HMAC verification on webhooks
- [ ] Add rate limiting to public endpoints (optional)
- [ ] Regular security audits (quarterly)

### Monitoring

- [x] Supabase provides query performance insights
- [x] Vercel provides deployment logs
- [ ] Set up error tracking (Sentry integration optional)
- [ ] Set up analytics (Vercel Analytics)
- [ ] Monitor auth failures (check Supabase Auth logs)
- [ ] Monitor webhook failures (check Supabase logs)

### Deployment

- [x] GitHub connected for auto-deployments
- [x] Environment variables configured in Vercel
- [x] Database migrations applied to production
- [x] Domain pointed to Vercel
- [ ] SSL certificate auto-renewed (Vercel handles)
- [ ] Backup strategy for Supabase (check Settings → Backup)
- [ ] NOWPayments IPN URL configured

---

## PART 5: QUICK START FOR ADMINS

### First Time Setup (5 minutes)

1. **Add first admin (you):**
   ```sql
   INSERT INTO public.admin_allowlist (email) VALUES ('your@email.com');
   ```

2. **Sign up at `/auth/sign-up`** with that email

3. **Go to `/app` → Profile → "Admin dashboard"**

4. **You see the admin panel** with KYC queue, withdrawal queue, users list

### Daily Admin Tasks

**Morning:**
- Check admin dashboard for pending KYC submissions
- Review & approve/reject KYC
- Check withdrawal queue

**As needed:**
- Disburse yield to users (bulk operations)
- Add new admins when onboarding staff
- Review transaction logs for unusual activity

### Troubleshooting

**"Admin access required" error:**
- Verify your email is in `admin_allowlist`
- Sign out, sign back in
- Check `profiles` table: `SELECT * FROM profiles WHERE email='your@email.com'` — role should be 'admin'

**"Not authenticated" error:**
- Clear cookies & sign in again
- Check that Supabase env vars are set in Vercel

**Webhook not confirming payments:**
- Verify `NOWPAYMENTS_IPN_SECRET` is set in Vercel Vars
- Check NOWPayments dashboard: Settings → API → IPN Callback URL must be exactly `https://your-domain.com/api/nowpayments/ipn`
- Check Supabase logs: `SELECT * FROM transactions WHERE type='deposit' AND status='pending'` to see stuck deposits

---

**Questions?** Check `/README.md` or contact support.

**Built with security first. 🔒**
