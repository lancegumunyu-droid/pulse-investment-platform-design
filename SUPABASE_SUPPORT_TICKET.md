# PULSE - Supabase Configuration Support Ticket Template

**Copy & paste this into a Supabase support ticket if you need assistance, or use it as a checklist for manual setup.**

---

## SETUP REQUIRED (Do These in Supabase Dashboard)

### 1. Authentication → Providers

- [ ] **Email**: Toggle ON (enabled)
- [ ] **Confirm email**: Enabled
- [ ] **Double confirm change email**: Optional (toggle if desired)

### 2. Authentication → URL Configuration

Add ALL of these to **Redirect URLs** (one per line):

```
https://pulse-invest.vercel.app
https://pulse-invest.vercel.app/auth/callback
https://pulse-invest.vercel.app/auth/email-confirmed
https://pulse-invest.vercel.app/auth/login
https://pulse-invest.vercel.app/auth/sign-up
https://pulse-invest.vercel.app/auth/forgot-password
https://pulse-invest.vercel.app/auth/reset-password
https://pulse-invest.vercel.app/auth/resend-verification
https://pulse-invest.vercel.app/auth/error
https://pulse-invest.vercel.app/app
https://pulse-invest.vercel.app/admin/login
https://pulse-invest.vercel.app/admin/dashboard
https://pulse-invest.vercel.app/admin/panel
```

**For local development (optional):**
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/auth/email-confirmed
http://localhost:3000/auth/login
http://localhost:3000/auth/sign-up
http://localhost:3000/auth/forgot-password
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/error
http://localhost:3000/app
http://localhost:3000/admin/login
```

### 3. Authentication → Email Templates

#### Template 1: Confirm Signup

Go to **Authentication** → **Email Templates** → **Confirm Signup** (NOT Invite)

Replace **entire template** with:

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
    <p class="message">Welcome to PULSE Investment Platform! Please confirm your email address to complete your registration.</p>
    <p>
      <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed" class="button">Confirm Email Address</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      Or copy and paste this link in your browser:<br/>
      <code style="background: #f0f0f0; padding: 8px; word-break: break-all;">{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed</code>
    </p>
    <div class="footer">
      <p>This link expires in 24 hours.</p>
      <p>© 2026 PULSE Investment Platform</p>
    </div>
  </div>
</body>
</html>
```

**Key variables used:**
- `{{ .SiteURL }}` → Your domain
- `{{ .TokenHash }}` → Verification token
- `token_hash=` → Parameter name (OTP flow)
- `type=email` → Tells frontend this is email verification

#### Template 2: Reset Password

Go to **Authentication** → **Email Templates** → **Reset Password**

Replace **entire template** with:

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
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Password Reset</div>
    <p class="message">We received a request to reset your password. Click the button below to create a new password.</p>
    <p>
      <a href="{{ .SiteURL }}/auth/reset-password" class="button">Reset Password</a>
    </p>
    <div class="warning">
      <strong>Didn't request this?</strong> You can safely ignore this email. Your password will not change until you create a new one.
    </div>
    <p style="font-size: 14px; color: #666;">
      Or copy and paste this link:<br/>
      <code style="background: #f0f0f0; padding: 8px; word-break: break-all;">{{ .SiteURL }}/auth/reset-password</code>
    </p>
    <div class="footer">
      <p>This link expires in 24 hours.</p>
      <p>© 2026 PULSE Investment Platform</p>
    </div>
  </div>
</body>
</html>
```

---

## ENVIRONMENT VARIABLES (Set in Vercel Project)

Go to **Vercel Dashboard** → **Project Settings** → **Environment Variables**

Add these (get values from Supabase → Project Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL = https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [YOUR_ANON_KEY]

SUPABASE_URL = https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY = [YOUR_SERVICE_ROLE_KEY]
SUPABASE_JWT_SECRET = [YOUR_JWT_SECRET]
SUPABASE_ANON_KEY = [YOUR_ANON_KEY]

PULSE_ADMIN_EMAIL = admin@pulse-invest.app
PULSE_ADMIN_PASSWORD = [Generate: openssl rand -base64 32]
ADMIN_API_KEY = [Generate: openssl rand -base64 32]
```

