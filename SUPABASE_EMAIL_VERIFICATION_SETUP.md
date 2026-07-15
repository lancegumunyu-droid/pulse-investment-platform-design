# Supabase Email Verification Setup — PULSE

## Overview

PULSE uses **token-based email verification** (OTP verification) instead of code-based flows.

- **Email template variable:** `token_hash` (not `code`)
- **Verification method:** `verifyOtp({ type: 'email', token_hash })`
- **Frontend handler:** `/app/auth/callback/route.ts`
- **Success redirect:** `/auth/email-confirmed`

---

## What Your Frontend Expects

**File:** `/app/auth/callback/route.ts`

**Expected URL from Supabase email:**
```
https://pulse-invest.vercel.app/auth/callback?token_hash=<hash>&type=email&redirect_to=/auth/email-confirmed
```

**What happens:**
1. Handler receives `token_hash` and `type`
2. Calls `supabase.auth.verifyOtp({ type: 'email', token_hash })`
3. If valid → user session is created
4. Marks user's email as confirmed in `profiles` table
5. Redirects to `/auth/email-confirmed`

---

## Supabase Configuration (3 Steps)

### Step 1: Update Email Template

**In Supabase Dashboard:**
1. Go to **Authentication** → **Email Templates**
2. Click **Confirm Signup**
3. **Replace** the entire template with:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed">Confirm your email</a></p>

<!-- Fallback for email clients that don't render links -->
<p>Or copy and paste this link in your browser:</p>
<p>{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed</p>
```

**Or (HTML-formatted):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
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
    <p class="message">Welcome to PULSE! Please confirm your email address to complete your registration.</p>
    <p>
      <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed" class="button">Confirm Email</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      Or copy this link:<br/>
      <code style="background: #f0f0f0; padding: 8px; word-break: break-all;">{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed</code>
    </p>
    <div class="footer">
      <p>This link expires in 24 hours. If you didn't create this account, please ignore this email.</p>
      <p>© 2026 PULSE Investment Platform</p>
    </div>
  </div>
</body>
</html>
```

4. Click **Save**

### Step 2: Verify Redirect URLs

**In Supabase Dashboard:**
1. Go to **Authentication** → **URL Configuration**
2. Scroll to **Redirect URLs**
3. Ensure these URLs are listed:
   ```
   https://pulse-invest.vercel.app/auth/callback
   https://pulse-invest.vercel.app/auth/email-confirmed
   https://pulse-invest.vercel.app/auth/error
   https://pulse-invest.vercel.app
   ```
4. If missing, add them and click **Save**

### Step 3: Test

1. **Sign up** with a test email in your app
2. **Check email** — you should receive verification link with `token_hash=...&type=email`
3. **Click link** — should land on `/auth/email-confirmed`
4. **Verify session** — user should be logged in

---

## Email Template Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `{{ .SiteURL }}` | Your app's base domain | `https://pulse-invest.vercel.app` |
| `{{ .TokenHash }}` | The email verification token | `abc123def456...` |
| `{{ .ConfirmationURL }}` | ❌ **Don't use** — Supabase default, not customized | — |
| `{{ .RedirectTo }}` | ❌ **Don't use** — usually empty | — |

---

## Frontend Code (Already Configured)

**File:** `/app/auth/callback/route.ts`

This file handles the email verification callback. Key points:

- ✅ Accepts `token_hash` + `type` parameters
- ✅ Calls `supabase.auth.verifyOtp()` (not `exchangeCodeForSession`)
- ✅ Marks email as confirmed in `profiles` table
- ✅ Redirects to `/auth/email-confirmed` on success
- ✅ Redirects to `/auth/error?message=...` on failure
- ✅ Imports from `@/lib/supabase/server` (correct path)

---

## Supabase Client Helper (`@/lib/supabase/server`)

**File:** `/lib/supabase/server.ts`

Provides `createClient()` helper that:
- Uses `createServerClient` from `@supabase/ssr`
- Manages cookies for session persistence
- Called from Route Handlers and Server Actions

```typescript
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // ... returns configured Supabase client
}
```

---

## Common Issues & Fixes

### Issue: Link redirects to error page
**Likely cause:** Template uses wrong variable (e.g., `{{ .ConfirmationURL }}`)
**Fix:** Use `{{ .TokenHash }}` + `{{ .SiteURL }}/auth/callback?token_hash=...`

### Issue: "Invalid token" error
**Likely cause:** Token expired (24 hours) or was already used
**Fix:** Resend verification email; user clicks new link

### Issue: User lands on blank page or wrong redirect
**Likely cause:** Redirect URL not in Supabase allow-list
**Fix:** Add all URLs to **Authentication → URL Configuration → Redirect URLs**

### Issue: "Missing token parameters" error
**Likely cause:** Email template not updated; still sending `code` instead of `token_hash`
**Fix:** Check email template, ensure it uses `token_hash={{ .TokenHash }}`

---

## Email Template Migration Checklist

- [ ] Email template updated with `token_hash` variable
- [ ] `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed` in template
- [ ] Redirect URLs added to allow-list:
  - [ ] `https://pulse-invest.vercel.app/auth/callback`
  - [ ] `https://pulse-invest.vercel.app/auth/email-confirmed`
  - [ ] `https://pulse-invest.vercel.app/auth/error`
- [ ] Callback handler exists at `/app/auth/callback/route.ts`
- [ ] Test sign-up → email verification → lands on `/auth/email-confirmed`

---

## Quick Reference: URL Flows

```
User signs up
  ↓
Supabase sends email with link:
  https://pulse-invest.vercel.app/auth/callback?token_hash=abc123&type=email&redirect_to=/auth/email-confirmed
  ↓
User clicks link
  ↓
GET /auth/callback runs
  - verifyOtp(type='email', token_hash='abc123')
  - Session created
  - Email marked confirmed
  ↓
Redirect to /auth/email-confirmed ✅
```

---

## Support

If verification still fails after these steps:
1. Check browser console for errors
2. Check Supabase logs: **Authentication → Logs**
3. Verify email was sent with correct link
4. Confirm redirect URLs are in allow-list
