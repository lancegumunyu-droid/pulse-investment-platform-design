# AUTH0 CLIENT ID METADATA URL & COMPLETE CONFIGURATION

## Your Metadata URL

```
https://pulseinvestme.dpdns.org/.well-known/openid-configuration
```

**Backup URL (if needed):**
```
https://pulse-invest.vercel.app/.well-known/openid-configuration
```

---

## AUTH0 APPLICATION CONFIGURATION

### Step 1: Create/Configure Application in Auth0

**Go to:** https://manage.auth0.com → Applications → Applications

1. Click **Create Application**
2. Name: `PULSE Investment Platform`
3. Type: **Regular Web Application**
4. Click **Create**

---

### Step 2: Set Application Settings

**In Application Settings:**

#### Basic Information
- **Name:** PULSE Investment Platform
- **Application Type:** Regular Web Application
- **Domain:** `dev-7m32r3oudhuzlcvo.uk.auth0.com`
- **Client ID:** [Auto-generated - copy this]
- **Client Secret:** [Auto-generated - save securely]

#### Application URIs
Add these exact URLs:

**Allowed Callback URLs:**
```
https://pulseinvestme.dpdns.org/api/auth/callback
https://pulseinvestme.dpdns.org/auth/callback
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app/api/auth/callback
https://pulse-invest.vercel.app/auth/callback
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
https://pulseinvestme.dpdns.org
https://pulseinvestme.dpdns.org/auth/sign-in
https://pulse-invest.vercel.app
https://pulse-invest.vercel.app/auth/sign-in
http://localhost:3000
```

**Allowed Web Origins:**
```
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app
http://localhost:3000
```

---

### Step 3: Enable Grant Types

**Advanced Settings → Grant Types**

Enable these:
- ✅ Authorization Code Flow
- ✅ Authorization Code Flow with PKCE
- ✅ Refresh Token Rotation
- ✅ Refresh Token Expiration Leeway

---

### Step 4: Configure Email Provider

**Authentication → Email Provider**

Enable: **Use my own email provider**

Select: **Resend**

**From Email:** `noreply@pulseinvestme.dpdns.org`
**From Name:** `PULSE`
**Resend API Key:** [Your Resend key]

---

### Step 5: Configure Tenant Settings

**Tenant Settings → General**

- **Friendly Name:** PULSE Investment Platform
- **Support Email:** `support@pulseinvestme.dpdns.org`
- **Support URL:** `https://pulseinvestme.dpdns.org/support`
- **Logo URL:** `https://pulseinvestme.dpdns.org/pulse-logo.png`

---

### Step 6: Custom Domain Setup

**Tenant Settings → Custom Domains**

1. Click **Add Custom Domain**
2. **Domain Name:** `auth.pulseinvestme.dpdns.org`
3. **Select:** Self-managed certificates
4. **Add Domain**
5. Copy the CNAME record:
   ```
   CNAME: auth → cname.auth0.com
   ```
6. Add this to Vercel DNS

---

## ENVIRONMENT VARIABLES FOR VERCEL

Add these to your Vercel project:

```
# Auth0
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=[Copy from Auth0 dashboard]
AUTH0_CLIENT_SECRET=[Copy from Auth0 dashboard]
AUTH0_BASE_URL=https://pulseinvestme.dpdns.org
AUTH0_ISSUER_BASE_URL=https://dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_METADATA_URL=https://pulseinvestme.dpdns.org/.well-known/openid-configuration

# Resend
RESEND_API_KEY=[Your Resend API key]

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_ID=0x4AAAAAAD2hbNmbbW7vdZXO
TURNSTILE_SECRET_KEY=0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[key]
SUPABASE_SERVICE_ROLE_KEY=[key]
SUPABASE_JWT_SECRET=[secret]

# App URLs
NEXT_PUBLIC_APP_URL=https://pulseinvestme.dpdns.org
NEXT_PUBLIC_API_URL=https://api.pulseinvestme.dpdns.org

# Admin
PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=[generate-new]
ADMIN_API_KEY=[generate-new]
```

---

## API ENDPOINT FOR METADATA

Your app automatically serves metadata at:

```
GET https://pulseinvestme.dpdns.org/.well-known/openid-configuration
```

This returns:
```json
{
  "issuer": "https://dev-7m32r3oudhuzlcvo.uk.auth0.com/",
  "authorization_endpoint": "https://dev-7m32r3oudhuzlcvo.uk.auth0.com/authorize",
  "token_endpoint": "https://dev-7m32r3oudhuzlcvo.uk.auth0.com/oauth/token",
  "userinfo_endpoint": "https://dev-7m32r3oudhuzlcvo.uk.auth0.com/userinfo",
  ...
}
```

---

## AUTH0 URLS

| Purpose | URL |
|---------|-----|
| Dashboard | https://manage.auth0.com |
| Your Tenant | https://dev-7m32r3oudhuzlcvo.uk.auth0.com |
| Custom Domain | auth.pulseinvestme.dpdns.org |
| Login URL | https://auth.pulseinvestme.dpdns.org/authorize |
| Metadata | https://pulseinvestme.dpdns.org/.well-known/openid-configuration |

---

## QUICK SETUP CHECKLIST

- [ ] Create Auth0 application
- [ ] Copy Client ID from Auth0
- [ ] Copy Client Secret from Auth0
- [ ] Add all Callback URLs
- [ ] Add all Logout URLs
- [ ] Add all Web Origins
- [ ] Enable Grant Types
- [ ] Configure Resend email provider
- [ ] Add custom domain (auth.pulseinvestme.dpdns.org)
- [ ] Add CNAME to Vercel DNS
- [ ] Add all env vars to Vercel
- [ ] Deploy to Vercel
- [ ] Test signup at https://pulseinvestme.dpdns.org/auth/sign-up

---

## NEXT STEPS

1. **Go to Auth0 Dashboard:** https://manage.auth0.com
2. **Create application** with settings above
3. **Copy Client ID and Secret** to Vercel env vars
4. **Add CNAME record** for auth domain
5. **Configure email provider** with Resend
6. **Test signup flow**
7. **Go live!**

All metadata and configuration automatically handled by your Next.js app.
