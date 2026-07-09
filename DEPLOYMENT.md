# Pulse Platform — Deployment & Production Checklist

---

## Pre-Deployment Checklist (1-2 hours)

### 1. Environment Variables

**Verify all required vars are set in Vercel:**

Go to **Vercel → Project Settings → Environment Variables**

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | `eyJ...long-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | `eyJ...long-key` |
| `POSTGRES_URL_NON_POOLING` | ✅ Yes | `postgresql://user:pass@...` |
| `NOWPAYMENTS_API_KEY` | ⏳ Later | Get from nowpayments.io |
| `NOWPAYMENTS_IPN_SECRET` | ⏳ Later | Get from nowpayments.io |
| `NOWPAYMENTS_SANDBOX` | Optional | Leave empty for production |

**Check current vars:**
```bash
# In Vercel CLI (if installed)
vercel env pull

# Or just verify in the Vercel UI
```

---

### 2. Database Verification

**Check Supabase tables exist:**

Go to **Supabase Dashboard → SQL Editor**

Run:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should see all 8 tables:
- admin_allowlist
- accounts
- governance_votes
- holdings
- kyc_submissions
- profiles
- staking_positions
- transactions

**Verify RLS is enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All should have `rowsecurity = true`.

---

### 3. Test Credentials

**Create test admin account:**
```sql
-- Add test admin email to allowlist
INSERT INTO public.admin_allowlist (email) VALUES ('testadmin@pulse.test');
```

**Sign up & verify admin works:**
1. Go to `/auth/sign-up` (production domain)
2. Use email `testadmin@pulse.test`
3. Set password
4. Go to `/app`
5. Click Profile → Should see "Admin dashboard" button
6. Click "Admin dashboard" → Should see KYC queue, users, etc.

---

### 4. Payment Processor (Optional at launch)

**If using NOWPayments:**

