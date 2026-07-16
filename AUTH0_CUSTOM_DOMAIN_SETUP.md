# AUTH0 CUSTOM DOMAIN & EMAIL "FROM" ADDRESS - COMPLETE SETUP

## What You Need to Do

Auth0 requires:
1. **Delete** the current default domain
2. **Add** a new custom domain
3. **Configure** the "from" email address
4. **Set up** the email provider (Resend, SendGrid, or AWS SES)

---

## STEP 1: DELETE CURRENT DEFAULT DOMAIN

**Go to:** Auth0 Dashboard → Tenant Settings → Custom Domains

**Current Domain:** `dev-7m32r3oudhuzlcvo.uk.auth0.com` (DEFAULT)

**To Delete:**
1. Click the **trash/delete icon** next to your default domain
2. Confirm deletion
3. This will remove the old domain

⚠️ **Note:** You can only have ONE domain at a time. Must delete default before adding custom.

---

## STEP 2: ADD NEW CUSTOM DOMAIN

**Option A: Use Your Vercel Domain (Easiest)**

1. Go to Auth0 → Tenant Settings → Custom Domains
2. Click **+ Add Custom Domain**
3. Enter domain: `auth.pulse-invest.vercel.app`
4. Select: **Self-managed certificates**
5. Click **Add Domain**
6. Auth0 will show you DNS records to add

**Option B: Use Your Own Domain**

If you own a domain (e.g., `auth.pulseinvestme.com`):
1. Enter that domain instead
2. Add the DNS records Auth0 provides to your registrar
3. Wait for DNS verification (5-30 min)

---

## STEP 3: DNS SETUP (For Custom Domain)

Auth0 will give you **CNAME record** to add:

```
Name: auth
Type: CNAME
Value: [Auth0 will provide this]
TTL: 3600
```

**Where to add:**
- If using `auth.pulse-invest.vercel.app` → Add to Vercel DNS settings
- If using own domain → Add to your registrar (GoDaddy/Namecheap/etc.)

**Verify DNS:** Auth0 will auto-check. Status changes to ✅ Verified

---

## STEP 4: CONFIGURE "FROM" EMAIL ADDRESS

**After domain is verified, go to:** Auth0 → Authentication → Email Provider

### Option 1: Use Resend (Recommended)

**1. Get Resend API Key:**
- Go to https://resend.com
- Sign up free
- Go to API Keys
- Create new API key
- Copy it

**2. Add to Auth0:**
- Email Provider: Select **Resend**
- API Key: Paste your Resend key
- **From Email:** `noreply@pulse-invest.vercel.app` (or your domain)
- **From Name:** `PULSE`
- Click **Save**

**3. Verify Email:**
- Resend will send test email to your Auth0 account
- Verify it worked

### Option 2: Use SendGrid

**1. Get SendGrid API Key:**
- Go to https://sendgrid.com
- Sign up free
- Create API key in Settings
- Copy it

**2. Add to Auth0:**
- Email Provider: Select **SendGrid**
- API Key: Paste your SendGrid key
- **From Email:** `noreply@pulse-invest.vercel.app`
- **From Name:** `PULSE`
- Click **Save**

### Option 3: Use AWS SES

**1. Set up AWS SES:**
- Go to AWS Console → SES
- Verify sender email: `noreply@pulse-invest.vercel.app`
- Create SMTP credentials
- Get Access Key ID and Secret Access Key

**2. Add to Auth0:**
- Email Provider: Select **AWS SES**
- Region: `us-east-1` (or your region)
- Access Key: Paste Access Key ID
- Secret Key: Paste Secret Access Key
- **From Email:** `noreply@pulse-invest.vercel.app`
- Click **Save**

---

## "FROM" EMAIL ADDRESS OPTIONS

You have 3 choices:

| Option | Email Format | Works With |
|--------|--------------|-----------|
| **1. Noreply** | `noreply@pulse-invest.vercel.app` | Any provider ✅ |
| **2. Support** | `support@pulse-invest.app` | Any provider ✅ |
| **3. Notifications** | `notifications@pulse-invest.vercel.app` | Any provider ✅ |

**Recommendation:** Use `noreply@pulse-invest.vercel.app` (most common for Auth0 emails)

---

## COMPLETE WORKFLOW

### 1. Delete Default Domain (2 min)
```
Auth0 → Tenant Settings → Custom Domains
Delete: dev-7m32r3oudhuzlcvo.uk.auth0.com
```

### 2. Add Custom Domain (2 min)
```
Auth0 → Tenant Settings → Custom Domains
Add: auth.pulse-invest.vercel.app
Type: Self-managed certificates
```

### 3. Verify DNS (5-30 min)
```
Add CNAME record (Auth0 will provide)
Wait for ✅ Verified status
```

### 4. Set Up Email Provider (5 min - Resend)
```
Get API key from Resend
Auth0 → Email Provider
Select: Resend
Paste API Key
From Email: noreply@pulse-invest.vercel.app
From Name: PULSE
Save
```

### 5. Test Email (1 min)
```
Auth0 sends test email
Click verify link
Done!
```

---

## AFTER SETUP - UPDATE VERCEL ENV VARS

```
AUTH0_DOMAIN=auth.pulse-invest.vercel.app
AUTH0_CLIENT_ID=[from Auth0 app settings]
AUTH0_CLIENT_SECRET=[from Auth0 app settings]
RESEND_API_KEY=[from Resend]
```

---

## TESTING FLOW

**1. Test Signup Email:**
```
Go to: https://pulse-invest.vercel.app/auth/sign-up
Sign up with test email
Check inbox for verification email
Email should be FROM: PULSE <noreply@pulse-invest.vercel.app>
```

**2. Test Password Reset:**
```
Go to: /auth/forgot-password
Enter your email
Should receive password reset email
Email FROM: PULSE <noreply@pulse-invest.vercel.app>
```

**3. Verify Email Content:**
- Should have PULSE branding
- Should have verification link
- Should show "FROM: PULSE"

---

## TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Domain not verified" | Wait 30 min for DNS propagation |
| "Email provider error" | Check API key is correct |
| "From address rejected" | Use `noreply@` or verify sender domain |
| "Emails not arriving" | Check spam folder, verify email provider set up |

---

## QUICK START (5 Minutes)

1. **Delete domain** → Auth0 → Custom Domains → Delete default
2. **Add domain** → Add `auth.pulse-invest.vercel.app`
3. **Add DNS** → Copy CNAME from Auth0, add to settings
4. **Get Resend key** → resend.com → Create account → Get API key
5. **Configure email** → Auth0 → Email Provider → Resend → Paste key → Save
6. **Test signup** → Go to signup page → Should work!

---

## You're Ready!

Follow the 5-minute quick start above and your PULSE signup emails will work perfectly.

Let me know when you've completed these steps!