**Why these are needed:**
- `NEXT_PUBLIC_*` → Used in browser (safe to expose)
- `SUPABASE_*` (non-PUBLIC) → Server-only (keep secret)
- `PULSE_ADMIN_*` → Admin portal credentials (NOT Supabase)
- `ADMIN_API_KEY` → Backend admin operations

---

## FRONTEND CODE (Already Implemented)

Your Next.js app already has:

### Email Verification Flow
**File:** `/app/auth/callback/route.ts`
- Receives: `?token_hash=X&type=email&redirect_to=/auth/email-confirmed`
- Calls: `supabase.auth.verifyOtp({ type: 'email', token_hash })`
- Result: Session created + redirect to `/auth/email-confirmed`

### Password Reset Flow
**File:** `/components/pulse/reset-password-form.tsx`
- User enters new password
- Calls: `supabase.auth.updateUser({ password })`
- Redirects to: `/auth/login`

### User Signup Flow
**File:** `/components/pulse/auth-form.tsx`
- Signs up with: `supabase.auth.signUp({ email, password, emailRedirectTo: '/auth/callback' })`
- Email sent automatically (Supabase handles this)
- User clicks email link → flows to verification above

### Admin Login (Custom, NOT Supabase)
**File:** `/components/pulse/admin-login-form.tsx`
- Uses `PULSE_ADMIN_EMAIL` + `PULSE_ADMIN_PASSWORD`
- Verified server-side (`/app/api/admin/auth/route.ts`)
- Creates HTTP-only session cookie

---

## TESTING YOUR SETUP

### Checklist:
1. [ ] Redirect URLs added to allow-list
2. [ ] Email templates updated (Confirm Signup + Reset Password)
3. [ ] All env vars set in Vercel
4. [ ] Deploy to Vercel
5. [ ] **Test signup → email arrives → click link → lands on /auth/email-confirmed**
6. [ ] **Test forgot password → email arrives → reset works → login succeeds**
7. [ ] **Test admin login → PULSE_ADMIN_EMAIL/PASSWORD → access /admin/dashboard**

---

## COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| Users redirected to error after email click | Check template uses `token_hash` (not `code`) + `type=email` |
| Password reset shows "invalid link" | Add `https://pulse-invest.vercel.app/auth/reset-password` to redirect URLs |
| Localhost doesn't work | Add `http://localhost:3000` and all auth paths to redirect URLs |
| Admin login always fails | Check `PULSE_ADMIN_EMAIL` + `PULSE_ADMIN_PASSWORD` env vars are set |
| Emails not sending | Check Email provider is enabled (Authentication → Providers → Email ON) |

---

## SECURITY NOTES

- ✅ **RLS enabled on all 16 tables** — users cannot modify other users' data
- ✅ **Wallets + Transactions forced RLS** — even superuser is checked
- ✅ **Admin credentials separate from Supabase** — `/admin/login` uses PULSE_ADMIN_EMAIL/PASSWORD
- ✅ **Device fingerprint guard** — one signup per device (prevents abuse)
- ✅ **Email verification required** — must confirm before dashboard access
- ✅ **Password reset token expires in 24 hours** — set in Supabase (default)

---

## DEPLOYMENT

Once you've done all the above:

1. **Push to Vercel**
   ```bash
   git add -A
   git commit -m "config: Supabase setup"
   git push origin main
   ```

2. **Vercel deploys automatically**
   - Check: Vercel Dashboard → Deployments → Latest

3. **Test production**
   - Sign up at `https://pulse-invest.vercel.app/auth/sign-up`
   - Verify email
   - Login and access dashboard

4. **Monitor**
   - Vercel: Dashboard logs
   - Supabase: Authentication → Logs

---

**Contact Supabase support if any template/configuration issues arise.**
**Reference:** Project ID `hogsoxhamnpdnrdelgit` on Supabase
