# PULSE - Complete Supabase Configuration & Redirect URLs

## 1. Redirect URLs Configuration (Add to Supabase Dashboard)

### Go to: Authentication → URL Configuration → Redirect URLs

**Add ALL of these URLs:**

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

**For local development, also add:**
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

---

## 2. Email Verification Template (Confirm Signup)

### Go to: Authentication → Email Templates → Confirm Signup

**Replace the template with:**

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
      <p>© 2026 PULSE Investment Platform - Africa & Beyond</p>
    </div>
  </div>
</body>
</html>
```

**Critical Variables:**
- `{{ .SiteURL }}` - Your app domain (https://pulse-invest.vercel.app)
- `{{ .TokenHash }}` - The verification token hash
- `type=email` - Tells the frontend this is email verification
- `token_hash=` - NOT `code=` (OTP flow)

---

## 3. Password Reset Template

### Go to: Authentication → Email Templates → Reset Password

**Replace the template with:**

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

## 4. Magic Link / Invite Template (Optional)

### Go to: Authentication → Email Templates → Invite

**If you want custom invite emails for admin/staff:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; }
    .header { color: #f59e0b; font-size: 28px; font-weight: bold; margin-bottom: 20px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">You're Invited to PULSE</div>
    <p>You've been invited to join the PULSE Investment Platform as a team member.</p>
    <p>
      <a href="{{ .ConfirmationURL }}" class="button">Accept Invitation</a>
    </p>
  </div>
</body>
</html>
```

---

## 5. Environment Variables (Add to Vercel Project)

### Go to: Project Settings → Environment Variables

