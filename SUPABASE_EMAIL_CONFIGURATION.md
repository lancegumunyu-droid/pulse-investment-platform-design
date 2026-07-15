# PULSE – Supabase Email Verification Configuration Guide

**Date:** July 15, 2026  
**Status:** Email verification system fully configured and ready for Supabase template customization

---

## Quick Summary

Your app has a complete email verification flow with:
- ✅ Frontend callback handler: `/auth/callback`
- ✅ Success page: `/auth/email-confirmed`
- ✅ Error page: `/auth/error`
- ⚠️ Needs: Supabase email template + redirect URL configuration

---

## 1. Frontend Configuration (Already Done ✅)

### Signup Redirect URL
**File:** `components/pulse/auth-form.tsx` (line 73)
```typescript
emailRedirectTo: `${window.location.origin}/auth/callback`,
```

This tells Supabase to send the verification code to your `/auth/callback` handler.

### Callback Handler
**File:** `app/auth/callback/route.ts`
```typescript
GET /auth/callback?code=<token>
```

**What it does:**
1. Receives the verification code from Supabase
2. Exchanges it for a session using `supabase.auth.exchangeCodeForSession(code)`
3. Marks user's `email_confirmed = true` in the profiles table
4. Sets `approval_status = 'pending_admin_approval'`
5. Redirects to: `/auth/email-confirmed` (success) or `/auth/error` (failure)

### Success Page
**File:** `app/auth/email-confirmed/page.tsx`

Shows:
- Green checkmark animation
- "Email Confirmed!" message
- Next steps (admin approval, KYC, welcome bonus)
- Button to access dashboard: `/app`
- Referral code display

---

## 2. What Users Land On

### After Clicking Email Verification Link

**URL Chain:**
```
1. Email link:
   https://pulse-invest.vercel.app/auth/callback?code=abc123...def456

2. Server-side code exchange (instantaneous)

3. Success redirect:
   https://pulse-invest.vercel.app/auth/email-confirmed
   ✓ Shows confirmation page
   ✓ User can access dashboard

   OR

   Error redirect:
   https://pulse-invest.vercel.app/auth/error?message=Invalid+confirmation+code
   ✓ Shows error message
```

---

## 3. What To Configure in Supabase

### A. Email Template (Confirm Signup)

**Location:** Supabase Dashboard → Authentication → Email Templates → Confirm Signup

**Current template (default):**
```html
<a href="{{ .ConfirmationURL }}">Confirm your signup</a>
```

**Replace with (Option 1 - Recommended):**
```html
<a href="{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed">
  Verify Your Email
</a>
```

**OR (Option 2 - Simpler, if RedirectTo configured):**
```html
<a href="{{ .ConfirmationURL }}&redirect_to=/auth/email-confirmed">
  Verify Your Email
</a>
```

