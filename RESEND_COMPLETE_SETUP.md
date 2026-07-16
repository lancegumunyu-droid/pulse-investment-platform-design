# PULSE + RESEND COMPLETE SETUP GUIDE

## 🚀 Resend Setup (5 Minutes)

### Step 1: Create Resend Account & Get API Key
1. Go to https://resend.com
2. Sign up with your email
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (looks like: `re_xxxxxxxxxxxxxx`)

### Step 2: Add to Vercel Environment Variables
**Go to:** Vercel Dashboard → Project Settings → Environment Variables

Add this variable:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

Redeploy or restart dev server.

---

## 🔗 Auth0 Email Provider Configuration

### Step 1: Go to Auth0 Email Provider Settings
**URL:** https://manage.auth0.com → Authentication → Email Provider

### Step 2: Enable Custom Email Provider
1. Toggle ON: **"Use my own email provider"**
2. Select: **Resend** from dropdown

### Step 3: Fill in Resend Details

**Field: Resend API Key**
```
re_xxxxxxxxxxxxxx
```

**Field: From Email**
```
noreply@pulse-invest.vercel.app
```

**Field: From Name**
```
PULSE
```

### Step 4: Save

---

## 💌 PULSE Email Templates (Already Implemented)

Your project now includes these premium email templates:

### 1. **Signup Confirmation Email**
- File: `lib/email.ts` → `sendSignupConfirmationEmail()`
- Sends to: New users on signup
- Includes: Welcome bonus (50 USDT), confirmation link, PULSE branding

### 2. **Password Reset Email**
- File: `lib/email.ts` → `sendPasswordResetEmail()`
- Sends to: Users who request password reset
- Includes: Reset link, security warnings, 24-hour expiry

### 3. **Welcome Active Email**
- File: `lib/email.ts` → `sendWelcomeActiveEmail()`
- Sends to: Users after email confirmation
- Includes: Dashboard access, feature overview, next steps

### 4. **Account Approved Email**
- File: `lib/email.ts` → `sendAccountApprovedEmail()`
- Sends to: Users approved by admin
- Includes: Full access unlock, investment opportunities

---

## 🔧 Using Email Templates in Your Code

### Import the Email Service
```typescript
import { 
  sendSignupConfirmationEmail, 
  sendPasswordResetEmail,
  sendWelcomeActiveEmail,
  sendAccountApprovedEmail 
} from '@/lib/email';
```

### Send Signup Confirmation Email
```typescript
await sendSignupConfirmationEmail(
  'user@example.com',
  'John Doe',
  'https://pulse-invest.vercel.app/auth/callback?token=xxx&type=signup'
);
```

### Send Password Reset Email
```typescript
await sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'https://pulse-invest.vercel.app/auth/reset-password?token=xxx'
);
```

### Send Welcome Active Email
```typescript
await sendWelcomeActiveEmail(
  'user@example.com',
  'John Doe',
  'https://pulse-invest.vercel.app/app'
);
```

### Send Account Approved Email
```typescript
await sendAccountApprovedEmail(
  'user@example.com',
  'John Doe',
  'https://pulse-invest.vercel.app/app/dashboard'
);
```

---

## 🎨 Email Branding Configuration

All emails use PULSE branding defined in `lib/email.ts`:

```typescript
const PULSE_BRANDING = {
  from: 'PULSE <noreply@pulse-invest.vercel.app>',
  logoUrl: 'https://pulse-invest.vercel.app/pulse-logo.png',
  primaryColor: '#f59e0b',    // Gold
  brandColor: '#1a1a1a',      // Dark
  accentColor: '#f5f5dc',     // Crème
};
```

To customize, edit these values in `lib/email.ts`.

---

## ✅ Testing Email Integration

### Test 1: Test Email Endpoint (if created)
```bash
curl -X POST https://pulse-invest.vercel.app/api/email/send-test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Test 2: Signup Flow
1. Go to https://pulse-invest.vercel.app/auth/sign-up
2. Fill form and submit
3. Check email inbox for confirmation email
4. Click confirmation link
5. Should see success message

### Test 3: Password Reset
1. Go to https://pulse-invest.vercel.app/auth/forgot-password
2. Enter email
3. Check inbox for reset email
4. Click reset link
5. Set new password

---

## 🔑 Environment Variables Required

```
# Resend API
RESEND_API_KEY=re_xxxxxxxxxxxxxx

# Supabase (for Auth Hooks)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_JWT_SECRET=your_secret
SUPABASE_WEBHOOK_SECRET=whsec_xxx

# Auth0
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_ID=0x4AAAAAAD2hbNmbbW7vdZXO
TURNSTILE_SECRET_KEY=0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i

# App
NEXT_PUBLIC_APP_URL=https://pulse-invest.vercel.app
```

---

## 📊 Email Statistics & Monitoring

### Monitor Resend Emails
1. Go to https://resend.com/dashboard
2. View email sending stats
3. Check delivery rates
4. Monitor bounce/complaint rates

### Monitor Auth0 Emails
1. Go to https://manage.auth0.com → Logs
2. Check email sending logs
3. View failed email attempts
4. Monitor email delays

---

## 🚨 Troubleshooting

### Issue: "RESEND_API_KEY is not set"
**Solution:** 
1. Add RESEND_API_KEY to Vercel env vars
2. Restart dev server
3. Redeploy on Vercel

### Issue: Emails not received
**Solution:**
1. Check spam folder
2. Verify "from" email in Auth0 settings: `noreply@pulse-invest.vercel.app`
3. Check Resend dashboard for delivery errors
4. Verify Resend API key is correct

### Issue: Email template not rendering
**Solution:**
1. Check HTML syntax in template
2. Verify all variables are passed correctly
3. Check browser console for errors
4. Test with plain text email first

### Issue: Auth0 email provider not working
**Solution:**
1. Verify Resend API key is correct
2. Confirm "from" email matches Auth0 setting
3. Check Auth0 logs for errors
4. Restart Auth0 connection

---

## 🎯 Next Steps

1. ✅ Add RESEND_API_KEY to Vercel
2. ✅ Configure Auth0 Email Provider with Resend
3. ✅ Test signup email flow
4. ✅ Test password reset email
5. ✅ Monitor email delivery in Resend dashboard
6. ✅ Go live!

---

## 📚 Additional Resources

- Resend Docs: https://resend.com/docs
- Auth0 Email Provider Docs: https://auth0.com/docs/get-started/applications/applications
- PULSE Email Templates: `lib/email.ts`
- Email API Route: `app/api/email/` (create as needed)

---

## 🎉 You're Ready!

Your PULSE platform now has world-class, premium email integration with:
- ✨ Beautiful PULSE-branded templates
- 🚀 Reliable Resend delivery
- 🔐 Auth0 integration
- 📧 4 different email types (signup, password reset, welcome, approval)
- 📊 Full monitoring and analytics

**Go test your signup flow!**

