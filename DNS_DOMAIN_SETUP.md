# PULSE DNS & DOMAIN COMPLETE SETUP

## Your Domains

```
Primary: pulse-invest.vercel.app (Vercel hosted - already live)
Optional: pulseinvestme.com (if you own it)
Optional: pulsetrade.com (if you own it)
```

---

## DNS RECORDS TO ADD

### ✅ OPTION 1: Use Vercel Default (RECOMMENDED - ALREADY WORKING)

Your app is already live at:
```
https://pulse-invest.vercel.app
```

**No DNS setup needed.** Everything works out of the box.

---

### 🔧 OPTION 2: Add Custom Domain (pulseinvestme.com or pulsetrade.com)

If you want to use your own domain instead of Vercel subdomain:

#### Step 1: Add Domain to Vercel
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Click **Add Domain**
3. Enter: `pulseinvestme.com`
4. Select: **Use Vercel Nameservers**

#### Step 2: Add These DNS Records (If NOT Using Vercel Nameservers)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.19.0 | Auto |
| A | @ | 76.76.20.0 | Auto |
| CNAME | www | cname.vercel-dns.com | Auto |
| CNAME | mail | sendgrid.net | Auto |

---

## AUTH0 CUSTOM DOMAIN (FOR EMAIL)

If using Auth0 for authentication:

### Step 1: Add Custom Domain to Auth0

1. Go to: https://manage.auth0.com
2. Tenant Settings → Custom Domains
3. Click **Add Domain**
4. Enter: `auth.pulse-invest.vercel.app`
5. Select: **Self-managed certificates**

### Step 2: Auth0 Will Show You CNAME Record

```
Type: CNAME
Name: auth
Value: cname.auth0.com
TTL: 3600 (1 hour)
```

**Add this to your DNS provider** (Vercel or registrar)

### Step 3: Verify in Auth0
- Wait for status: ✅ **Verified** (5-10 minutes)
- Auth0 will show when ready

---

## CLOUDFLARE DNS (OPTIONAL - FOR DDoS PROTECTION)

If you set up Cloudflare (you already have Turnstile):

### Nameservers to Replace

Replace your current nameservers with:
```
jose.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

### Then Add These DNS Records in Cloudflare

| Type | Name | Value | Proxied |
|------|------|-------|---------|
| A | @ | 76.76.19.0 | ☁️ Yes |
| A | @ | 76.76.20.0 | ☁️ Yes |
| CNAME | www | cname.vercel-dns.com | ☁️ Yes |
| CNAME | auth | cname.auth0.com | ☁️ Yes |

---

## RESEND EMAIL DOMAIN VERIFICATION

When setting up Resend with custom domain:

### Step 1: Go to Resend Dashboard
https://resend.com → Domains → Add Domain

### Step 2: Add Domain
```
noreply.pulse-invest.vercel.app
```

### Step 3: Add DNS Records

Resend will show you:

| Type | Name | Value |
|------|------|-------|
| CNAME | k1._domainkey.noreply | [specific value from Resend] |

**Copy exact value from Resend dashboard** and add to your DNS.

### Step 4: Verify
- Click **Verify** in Resend
- Wait for ✅ **Verified**

---

## WHERE TO ADD DNS RECORDS

### Option A: Vercel (If Using Vercel Nameservers)
1. Project → Settings → Domains
2. Click your domain
3. Click **Manage DNS**
4. Add records there

### Option B: Your Domain Registrar (GoDaddy, Namecheap, etc.)
1. Login to registrar
2. Find **DNS Settings** or **Name Servers**
3. Add the CNAME/A records there

### Option C: Cloudflare (If Pointed to Cloudflare)
1. Cloudflare Dashboard
2. Your Domain → DNS
3. Add records there

---

## EXACT DNS RECORDS - COPY/PASTE READY

### For Vercel (pulse-invest.vercel.app)
```
A Record:     @  →  76.76.19.0
A Record:     @  →  76.76.20.0
CNAME Record: www → cname.vercel-dns.com
```

### For Auth0 (auth.pulse-invest.vercel.app)
```
CNAME Record: auth → cname.auth0.com
```

### For Resend Email (noreply.pulse-invest.vercel.app)
```
CNAME Record: k1._domainkey.noreply → [value from Resend dashboard]
```

### For Cloudflare Nameservers (Optional)
```
Replace nameservers with:
jose.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

---

## QUICK START GUIDE

### If You Just Want It To Work NOW:
1. ✅ Already done - your app is live at `https://pulse-invest.vercel.app`
2. No DNS setup needed
3. Everything works

### If You Want Custom Domain (pulseinvestme.com):
1. Add domain to Vercel
2. Add A records (76.76.19.0, 76.76.20.0)
3. Add CNAME record (www → cname.vercel-dns.com)
4. Wait 5-10 minutes for verification
5. Done

### If You Want Custom Domain + Auth0 Email:
1. Do custom domain setup above
2. Add Auth0 CNAME (auth → cname.auth0.com)
3. Do Resend domain verification
4. Add Resend CNAME
5. All set!

---

## DNS PROPAGATION TIME

| Record Type | Typical Time | Max Time |
|------------|-------------|----------|
| A Record | 5 min | 48 hours |
| CNAME Record | 5-10 min | 48 hours |
| Nameserver | 1-2 hours | 48 hours |

**Pro tip:** Usually works in 5-10 minutes, even though max is 48 hours.

---

## TEST YOUR DNS

### Check DNS Resolution
```bash
# Check A record
nslookup pulse-invest.vercel.app

# Check CNAME
nslookup www.pulse-invest.vercel.app

# Check Auth0 domain
nslookup auth.pulse-invest.vercel.app
```

### Check in Browser
```
https://pulse-invest.vercel.app        ← Should work now
https://www.pulseinvestme.com          ← After custom domain setup
https://auth.pulse-invest.vercel.app   ← After Auth0 setup
```

---

## SUMMARY

| Component | Domain | DNS | Status |
|-----------|--------|-----|--------|
| **PULSE App** | pulse-invest.vercel.app | Vercel managed | ✅ Live |
| **Auth0 Email** | auth.pulse-invest.vercel.app | CNAME to auth0 | ⚙️ Setup |
| **Resend Email** | noreply.pulse-invest.vercel.app | CNAME to Resend | ⚙️ Setup |
| **Custom Domain** | pulseinvestme.com | A + CNAME | ⚙️ Optional |

---

## NEED HELP?

### DNS not resolving?
- Check TTL - usually 5-10 minutes but can be up to 48 hours
- Clear browser cache (Ctrl+Shift+Delete)
- Use different DNS (1.1.1.1 or 8.8.8.8)

### Domain not working?
- Verify all records are added correctly
- Check for typos in names/values
- Wait for propagation (5-10 min)

### Email not sending?
- Verify Resend domain is verified (✅ green checkmark)
- Check API key is correct
- Verify "from" email matches verified domain

---

**Your PULSE app is ready. Use these DNS records for full production setup!**
