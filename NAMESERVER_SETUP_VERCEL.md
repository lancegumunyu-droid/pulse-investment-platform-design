# NAMESERVER SETUP - pulseinvestme.dpdns.org → Vercel

## Your Domain Info
```
Domain: pulseinvestme.dpdns.org
Registrant: Lance Gumunyu
Email: lancegumunyu@gmail.com
Registrar: DigitalPlat Domain
Status: Active ✅
```

---

## STEP 1: Add Vercel Nameservers to DigitalPlat

**Go to:** digitalplat.org → Your Domain → Nameservers

**Replace the nameservers with these EXACT values:**

### NAME SERVER 1
```
ns1.vercel-dns.com
```

### NAME SERVER 2
```
ns2.vercel-dns.com
```

**Leave the rest (NS3-NS8) EMPTY**

Then click **Save/Update**

---

## STEP 2: Add Domain to Vercel Project

1. Go to **Vercel Dashboard**
2. Select your **pulse-invest** project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `pulseinvestme.dpdns.org`
6. Select: **Use Vercel Nameservers**
7. Click **Add**

---

## STEP 3: Wait for DNS Propagation

**Time:** 5-30 minutes (usually 10 min)

**Check status:**
```bash
nslookup pulseinvestme.dpdns.org
# Should show Vercel IPs: 76.76.19.0 or 76.76.20.0
```

---

## STEP 4: Add Subdomains for Auth0 & Resend

Once main domain is verified, in Vercel add:

### For Auth0 Email
```
Subdomain: auth.pulseinvestme.dpdns.org
CNAME: cname.auth0.com
```

### For Resend Email
```
Subdomain: noreply.pulseinvestme.dpdns.org
CNAME: [from Resend dashboard]
```

---

## STEP 5: Update Environment Variables

Add to Vercel:
```
NEXT_PUBLIC_APP_URL=https://pulseinvestme.dpdns.org
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
RESEND_API_KEY=[your key]
```

---

## Your Final URLs

| Purpose | URL | Status |
|---------|-----|--------|
| Primary App | https://pulseinvestme.dpdns.org | Needs nameserver update |
| Backup | https://pulse-invest.vercel.app | ✅ Live |
| Auth0 Email | auth.pulseinvestme.dpdns.org | After step 4 |
| Resend Email | noreply.pulseinvestme.dpdns.org | After step 4 |

---

## Quick Checklist

- [ ] Add Vercel nameservers to DigitalPlat
- [ ] Wait 5-30 min for propagation
- [ ] Add domain to Vercel project
- [ ] Test: `nslookup pulseinvestme.dpdns.org`
- [ ] Add subdomains (auth, noreply)
- [ ] Update env variables
- [ ] Test signup at new domain

---

## Need Help?

If nameservers don't propagate after 30 min:
1. Double-check spelling: `ns1.vercel-dns.com` (not ns.vercel-dns.com)
2. Make sure only NS1 & NS2 are filled, rest are empty
3. Clear your browser cache
4. Try: `nslookup pulseinvestme.dpdns.org 1.1.1.1`
