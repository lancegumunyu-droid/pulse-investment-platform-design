# PULSE INVESTMENT PLATFORM — FINAL PRODUCTION DEPLOYMENT

## STATUS: READY TO LAUNCH ✅

All systems built, tested, and ready for production. Follow these 3 phases to go live.

---

## PHASE 1: CLOUDFLARE SETUP (10 Minutes)

### Step 1.1: Create Cloudflare Account
1. Go to https://dash.cloudflare.com
2. Sign up with your email
3. Verify email address
4. Click **Add a Site** → Enter `pulseinvestme.com`
5. Select **Free Plan**
6. Cloudflare scans your existing DNS records

### Step 1.2: Get Your Assigned Cloudflare Nameservers
Cloudflare will display your **assigned nameservers** (example):
```
jose.ns.cloudflare.com
sreeni.ns.cloudflare.com
```
**Save these — you'll need them for your registrar**

### Step 1.3: Update Your Registrar Nameservers ⚠️ CRITICAL
**This is the LAST STEP to activate Cloudflare. This activates protection & speed.**

1. **Log into your domain registrar** (the place you bought the domain):
   - GoDaddy
   - Namecheap
   - Squarespace (if purchased there)
   - Or check ICANN lookup: https://lookup.icann.org/

2. **Find the Nameservers section** in your registrar dashboard

3. **Replace ALL current nameservers:**
   - Delete any existing nameservers
   - Add: `jose.ns.cloudflare.com` (use YOUR assigned nameserver)
   - Add: `sreeni.ns.cloudflare.com` (use YOUR assigned nameserver)

4. **Save your changes**

5. **Wait for DNS propagation:** 1-48 hours
   - Check status: `nslookup pulseinvestme.com`
   - Should resolve to Vercel IPs: `76.76.19.0`

### Step 1.4: Create Turnstile CAPTCHA Site

**In Cloudflare Dashboard:**
1. Go to **Turnstile** (left sidebar)
2. Click **Create Site**
   - Name: `PULSE Signup`
   - Domains: `pulseinvestme.com` and `localhost:3000` (for local testing)
   - Mode: `Managed`
3. Click **Create**
4. **Copy the Site ID** (starts with `0x...`)

---

## PHASE 2: VERCEL CONFIGURATION (10 Minutes)

### Step 2.1: Add Environment Variables

**Go to:** Vercel Dashboard → Project Settings → Environment Variables

**Add these variables:**

```
# Supabase Keys (from Supabase Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_WEBHOOK_SECRET=whsec_xxxx (from Supabase Webhooks)

# Turnstile CAPTCHA (from Step 1.4)
NEXT_PUBLIC_TURNSTILE_SITE_ID=0xyour_site_id_here

# PULSE Admin Credentials (create secure passwords)
PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=your_secure_password_32_chars_minimum

# Admin API Key (generate: openssl rand -base64 32)
ADMIN_API_KEY=your_admin_api_key_base64

# App URL
NEXT_PUBLIC_APP_URL=https://pulseinvestme.com
```

### Step 2.2: Connect Custom Domain to Vercel

**In Vercel Dashboard:**
1. Go to Project → Settings → Domains
2. Click **Add Domain**
3. Enter: `pulseinvestme.com`
4. Select **Use Cloudflare nameservers** (since you just updated them)
5. Vercel will validate DNS records
6. SSL certificate auto-issued (usually <5 minutes)

### Step 2.3: Redeploy to Activate New Environment Variables

```bash
# Option 1: Automatic (recommended)
# Just push to main branch — Vercel auto-deploys

# Option 2: Manual
cd /vercel/share/v0-project
git push origin v0/lancegumunyu-droid-dc3cf8d8
# Vercel detects push and deploys
```

---

## PHASE 3: SUPABASE CONFIGURATION (15 Minutes)

### Step 3.1: Enable Auth Hooks

**In Supabase Dashboard:**
1. Go to **Authentication** → **Hooks**
2. Click **Add Send Email hook**
3. Select:
   - Hook type: **HTTPS**
   - Endpoint URL: `https://pulseinvestme.com/api/auth/hooks/send-email`
4. Copy the **Webhook Secret** → Add to Vercel env vars as `SUPABASE_WEBHOOK_SECRET`

### Step 3.2: Update Email Templates

**Go to:** Authentication → Email Templates → **Confirm Signup**

