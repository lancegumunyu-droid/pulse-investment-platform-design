# AUTH0 CORRECTED LOGOUT URLs

## The Problem
Auth0 requires all logout URLs to be valid URIs - they must include protocol and cannot have certain characters.

## CORRECTED LOGOUT URLs (Use These Exactly)

Add ONLY these 2 logout URLs to Auth0:

```
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app
```

**That's it. Only 2 URLs, not 4.**

---

## Why These Work

✅ `https://pulseinvestme.dpdns.org` - Valid URI
✅ `https://pulse-invest.vercel.app` - Valid URI

❌ Avoid paths in logout URLs (Auth0 doesn't support `/auth/sign-in`)

---

## Complete Auth0 Configuration (CORRECTED)

### Application Details
```
Application Name: PULSE Investment Platform
Application Type: Regular Web Application
Tenant: dev-7m32r3oudhuzlcvo.uk.auth0.com
Custom Domain: auth.pulseinvestme.dpdns.org
```

### Allowed Callback URLs (6 total)
```
https://pulseinvestme.dpdns.org/api/auth/callback
https://pulseinvestme.dpdns.org/auth/callback
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app/api/auth/callback
https://pulse-invest.vercel.app/auth/callback
http://localhost:3000/api/auth/callback
```

### Allowed Logout URLs (2 total - CORRECTED)
```
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app
```

### Allowed Web Origins (3 total)
```
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app
http://localhost:3000
```

### Grant Types (4 enabled)
- Authorization Code Flow
- Authorization Code Flow with PKCE
- Refresh Token Rotation
- Refresh Token Expiration Leeway

---

## Step-by-Step Auth0 Setup

### Step 1: Create Application
1. Go to https://manage.auth0.com
2. Applications → Applications
3. Click **+ Create Application**
4. Name: `PULSE Investment Platform`
5. Type: **Regular Web Application**
6. Click **Create**

### Step 2: Add Callback URLs
1. Go to Settings tab
2. Scroll to **Allowed Callback URLs**
3. Paste all 6 callback URLs above
4. Click **Save Changes**

### Step 3: Add Logout URLs
1. Scroll to **Allowed Logout URLs**
2. Paste only these 2:
   ```
   https://pulseinvestme.dpdns.org
   https://pulse-invest.vercel.app
   ```
3. Click **Save Changes**

### Step 4: Add Web Origins
1. Scroll to **Allowed Web Origins**
2. Add all 3 URLs
3. Click **Save Changes**

### Step 5: Copy Credentials
1. At top, find **Client ID** - copy it
2. Click **Show Client Secret** - copy it
3. Add both to Vercel env vars

### Step 6: Configure Custom Domain
1. Go to **Custom Domains** section
2. Add domain: `auth.pulseinvestme.dpdns.org`
3. Add CNAME record when prompted
4. Wait for verification

### Step 7: Add Email Provider
1. Authentication → Email Provider
2. Toggle: "Use my own email provider"
3. Select: Resend
4. Paste API Key
5. From Email: `noreply@pulseinvestme.dpdns.org`
6. From Name: `PULSE`
7. Save

---

## Metadata URL

```
https://pulseinvestme.dpdns.org/.well-known/openid-configuration
```

---

## Environment Variables for Vercel

```
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=[Copy from Auth0]
AUTH0_CLIENT_SECRET=[Copy from Auth0]
AUTH0_BASE_URL=https://pulseinvestme.dpdns.org
AUTH0_ISSUER_BASE_URL=https://dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_METADATA_URL=https://pulseinvestme.dpdns.org/.well-known/openid-configuration
```

---

## Testing Auth0

After setup, test these URLs:

1. **Signup:** `https://pulseinvestme.dpdns.org/auth/sign-up`
2. **Login:** `https://pulseinvestme.dpdns.org/auth/sign-in`
3. **Dashboard:** `https://pulseinvestme.dpdns.org/app` (after login)
4. **Logout:** Should redirect to `https://pulseinvestme.dpdns.org`

---

## Common Issues & Fixes

**Error: "allowed_logout_urls" must be a valid uri**
- ✅ Fix: Use ONLY domain URLs (no paths like `/auth/sign-in`)
- ✅ Include `https://` protocol
- ✅ No trailing slashes

**Error: Redirect URI mismatch**
- ✅ Make sure ALL callback URLs are exact matches
- ✅ Both domains must have `/api/auth/callback` AND `/auth/callback`

**Error: Custom domain won't verify**
- ✅ Add CNAME record: `auth → cname.auth0.com`
- ✅ Wait 10-30 minutes for DNS propagation
- ✅ Check Vercel DNS settings

---

## Quick Copy-Paste Ready

### Logout URLs (Just These 2)
```
https://pulseinvestme.dpdns.org
https://pulse-invest.vercel.app
```

**Use these NOW and your Auth0 setup will work!**