**Template Variables Reference:**
- `{{ .SiteURL }}` = Your site URL (https://pulse-invest.vercel.app)
- `{{ .ConfirmationURL }}` = Full Supabase-generated verification URL
- `{{ .TokenHash }}` = The verification token hash
- `{{ .RedirectTo }}` = Custom redirect (if configured in URL settings)

### B. Redirect URLs Allow-List

**Location:** Supabase Dashboard → Authentication → URL Configuration

**Add these URLs:**
```
https://pulse-invest.vercel.app/auth/callback
https://pulse-invest.vercel.app/auth/email-confirmed
https://pulse-invest.vercel.app/auth/error
```

**Optional (for development):**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/email-confirmed
http://localhost:3000/auth/error
```

---

## 4. Email Template HTML (Full Example)

Use this complete email template for professional branding:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; color: white; }
    .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin: 0 0 10px 0; }
    .content { padding: 40px 20px; }
    .greeting { font-size: 18px; color: #333; margin: 0 0 20px 0; }
    .message { color: #666; line-height: 1.6; margin: 0 0 30px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .button:hover { background: #d97706; }
    .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
    .security-note { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .security-note-text { color: #92400e; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PULSE</div>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Investment Platform</p>
    </div>
    <div class="content">
      <p class="greeting">Hello {{ .Email }},</p>
      <p class="message">
        Welcome to PULSE! We're excited to have you join our investment community. 
        To complete your registration and unlock your $35 welcome bonus, please verify your email address by clicking the button below.
      </p>
      <center>
        <a href="{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed" class="button">
          Verify Email Address
        </a>
      </center>
      <div class="security-note">
        <p class="security-note-text">
          <strong>Security Tip:</strong> This link will expire in 24 hours. If you didn't create this account, please ignore this email.
        </p>
      </div>
      <p class="message" style="font-size: 14px; color: #999;">
        Or copy and paste this link in your browser:<br/>
        <code style="background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: block; margin-top: 10px; word-break: break-all; font-size: 12px;">
          {{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email&redirect_to=/auth/email-confirmed
        </code>
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px 0;">© 2026 PULSE Investment Platform. All rights reserved.</p>
      <p style="margin: 0;">For questions, contact us at support@pulse.com</p>
    </div>
  </div>
</body>
</html>
```

---

## 5. Testing Checklist

- [ ] **Set email template** in Supabase (Confirm Signup)
- [ ] **Add redirect URLs** to allow-list (3 URLs minimum)
- [ ] **Test signup** with a test email
- [ ] **Click email link** and verify it redirects to `/auth/email-confirmed`
- [ ] **Check database** — `profiles.email_confirmed` should be `true`
- [ ] **Check approval_status** — should be `pending_admin_approval`
- [ ] **Try error case** — copy an old/invalid link, verify error page shows

---

## 6. Debugging: What URL Is in the Email?

**To debug the email URL Supabase is sending:**

1. **Trigger a signup** on your app
2. **Check your email** — do NOT click the link yet
3. **Copy the full URL** from the `href` attribute
4. **Check the format:**

```
✅ CORRECT FORMAT:
https://pulse-invest.vercel.app/auth/callback?code=abc123...&type=email

✅ WITH REDIRECT (if using ConfirmationURL):
https://pulse-invest.vercel.app/auth/callback?code=abc123...&redirect_to=/auth/email-confirmed

❌ WRONG (sent to Supabase, not your app):
https://hogsoxhamnpdnrdelgit.supabase.co/auth/v1/callback?code=abc123...

❌ WRONG (missing /auth/callback path):
https://pulse-invest.vercel.app?code=abc123...
```

If you see the ❌ patterns, the email template is using the wrong variable. Update it to use `{{ .SiteURL }}/auth/callback` instead.

---

## 7. Common Issues & Fixes

### Issue: User clicks link → blank page or 404

**Cause:** Redirect URL not in allow-list

**Fix:**
1. Go to Supabase → Authentication → URL Configuration
2. Add `https://pulse-invest.vercel.app/auth/callback`
3. Save and test again

---

### Issue: User clicks link → redirects to Supabase domain

**Cause:** Email template using `{{ .ConfirmationURL }}` without your SiteURL

**Fix:**
1. Replace template with:
   ```html
   <a href="{{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email">Verify</a>
   ```
2. Save and test

---

### Issue: Code exchange fails (error page shown)

**Cause:** Token expired, already used, or invalid

**Check:** Is the error message shown? Check `app/auth/error/page.tsx` to see the message

**Fix:** Trigger a new signup and test with a fresh token

---

## 8. Environment Variables (Verify)

**Required in Vercel project settings:**
```
NEXT_PUBLIC_SUPABASE_URL       = https://hogsoxhamnpdnrdelgit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = [your anon key]
SUPABASE_SERVICE_ROLE_KEY      = [your service role key]
```

**Verify in Supabase project:**
- Settings → API → Copy the URL and anon key
- Settings → API → Copy the service role key

---

## 9. Submit to Supabase Support (If Issues)

**If email verification still broken, provide this info to Supabase:**

```
Project ID: hogsoxhamnpdnrdelgit
Issue: Email verification redirects not working

Frontend Setup:
  - Callback path: /auth/callback
  - Success page: /auth/email-confirmed
  - emailRedirectTo: `${window.location.origin}/auth/callback`

Current Email Template Variables:
  [paste what you're currently using]

Expected Behavior:
  User clicks email → lands on https://pulse-invest.vercel.app/auth/email-confirmed

Actual Behavior:
  [describe what happens]

Requested Configuration:
  - Email template: {{ .SiteURL }}/auth/callback?token={{ .TokenHash }}&type=email
  - Redirect URLs: 
    * https://pulse-invest.vercel.app/auth/callback
    * https://pulse-invest.vercel.app/auth/email-confirmed
```

---

## Summary

| Component | Status | Path |
|-----------|--------|------|
| Callback handler | ✅ Ready | `/app/auth/callback/route.ts` |
| Success page | ✅ Ready | `/app/auth/email-confirmed/page.tsx` |
| Error page | ✅ Ready | `/app/auth/error/page.tsx` |
| Email template | ⚠️ Config needed | Supabase Dashboard |
| Redirect URLs | ⚠️ Config needed | Supabase Dashboard |

**Next Step:** Configure the email template and redirect URLs in Supabase, then test with a new signup.