**Replace entire template with:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; }
    .header { color: #f59e0b; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
    .message { color: #333; line-height: 1.6; margin-bottom: 30px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">PULSE</div>
    <p class="message">Welcome to PULSE! Please confirm your email address to complete your registration and unlock your $35 welcome bonus.</p>
    <p>
      <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed" class="button">Confirm Email</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      Or copy this link:<br/>
      <code style="background: #f0f0f0; padding: 8px; word-break: break-all;">{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed</code>
    </p>
    <div class="footer">
      <p>This link expires in 24 hours.</p>
      <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

**Also update:** Authentication → Email Templates → **Reset Password** (similar template with security warnings)

### Step 3.3: Add Redirect URLs to Allow-List

**Go to:** Authentication → URL Configuration → Redirect URLs

**Add:**
```
https://pulseinvestme.com
https://pulseinvestme.com/auth/callback
https://pulseinvestme.com/auth/email-confirmed
https://pulseinvestme.com/auth/login
https://pulseinvestme.com/auth/sign-up
https://pulseinvestme.com/auth/forgot-password
https://pulseinvestme.com/auth/reset-password
https://pulseinvestme.com/auth/error
https://pulseinvestme.com/app
https://pulseinvestme.com/admin/login
https://pulseinvestme.com/admin/dashboard
```

### Step 3.4: Verify RLS Policies

**Go to:** SQL Editor → Run this query:

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should show: rowsecurity = true for all tables
```

All tables should have `rowsecurity = true`. If not:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

---

## VERIFICATION & TESTING (15 Minutes)

### Test 1: DNS Resolution
```bash
# Check DNS propagated
nslookup pulseinvestme.com
# Should resolve to: 76.76.19.0 (Vercel IP)

# Check HTTPS works
curl -I https://pulseinvestme.com
# Should return: 200 OK + Cloudflare SSL cert
```

### Test 2: Signup Flow
1. Go to `https://pulseinvestme.com/auth/sign-up`
2. Fill in: Name, Email, Password
3. Click **Create account**
4. **Turnstile widget appears** (proves CAPTCHA working)
5. Complete challenge
6. Button submits → Email sent
7. Check your email inbox → Click link
8. Should land on `/auth/email-confirmed`
9. Can access dashboard

### Test 3: Admin Login
1. Go to `https://pulseinvestme.com/admin/login`
2. Email: `admin@pulse-invest.app`
3. Password: `[PULSE_ADMIN_PASSWORD from env]`
4. Should access admin dashboard

### Test 4: Password Reset
1. Go to `https://pulseinvestme.com/auth/forgot-password`
2. Enter test email
3. Check email for reset link
4. Click link → set new password
5. Login with new password

### Test 5: Rate Limiting
1. Go to signup form
2. Click "Create account" 3 times rapidly
3. Button should stay **disabled** until Turnstile challenge completes
4. Proves rate limiting is working

---

## DNS RECORDS (Reference)

If needed, manually add these to Cloudflare DNS → Records:

| Type | Name | Content | TTL | Proxy |
|------|------|---------|-----|-------|
| A | @ | 76.76.19.0 | Auto | Proxied ☁️ |
| CNAME | www | cname.vercel-dns.com | Auto | Proxied ☁️ |
| CNAME | api | cname.vercel-dns.com | Auto | Proxied ☁️ |

---

## TIMELINE

| Phase | Time | Status |
|-------|------|--------|
| Cloudflare setup | 10 min | Today |
| Vercel config | 10 min | Today |
| Supabase config | 15 min | Today |
| DNS propagation | 1-48 hrs | Wait (usually 1-2 hrs) |
| Verification | 15 min | After DNS propagates |
| **LAUNCH** | **Total: 1-2 days** | ✅ LIVE |

---

## PRODUCTION LOGINS

### Admin Account
```
Email: admin@pulse-invest.app
Password: [PULSE_ADMIN_PASSWORD from Vercel env vars]
URL: https://pulseinvestme.com/admin/login
```

### Test User Account
Create during signup flow on: `https://pulseinvestme.com/auth/sign-up`

---

## TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| "Turnstile not showing" | Ensure NEXT_PUBLIC_TURNSTILE_SITE_ID is set in Vercel env |
| "captcha_token missing" | Turnstile Site ID mismatch — verify it matches Cloudflare CAPTCHA Site ID |
| Domain not resolving | Wait 24-48 hrs for nameserver propagation, or use `nslookup` to check |
| SSL certificate not issued | Check Vercel domain validation is complete |
| Email not sending | Verify Supabase HTTPS hook endpoint is correct: `https://pulseinvestme.com/api/auth/hooks/send-email` |
| Admin login fails | Check PULSE_ADMIN_EMAIL + PULSE_ADMIN_PASSWORD in env vars match exactly |

---

## FINAL CHECKLIST

- [ ] Cloudflare account created
- [ ] Turnstile CAPTCHA site created (Site ID copied)
- [ ] Registrar nameservers updated to Cloudflare ones
- [ ] DNS propagated (check with nslookup)
- [ ] Vercel env vars added (Supabase keys, Turnstile ID, PULSE credentials)
- [ ] Custom domain connected in Vercel
- [ ] Supabase Auth Hooks enabled
- [ ] Email templates updated
- [ ] Redirect URLs added to allow-list
- [ ] RLS policies verified on all tables
- [ ] Signup flow tested (Turnstile → Email → Verify → Dashboard)
- [ ] Admin login tested
- [ ] Password reset tested
- [ ] HTTPS working (no SSL errors)
- [ ] Build clean (no errors in Vercel logs)
- [ ] **LIVE & READY** ✅

---

**You are now LIVE on production. Congratulations!**

For ongoing monitoring:
- Vercel Dashboard: Check deployment logs
- Supabase Dashboard: Monitor auth events + database logs
- Cloudflare Dashboard: Monitor DDoS protection + SSL cert status
