# AUTH0 EMAIL PROVIDER SETUP - COMPLETE GUIDE

## Option 1: RESEND (RECOMMENDED - Easiest for Production)

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email
3. Verify email
4. Go to **API Keys** in dashboard
5. Click **Create API Key**
6. Copy the key (looks like: `re_xxxxxxxxxxxxxxxxxxxx`)

### Step 2: Add Resend to Auth0
**In Auth0 Dashboard → Authentication → Email Provider**

1. Click **Use my own email provider** toggle (turn it ON)
2. Select **Resend** from provider list
3. Paste your Resend API Key:
   ```
   re_your_api_key_here
   ```
4. Click **Save**

### Step 3: Configure Sender Email in Auth0
**Go to:** Auth0 → Branding → Email Templates

For each template (Signup, Password Reset, etc.):
1. Click the template
2. Change **From** email to: `noreply@pulse-invest.app`
3. Change **From Name** to: `PULSE Investment`
4. Add custom subject and HTML template (see below)

### Step 4: Verify Domain with Resend
**In Resend Dashboard → Domains**

1. Click **Add Domain**
2. Enter: `pulse-invest.app`
3. Add CNAME records to DNS:
   ```
   CNAME: default._domainkey.pulse-invest.app
   Value: default._domainkey.resend.dev
   ```
4. Verify domain

---

## Option 2: SENDGRID (Industry Standard)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up (free tier available)
3. Go to **Settings → API Keys**
4. Click **Create API Key**
5. Give it name: `Auth0 PULSE`
6. Copy the full key

### Step 2: Add SendGrid to Auth0
**In Auth0 Dashboard → Authentication → Email Provider**

1. Click **Use my own email provider** toggle (turn it ON)
2. Select **SendGrid** from provider list
3. Paste your SendGrid API Key
4. Click **Save**

### Step 3: Verify Sender Email
**In SendGrid → Sender Authentication**

1. Click **Verify a Single Sender**
2. Enter: `noreply@pulse-invest.app`
3. Verify email (you'll get confirmation link)

---

## Option 3: AWS SES (Cost-Effective)

### Step 1: Request Production Access
1. AWS Console → SES → Email Sending → Verified Identities
2. Add identity: `pulse-invest.app`
3. Verify domain via DNS
4. Request **production access** (default is sandbox)

### Step 2: Create IAM User for Auth0
1. AWS IAM → Users → Create User
2. Name: `auth0-pulse-ses`
3. Attach policy: `AmazonSESFullAccess`
4. Create access keys

### Step 3: Add AWS SES to Auth0
**In Auth0 → Email Provider**

1. Select **Amazon SES**
2. Enter:
   - Access Key ID: `AKIAIOSFODNN7EXAMPLE`
   - Secret Access Key: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
   - Region: `us-east-1` (or your region)
3. Click **Save**

---

## RECOMMENDED EMAIL TEMPLATES FOR PULSE

### Signup Email Template
```html
<html>
  <body style="font-family: Arial, sans-serif; background: #0a0e27; color: #e8e4d9;">
    <div style="max-width: 600px; margin: 0 auto; background: #1a1f3a; padding: 40px; border-radius: 8px;">
      <h1 style="color: #f59e0b;">Welcome to PULSE</h1>
      <p>Thank you for signing up! Click below to verify your email:</p>
      <a href="@@callback_url@@" style="display: inline-block; background: #f59e0b; color: #0a0e27; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold;">Verify Email</a>
      <p style="margin-top: 40px; font-size: 12px; color: #999;">This link expires in 24 hours.</p>
    </div>
  </body>
</html>
```

### Password Reset Template
```html
<html>
  <body style="font-family: Arial, sans-serif; background: #0a0e27; color: #e8e4d9;">
    <div style="max-width: 600px; margin: 0 auto; background: #1a1f3a; padding: 40px; border-radius: 8px;">
      <h1 style="color: #f59e0b;">Reset Your Password</h1>
      <p>We received a request to reset your password. Click below:</p>
      <a href="@@callback_url@@" style="display: inline-block; background: #f59e0b; color: #0a0e27; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold;">Reset Password</a>
      <p style="margin-top: 40px; font-size: 12px; color: #999;">If you didn't request this, ignore this email. Link expires in 24 hours.</p>
    </div>
  </body>
</html>
```

---

## Environment Variables to Add to Vercel

**For Resend:**
```
AUTH0_EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
```

**For SendGrid:**
```
AUTH0_EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_key_here
```

**For AWS SES:**
```
AUTH0_EMAIL_PROVIDER=aws_ses
AWS_SES_ACCESS_KEY=AKIA...
AWS_SES_SECRET_KEY=wJalr...
AWS_SES_REGION=us-east-1
```

---

## Testing Email Configuration

### Test 1: Send Test Email from Auth0
1. Go to Auth0 → Branding → Email Templates
2. Click any template
3. Click **Send Test Email**
4. Enter your email
5. Check inbox (should arrive in <1 minute)

### Test 2: Test Signup Flow
1. Go to `https://pulse-invest.vercel.app/auth/sign-up`
2. Sign up with test email
3. Check inbox for verification email
4. Click link to verify
5. Should access dashboard

### Test 3: Test Password Reset
1. Go to `https://pulse-invest.vercel.app/auth/forgot-password`
2. Enter email
3. Check inbox for reset link
4. Click link and reset password
5. Login with new password

---

## RECOMMENDATION FOR PULSE

**Use Resend** because:
- ✅ Easiest setup (2 minutes)
- ✅ Free tier: 100 emails/day
- ✅ Perfect for startups
- ✅ Best documentation
- ✅ Works great with Next.js/Vercel stack

**If you need more volume:**
- **SendGrid**: 100 emails/month free (then pay-as-you-go)
- **AWS SES**: Cheapest ($0.10 per 1,000 emails after free tier)

---

## Quick Start: Do This NOW

1. Go to https://resend.com and create account
2. Get API key
3. In Auth0 → Email Provider → Toggle ON → Select Resend → Paste API key
4. Test signup at https://pulse-invest.vercel.app/auth/sign-up
5. Done!

**All done in ~5 minutes!**