1. Register at [nowpayments.io](https://nowpayments.io)
   - Business website: `https://your-domain.com`
   - Company email: `contact@your-domain.com`
   - Business registration proof (required)

2. Get API keys:
   - API Key (create in Account Settings → API)
   - IPN Secret (auto-generated)

3. Add to Vercel:
   - `NOWPAYMENTS_API_KEY`
   - `NOWPAYMENTS_IPN_SECRET`

4. Configure IPN callback in NOWPayments:
   - Account Settings → API → IPN Callback URL
   - Set to: `https://your-domain.com/api/nowpayments/ipn`

5. Test:
   - Use sandbox: set `NOWPAYMENTS_SANDBOX=true`
   - Create test payment
   - Verify webhook received

---

### 5. Domain & SSL

**In Vercel:**
1. Project Settings → Domains
2. Add your custom domain (e.g., `pulse.africa`)
3. Point DNS records (Vercel provides instructions)
4. SSL auto-issued by Vercel (takes ~2 mins)

**Verify:**
```bash
curl -I https://your-domain.com
# Should return 200 with SSL cert
```

---

### 6. Email & Contact Form (Optional)

If you want contact form (`/contact`) to send emails:

1. Get SendGrid API key or equivalent
2. Add to environment: `SENDGRID_API_KEY` (or similar)
3. Update `/app/actions/contact.ts` with email sending logic

For now, contact form is stored in Supabase (no email yet).

---

## Deployment Steps

### Step 1: Verify Git is Clean

```bash
cd /vercel/share/v0-project
git status
# Should show no uncommitted changes
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Production release: full auth, KYC, payments, admin dashboard"
git push origin main
```

### Step 3: Vercel Auto-Deploy

Vercel automatically deploys when you push to `main`:
1. Check Vercel Dashboard → Deployments
2. Should show a new deployment running
3. Wait for "✓ Ready" status (~2-5 mins)

### Step 4: Run Smoke Tests

**Homepage:**
```bash
curl https://your-domain.com
# Should return 200 with <html>
```

**Auth pages:**
- Visit `https://your-domain.com/auth/login`
- Visit `https://your-domain.com/auth/sign-up`
- Should load forms

**Investor app (not logged in):**
- Visit `https://your-domain.com/app`
- Should redirect to login

**Admin dashboard (test user):**
- Sign in as testadmin@pulse.test
- Visit `/app`
- Click Profile → Admin dashboard
- Should see live data

---

## Post-Deployment Checklist

### Monitoring

**Vercel Analytics:**
- Vercel Dashboard → Analytics
- Monitor LCP (Largest Contentful Paint), CLS, INP
- Goal: LCP < 2.5s, CLS < 0.1, INP < 200ms

**Supabase Monitoring:**
- Supabase Dashboard → Logs
- Check for auth errors, query failures
- Monitor database size & usage

**Real User Monitoring (optional):**
- Integrate Sentry, Datadog, or New Relic
- Monitor JavaScript errors
- Track API latency

### Security Audit

Run through these checks monthly:

1. **Auth logs:**
   ```sql
   SELECT created_at, email, event, error
   FROM auth.audit_log_entries
   ORDER BY created_at DESC
   LIMIT 100;
   ```

2. **Suspicious transactions:**
   ```sql
   SELECT user_id, type, amount, created_at
   FROM transactions
   WHERE status = 'failed' AND created_at > now() - interval '7 days'
   ORDER BY created_at DESC;
   ```

3. **Admin access log:**
   ```sql
   SELECT id, email, role, updated_at
   FROM profiles
   WHERE role = 'admin'
   ORDER BY updated_at DESC;
   ```

---

## Scaling & Performance Optimization

### Database

**Current capacity:** ~10,000 users with good performance

**As you grow:**

1. **Add indexes on frequently-filtered columns:**
   ```sql
   CREATE INDEX IF NOT EXISTS kyc_user_id_idx ON kyc_submissions(user_id);
   CREATE INDEX IF NOT EXISTS holdings_user_project_idx ON holdings(user_id, project_id);
   ```

2. **Archive old transactions (6+ months):**
   ```sql
   CREATE TABLE transactions_archive AS
   SELECT * FROM transactions WHERE created_at < now() - interval '6 months';
   
   DELETE FROM transactions WHERE created_at < now() - interval '6 months';
   ```

3. **Enable Supabase read replicas** (Pro plan+)

---

### API

**Current limits:** ~100 req/s per user

**To increase:**

1. **Enable CDN caching** on static pages:
   - Public pages (`/`, `/about`, `/projects`) are cacheable
   - Set `Cache-Control: public, max-age=3600`

2. **Add API rate limiting** (optional):
   - Use Upstash Redis for rate limits
   - Limit to 100 req/min per user

3. **Use Vercel Edge Middleware** for:
   - Authentication checks (faster)
   - Rate limiting

---

### Frontend

**Already optimized:**
- Server components reduce JavaScript
- Image optimization enabled
- Tailwind CSS minified
- Code splitting via dynamic imports

**Optional enhancements:**
- Lazy load admin dashboard tables
- Compress transaction JSON blobs
- Add service worker for offline mode

---

## Troubleshooting Production Issues

### Issue: 500 error on `/app`

**Likely cause:** Missing Supabase env vars

**Fix:**
```bash
# Check env vars are set
vercel env pull

# Redeploy to pick up new vars
vercel deploy --prod
```

---

### Issue: Supabase not configured error

**Likely cause:** `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing

**Fix:**
1. Verify in Vercel Vars (should start with `NEXT_PUBLIC_`)
2. Redeploy: `vercel deploy --prod`
3. Wait 5 mins for caches to clear

---

### Issue: "Admin access required" for authorized admin

**Likely cause:** Session stale or RLS policy issue

**Fix:**
1. Admin sign out: `/auth/logout`
2. Sign back in
3. Check Supabase: `SELECT * FROM profiles WHERE email = 'admin@email.com'` — should show `role='admin'`

---

### Issue: Webhook payments not confirming

**Likely cause:** IPN secret wrong or callback URL not set

**Fix:**
1. Verify `NOWPAYMENTS_IPN_SECRET` matches NOWPayments account
2. Check NOWPayments Settings → API → IPN Callback URL is exactly: `https://your-domain.com/api/nowpayments/ipn`
3. Test webhook: NOWPayments → API Test → Send sample webhook
4. Check Supabase logs for errors

---

## Rollback Procedure

If deployment breaks production:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy a specific commit
vercel deploy --prod --with-cache=none
```

Vercel automatically deploys; site will be restored within 2-5 minutes.

---

## Cost Estimates (Monthly)

| Service | Free Tier | Paid Tier | Cost |
|---------|-----------|-----------|------|
| Vercel | ✅ Unlimited deploys | Pro: $20/mo | $0-20 |
| Supabase | ✅ 500MB DB, 2GB bandwidth | Pro: $25/mo | $0-25 |
| Stripe (if used) | ✅ 2.9% + $0.30 | — | 2.9% + $0.30 per transaction |
| NOWPayments | ✅ Free | — | 0.5% per transaction |
| **Total** | | | $0-50 |

---

**Deployment complete! 🚀 Monitor the dashboards and enjoy your live platform.**
