# Supabase Auth Hooks - Complete Setup Guide

## Overview

Supabase Auth Hooks allow you to customize the authentication email flow. When a user signs up or requests a password reset, you intercept that event and send your own branded email.

Two approaches:
1. **HTTPS** (Recommended) — Call your Next.js API endpoint
2. **Postgres** (Alternative) — Call a database function

---

## OPTION 1: HTTPS ENDPOINT (Recommended)

### Best For:
- Full control over email design
- Direct integration with email services (Resend, SendGrid, nodemailer)
- Easy debugging and logging
- Environment variables and secrets
- Complex email logic

### ✅ Setup Steps

#### Step 1: Generate Webhook Secret (Supabase)

Go to: **Supabase Dashboard → Authentication → Hooks**

Supabase will generate a `SUPABASE_WEBHOOK_SECRET`. Copy this value.

#### Step 2: Add Environment Variable

**In Vercel Dashboard → Settings → Environment Variables:**

```
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_here
```

**In .env.development.local (local testing):**

```
SUPABASE_WEBHOOK_SECRET=your_webhook_secret_here
```

#### Step 3: Create Auth Hook in Supabase

**Go to:** Supabase Dashboard → Authentication → Hooks

**Click:** "Add Send Email hook"

**Configure:**
- **Hook type:** HTTPS
- **Endpoint URL:** `https://pulse-invest.vercel.app/api/auth/hooks/send-email`
- **Events:** Enable all (Signup, Recovery, etc.)

#### Step 4: Handler Already Built ✅

**Path:** `/app/api/auth/hooks/send-email/route.ts`

The handler is already created and includes:
- Webhook signature verification
- Email template builders for signup + password reset
- Support for multiple event types
- Error handling

#### Step 5: Connect Your Email Service

**In `/app/api/auth/hooks/send-email/route.ts`, uncomment your email service:**

**Option A: Resend** (Recommended for simplicity)

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail(to, subject, html, text) {
  const response = await resend.emails.send({
    from: 'noreply@pulse-invest.app',
    to,
    subject,
    html,
  })
  return { success: !response.error }
}
```

**Option B: SendGrid**

```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

async function sendEmail(to, subject, html, text) {
  const msg = {
    to,
    from: 'noreply@pulse-invest.app',
    subject,
    html,
    text,
  }
  await sgMail.send(msg)
  return { success: true }
}
```

**Option C: Nodemailer** (Gmail, custom SMTP)

```typescript
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

async function sendEmail(to, subject, html, text) {
  await transporter.sendMail({
    from: 'noreply@pulse-invest.app',
    to,
    subject,
    html,
    text,
  })
  return { success: true }
}
```

#### Step 6: Test It

1. Sign up with a test email at `https://pulse-invest.vercel.app/auth/sign-up`
2. Check that email service shows the send
3. Verify the email link works
4. Land on `/auth/email-confirmed` ✅

---

## OPTION 2: POSTGRES FUNCTION (Alternative)

### Best For:
- Database-only solutions
- Minimal external dependencies
- Audit logging in the database

### ⚠️ Limitations:
- Cannot send emails directly from Postgres
- Cannot call external HTTP endpoints
- Requires workarounds for actual sending
- More complex to debug

### Setup Steps

#### Step 1: Run SQL Migration

**File:** `/sql/auth-hooks-postgres-function.sql`

**In Supabase Dashboard → SQL Editor:**

1. Copy the entire SQL file content
2. Paste into SQL Editor
3. Click **Run** or **Execute**

This creates:
- `public.auth_email_logs` table (audit log)
- `handle_auth_email_hook()` function (trigger handler)
- RLS policies

#### Step 2: Create Hook in Supabase

**Go to:** Supabase Dashboard → Authentication → Hooks

**Click:** "Add Send Email hook"

**Configure:**
- **Hook type:** Postgres
- **Postgres Schema:** public
- **Postgres function:** handle_auth_email_hook

#### Step 3: Set Up Email Processing (Separate Service)

Since Postgres can't send emails, you need a separate service:

**Option A: Scheduled Job** (Cron)

Create a Next.js API route that polls for pending emails:

