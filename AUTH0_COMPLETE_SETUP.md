# AUTH0 + TURNSTILE COMPLETE SETUP

## Your Auth0 Tenant
```
Tenant Name: dev-7m32r3oudhuzlcvo
Region: UK-1
Domain: dev-7m32r3oudhuzlcvo.uk.auth0.com
Environment: Production
```

## Turnstile Secret Key (UPDATED)
```
Site ID: 0x4AAAAAAD2hbNmbbW7vdZXO
New Secret Key: 0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i
(Previous key valid for 2 more hours)
```

## Auth0 Tenant Configuration

### Step 1: Update Auth0 Settings
**Go to:** Auth0 Dashboard → Tenant Settings → Settings

Set the following:

**Friendly Name:**
```
PULSE Investment Platform
```

**Logo URL:**
```
https://pulse-invest.vercel.app/pulse-logo.png
```

**Support Email:**
```
support@pulse-invest.app
```

**Support URL:**
```
https://pulse-invest.vercel.app/support
```

### Step 2: Configure Allowed Callback URLs
**Go to:** Auth0 → Applications → [Your App]

Add these redirect URLs:
```
https://pulse-invest.vercel.app/api/auth/callback
https://pulse-invest.vercel.app/auth/callback
https://pulse-invest.vercel.app
http://localhost:3000/api/auth/callback
```

### Step 3: Verify Custom Domain (Optional - for production)
**Go to:** Auth0 → Branding → Custom Domains

To use custom domain (e.g., auth.pulse-invest.app):
1. Click "Configure Domain"
2. Enter: `auth.pulse-invest.app`
3. Add CNAME record to your DNS
4. Verify

For now, use default: `dev-7m32r3oudhuzlcvo.uk.auth0.com`

## Vercel Environment Variables (All Set)

```
✅ AUTH0_DOMAIN = dev-7m32r3oudhuzlcvo.uk.auth0.com
✅ AUTH0_CLIENT_ID = [Set]
✅ AUTH0_CLIENT_SECRET = [Set]
✅ NEXT_PUBLIC_TURNSTILE_SITE_ID = 0x4AAAAAAD2hbNmbbW7vdZXO
✅ TURNSTILE_SECRET_KEY = 0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i
✅ NEXT_PUBLIC_APP_URL = https://pulse-invest.vercel.app
```

## Next Steps

1. **Update Auth0 Tenant Settings** (see Step 1 above)
2. **Add Redirect URLs** (see Step 2)
3. **Test Authentication** at https://pulse-invest.vercel.app/auth/sign-up
4. **Verify Turnstile CAPTCHA** appears on signup form

## Production Checklist

- [x] Auth0 tenant created
- [x] Turnstile CAPTCHA configured
- [x] Cloudflare nameservers set
- [x] Vercel environment variables added
- [ ] Auth0 settings updated (Friendly Name, Support, Logo)
- [ ] Auth0 redirect URLs added
- [ ] Test signup with Turnstile
- [ ] Verify emails working
- [ ] Test admin login

## Status: READY FOR TESTING

Your PULSE platform is now configured with:
- Auth0 authentication
- Cloudflare Turnstile CAPTCHA
- Vercel deployment
- Full domain setup

Next: Update Auth0 tenant settings and test the signup flow!