Add these (you'll get most from Supabase → Project Settings):

```
# Supabase Public
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# Supabase Private (Server-only)
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
SUPABASE_JWT_SECRET=[YOUR_JWT_SECRET]
SUPABASE_URL=https://[PROJECT_ID].supabase.co

# Database URLs (if using Supabase Postgres)
POSTGRES_URL=postgresql://[user]:[password]@[host]:[port]/[database]
POSTGRES_PRISMA_URL=postgresql://[user]:[password]@[host]:[port]/[database]?schema=public&connect_timeout=15

# Admin Authentication (for manual portal access)
PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=[SECURE_PASSWORD_32_CHARS_MIN]

# Admin API Key (for backend integrations)
ADMIN_API_KEY=[GENERATE_WITH: openssl rand -base64 32]

# Optional: Email service
EMAIL_SERVICE_KEY=[YOUR_EMAIL_SERVICE_KEY]

# Optional: Payment gateway
NOWPAYMENTS_API_KEY=[YOUR_NOWPAYMENTS_KEY]
STRIPE_PUBLIC_KEY=[YOUR_STRIPE_KEY]
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET]
```

---

## 6. RLS Policies & Restrictions

### All tables have RLS enabled. Key restrictions:

| Table | Restriction | Who Can Access |
|-------|-----------|-----------------|
| `admin_roles` | FORCE RLS - admin only | Only admin_users records |
| `admin_users` | FORCE RLS - owner + admin | Only own record + admin |
| `wallets` | FORCE RLS - owner only | Own wallet only |
| `transactions` | FORCE RLS - owner + admin | Own transactions + admin |
| `deposits` | User sees own, admin sees all | Can view but NOT approve without SECURITY DEFINER |
| `withdrawals` | User sees own, admin sees all | Can view but NOT approve without SECURITY DEFINER |
| `device_signups` | Admin only | One signup per device fingerprint |

**Key:** Server-side operations (deposits/withdrawals approval) use SECURITY DEFINER functions in Neon, NOT direct table writes.

---

## 7. Authentication Flows

### User Signup
```
1. /auth/sign-up → AuthForm component
2. supabase.auth.signUp({ email, password, emailRedirectTo: '/auth/callback' })
3. Email sent with verification link
4. User clicks link → /auth/callback?token_hash=X&type=email
5. Handler calls supabase.auth.verifyOtp({ type: 'email', token_hash })
6. Session created → redirect to /auth/email-confirmed
```

### Password Reset
```
1. /auth/forgot-password → ForgotPasswordForm
2. supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset-password' })
3. Email sent with reset link
4. User clicks → browser lands on /auth/reset-password
5. ResetPasswordForm checks for valid session
6. User enters new password → supabase.auth.updateUser({ password })
7. Success → redirect to /auth/login
```

### Admin Login
```
1. /admin/login → AdminLoginForm (NOT Supabase auth)
2. Manual credentials: PULSE_ADMIN_EMAIL + PULSE_ADMIN_PASSWORD
3. Server-side validation (see /app/api/admin/auth/route.ts)
4. Session stored in HTTP-only cookie
5. Redirect to /admin/dashboard
```

---

## 8. Testing Checklist

- [ ] All redirect URLs added to allow-list
- [ ] Email templates updated (Confirm Signup + Reset Password)
- [ ] Sign up → verify email works → lands on /auth/email-confirmed
- [ ] Forgot password → email received → reset works → login succeeds
- [ ] Admin login → credentials required → can access /admin/dashboard
- [ ] All env vars set in Vercel project
- [ ] Build succeeds (pnpm build)
- [ ] No auth errors in logs

---

## 9. Supabase Dashboard Checklist

- [ ] **Authentication → Providers:** Email enabled (toggle on)
- [ ] **Authentication → User & Access Control:** JWT secret configured
- [ ] **Authentication → URL Configuration:** All 13+ URLs added
- [ ] **Authentication → Email Templates:**
  - [ ] Confirm Signup: Updated with token_hash
  - [ ] Reset Password: Updated
  - [ ] Invite: Optional but recommended
- [ ] **Authentication → Auth Policies:** Existing policies retained

---

## 10. Quick Reference - URL Paths

| Path | Purpose | Redirect After |
|------|---------|-----------------|
| `/auth/callback` | Email verification handler | `/auth/email-confirmed` |
| `/auth/email-confirmed` | Success page (user lands here) | Auto-redirect to `/app` |
| `/auth/forgot-password` | Request password reset | Shows success message |
| `/auth/reset-password` | Set new password | `/auth/login` |
| `/auth/login` | Login form | `/app` or `/admin/dashboard` |
| `/auth/sign-up` | Registration form | `/auth/sign-up-success` then `/auth/callback` |
| `/auth/error` | Auth error page | Manual retry or contact support |
| `/admin/login` | Admin-only login | `/admin/dashboard` |
| `/admin/dashboard` | Admin portal | Protected by PULSE_ADMIN credentials |

---

## 11. Common Issues & Fixes

**Issue:** Users redirected to error page after clicking email link
- **Fix:** Check email template uses `token_hash` (not `code`) and `type=email`

**Issue:** Password reset link shows "invalid or expired"
- **Fix:** Check redirect URL is in allow-list: `https://pulse-invest.vercel.app/auth/reset-password`

**Issue:** Localhost doesn't work during development
- **Fix:** Add http://localhost:3000 and all auth paths to redirect URLs

**Issue:** Admin login always fails
- **Fix:** Check PULSE_ADMIN_EMAIL + PULSE_ADMIN_PASSWORD env vars are set

**Issue:** RLS policy errors after making RLS changes
- **Fix:** All 16 tables have RLS enabled + policies applied. Check audit logs in Supabase console.

---

## 12. Production Deployment Checklist

- [ ] Domain configured (pulse-invest.vercel.app)
- [ ] All Redirect URLs updated in Supabase
- [ ] Email templates live and tested
- [ ] Environment variables set in Vercel project
- [ ] RLS policies verified (pnpm build succeeds)
- [ ] Smoke test: sign up → verify email → login
- [ ] Admin credentials documented safely (1Password, LastPass, etc.)
- [ ] Monitoring set up (Vercel logs + Supabase auth logs)