```typescript
// /app/api/cron/process-auth-emails/route.ts
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/pulse-email-service'

export async function GET() {
  const supabase = await createClient()
  
  // Get pending emails from auth_email_logs
  const { data: logs } = await supabase
    .from('auth_email_logs')
    .select('*')
    .eq('status', 'pending')
    .limit(50)

  for (const log of logs || []) {
    try {
      await sendEmail(log.user_email, log.subject, ...)
      
      // Mark as sent
      await supabase
        .from('auth_email_logs')
        .update({ status: 'sent' })
        .eq('id', log.id)
    } catch (error) {
      await supabase
        .from('auth_email_logs')
        .update({ status: 'failed', error_message: error.message })
        .eq('id', log.id)
    }
  }
  
  return Response.json({ success: true })
}
```

Set up Vercel Cron: `/vercel.json`

```json
{
  "crons": [{
    "path": "/api/cron/process-auth-emails",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option B: External Service** (Zapier, Make, etc.)

Use Zapier to monitor `auth_email_logs` table and send emails when status = 'pending'

---

## Comparison: HTTPS vs Postgres

| Feature | HTTPS | Postgres |
|---------|-------|----------|
| **Setup complexity** | Simple | Complex |
| **Email services** | ✅ Direct access | ❌ Workarounds needed |
| **Error handling** | ✅ Flexible | ⚠️ Limited |
| **Testing** | ✅ Easy | ⚠️ Hard |
| **Performance** | ✅ Fast | ⚠️ Database load |
| **Secret management** | ✅ Environment vars | ❌ Limited access |
| **Debugging** | ✅ API logs | ⚠️ Database logs |
| **Scalability** | ✅ Serverless | ⚠️ Database scaling |

---

## Environment Variables Needed

### For HTTPS Approach:

**Supabase:**
```
SUPABASE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=https://pulse-invest.vercel.app
```

**Email Service (Pick one):**
```
RESEND_API_KEY=re_xxxx
# OR
SENDGRID_API_KEY=SG.xxxx
# OR
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
```

### For Postgres Approach:

**Supabase:**
```
SUPABASE_SERVICE_ROLE_KEY=xxxx
```

**Cron Processing (if used):**
```
RESEND_API_KEY=re_xxxx
```

---

## Event Types Handled

Both approaches handle:

### Signup Event
- **Trigger:** User signs up with email
- **Email:** Confirmation + $35 welcome bonus
- **Link:** `/auth/callback?token_hash=X&type=email`
- **Template:** Beautiful gold + crème styling

### Recovery Event
- **Trigger:** User clicks "Forgot Password"
- **Email:** Password reset instructions
- **Link:** `/auth/reset-password?token=X`
- **Template:** Security-focused design

### Other Events (Optional)
- Email change confirmation
- Admin invites
- Custom auth events

---

## Testing Checklist

**Before going live:**

- [ ] Environment variables set in Vercel
- [ ] Auth hook created in Supabase dashboard
- [ ] Webhook secret matches
- [ ] Sign up → Email received ✅
- [ ] Click link → No errors ✅
- [ ] Land on `/auth/email-confirmed` ✅
- [ ] Can login after verification ✅
- [ ] Forgot password → Email received ✅
- [ ] Reset password → Works ✅

---

## Common Issues

### Email not received
- Check webhook endpoint is accessible
- Verify SUPABASE_WEBHOOK_SECRET is set
- Check email service API key is valid
- Look at function logs in Supabase

### Invalid signature error
- Ensure SUPABASE_WEBHOOK_SECRET matches exactly
- Check for leading/trailing spaces

### Redirect loop after verification
- Ensure `/auth/email-confirmed` page exists
- Check `redirect_to` parameter in email link

### Email template not rendering
- Verify HTML is valid
- Check `{{ .SiteURL }}` variable is set
- Test link manually in browser

---

## Files Included

1. **`/app/api/auth/hooks/send-email/route.ts`** — HTTPS handler (ready to use)
2. **`/sql/auth-hooks-postgres-function.sql`** — Postgres function (alternative)
3. **This guide** — Complete setup instructions

---

## Recommendation

**Use HTTPS approach** unless you have a specific reason to use Postgres (e.g., you can't expose an HTTP endpoint).

The HTTPS endpoint is:
- Simpler to set up
- Easier to maintain
- More flexible
- Better integrated with modern email services

