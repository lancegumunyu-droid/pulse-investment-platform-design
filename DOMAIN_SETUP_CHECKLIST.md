# PULSE Domain Setup - Detailed Checklist

## Pre-Launch: Verify Everything is Ready

### ✓ Vercel Project Configuration

- [x] Project name: pulse-invest
- [x] Framework: Next.js
- [x] Node.js version: 24.x
- [x] Build command: npm run build
- [x] Deployment: Live & monitoring
- [x] SSL: Ready for domains

### ✓ Domains Configured

- [x] pulseinvestme.com - Added to Vercel
- [x] pulsetrade.com - Added to Vercel (backup)
- [x] Both ready to receive traffic
- [x] Both have SSL certificates prepared

### ✓ Application Status

- [x] Build: Compiled successfully (27 pages)
- [x] Database: Supabase connected
- [x] Email: Working
- [x] Security: Hardened
- [x] All integrations: Operational

---

## TODAY: Launch Phase

### Immediate Launch Actions

- [ ] Copy temporary URL: https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app
- [ ] Share with target users
- [ ] Test sign-up flow works
- [ ] Test admin login works
- [ ] Verify email verification emails arrive
- [ ] Check admin dashboard loads

### Monitoring

- [ ] Monitor user registrations in real-time
- [ ] Check /api/health endpoint
- [ ] Watch for errors in console
- [ ] Monitor admin dashboard
- [ ] Track KYC submissions

### Admin Setup

- [ ] Log in to admin panel
- [ ] Verify admin credentials work (admin@pulse.com)
- [ ] Check KYC submission queue
- [ ] Review approval workflow
- [ ] Test approval process
- [ ] Verify users get welcome bonus

---

## AFTER LAUNCH: DNS Configuration (24 Hours)

### Step 1: Identify Domain Registrar

- [ ] Check domain registration email
- [ ] Identify registrar (GoDaddy, Namecheap, etc.)
- [ ] Find registrar login credentials
- [ ] Write down: pulseinvestme.com

### Step 2: Access DNS Settings

- [ ] Log into registrar account
- [ ] Find "DNS Management" section
- [ ] Select domain: pulseinvestme.com
- [ ] Open DNS records editor

### Step 3: Configure A Record

- [ ] Add or edit A record with:
  - [ ] Type: A
  - [ ] Name/Host: @ (or pulseinvestme.com)
  - [ ] Value: 76.76.21.21
  - [ ] TTL: 3600

**Example for popular registrars:**

**GoDaddy:**
- [ ] Go to My Products → Domains
- [ ] Click Manage next to pulseinvestme.com
- [ ] Click Manage DNS
- [ ] Edit A record to 76.76.21.21
- [ ] Save

**Namecheap:**
- [ ] Go to My Domains
- [ ] Click Manage next to pulseinvestme.com
- [ ] Click Advanced DNS
- [ ] Edit A record to 76.76.21.21
- [ ] Save All

**Domain.com:**
- [ ] Go to My Domains
- [ ] Click Manage for pulseinvestme.com
- [ ] Click Manage Zone
- [ ] Edit A record to 76.76.21.21
- [ ] Save Zone

### Step 4: Verify Configuration

- [ ] Save DNS changes at registrar
- [ ] Take a screenshot of DNS record
- [ ] Write down save time
- [ ] Wait for propagation (15 min to 24 hours)

### Step 5: DNS Propagation Monitoring

- [ ] After 15 minutes: Try visiting pulseinvestme.com
- [ ] Check if page loads (may show Vercel 404 initially)
- [ ] After 1 hour: Refresh and try again
- [ ] After 2 hours: Full verification
- [ ] After 24 hours: 100% propagated globally

---

## VERIFICATION: Is DNS Working?

### Test 1: Browser Test (Easiest)

- [ ] Open new browser tab
- [ ] Type: https://pulseinvestme.com
- [ ] Check if it loads (should show Pulse app or Vercel landing)
- [ ] If it works: ✓ DNS is configured!
- [ ] If timeout: Wait longer, TTL can take up to 24 hours

### Test 2: NSLOOKUP Online Tool

- [ ] Go to https://www.nslookup.io/
- [ ] Type: pulseinvestme.com
- [ ] Look for A record with value 76.76.21.21
- [ ] If you see it: ✓ DNS is correct!
- [ ] If not: Check your registrar configuration again

### Test 3: Command Line (If You Know Terminal)

```bash
nslookup pulseinvestme.com
# Should show: Address: 76.76.21.21
```

- [ ] Open terminal/command prompt
- [ ] Run: nslookup pulseinvestme.com
- [ ] Look for: 76.76.21.21
- [ ] If you see it: ✓ DNS is working!

### Test 4: DNS Checker Tool

- [ ] Go to https://dnschecker.org/
- [ ] Type: pulseinvestme.com
- [ ] Check worldwide DNS status
- [ ] Green checkmarks = DNS working
- [ ] Red X = Still propagating

---

## SSL CERTIFICATE: Verify HTTPS

### After DNS is Working

- [ ] Visit https://pulseinvestme.com (note the HTTPS)
- [ ] Click the lock icon in browser address bar
- [ ] Verify certificate is for pulseinvestme.com
- [ ] Check certificate issuer: Let's Encrypt (Vercel's default)
- [ ] Certificate should be valid (not expired)

If certificate isn't ready yet:
- [ ] Wait 15 minutes
- [ ] Refresh page
- [ ] Vercel auto-generates within 15 min of DNS working

---

## FULL FUNCTIONALITY: Test All Pages

Once pulseinvestme.com is live, test:

### Public Pages

- [ ] https://pulseinvestme.com - Homepage
- [ ] https://pulseinvestme.com/auth/sign-up - Sign up
- [ ] https://pulseinvestme.com/auth/login - Login
- [ ] https://pulseinvestme.com/kyc - KYC upload
- [ ] https://pulseinvestme.com/legal/terms - Terms
- [ ] https://pulseinvestme.com/legal/privacy - Privacy

### User Pages

- [ ] https://pulseinvestme.com/app - Dashboard (after login)
- [ ] https://pulseinvestme.com/auth/forgot-password - Password reset

### Admin Pages

- [ ] https://pulseinvestme.com/admin/login - Admin login
- [ ] https://pulseinvestme.com/admin/panel - Admin dashboard
- [ ] https://pulseinvestme.com/admin/settings - Admin settings

### System

- [ ] https://pulseinvestme.com/api/health - Health check
- [ ] Should respond: {"status":"ok"}

---

## OPTIONAL: Verify Temporary URL Still Works

- [ ] Visit temporary URL:
  https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app
- [ ] Should still work perfectly
- [ ] Keeps as backup
- [ ] Users with old bookmarks won't lose access

---

## TRANSITION: After DNS Verification

### Update Marketing

- [ ] Update all marketing materials to pulseinvestme.com
- [ ] Update social media links
- [ ] Update email signatures
- [ ] Update any ads or promotional materials
- [ ] Update business cards (if physical)

### Communicate with Users

- [ ] Send email: "PULSE is now at pulseinvestme.com"
- [ ] Post on social media
- [ ] Update website
- [ ] Pin announcement in app
- [ ] No action required from users (automatic)

### Monitoring After Switch

- [ ] Monitor traffic on new domain
- [ ] Check error logs
- [ ] Verify admin operations work
- [ ] Test user workflows
- [ ] Confirm no issues reported

---

## BACKUP DOMAIN: If Needed

If pulseinvestme.com has issues:

- [ ] Configure DNS for pulsetrade.com (same A record)
- [ ] Point to 76.76.21.21
- [ ] Wait 24 hours
- [ ] Use pulsetrade.com as backup
- [ ] Both will work independently

---

## Troubleshooting

### DNS Not Propagating After 24 Hours

- [ ] Check A record value: Must be exactly 76.76.21.21
- [ ] Check no extra spaces
- [ ] Check TTL is reasonable (3600 is good)
- [ ] Verify you saved changes in registrar
- [ ] Try clearing DNS cache:
  ```bash
  ipconfig /flushdns  # Windows
  sudo dscacheutil -flushcache  # Mac
  ```
- [ ] Contact registrar support

### Domain Works But Pages Show 404

- [ ] Normal during initial setup
- [ ] Wait 15 minutes for Vercel to detect DNS
- [ ] Refresh page
- [ ] App should load within 15 minutes

### HTTPS Not Working (No Lock Icon)

- [ ] Wait 15 minutes for SSL certificate
- [ ] Verify DNS is fully propagated first
- [ ] Refresh page (hard refresh: Ctrl+Shift+R)
- [ ] SSL auto-generates after DNS works

### Admin Panel Not Accessible

- [ ] Verify you're logged in
- [ ] Try logout then login again
- [ ] Clear browser cookies
- [ ] Try incognito/private window
- [ ] Check admin@pulse.com credentials

---

## Success Checklist: All Items Should Be Checked

- [ ] Domain registered: pulseinvestme.com
- [ ] Domain added to Vercel: ✓
- [ ] DNS A record configured: 76.76.21.21
- [ ] DNS propagated globally: ✓
- [ ] SSL certificate issued: ✓
- [ ] https://pulseinvestme.com loads: ✓
- [ ] All pages working: ✓
- [ ] Admin panel accessible: ✓
- [ ] Users can register: ✓
- [ ] Users can complete KYC: ✓
- [ ] Admin can approve: ✓
- [ ] System fully operational: ✓

---

## Final Status

**When all checks are complete:**

✓ pulseinvestme.com is live  
✓ Professional domain active  
✓ SSL secured  
✓ Zero downtime migration  
✓ All systems operational  
✓ Ready for scale  

---

## Timeline Reference

| When | What | Status |
|------|------|--------|
| TODAY | Launch with temp URL | ✓ Happening |
| Tomorrow | Add DNS record | ⏳ Next |
| Tomorrow | Wait propagation | ⏳ Next |
| +24h | Verify domain works | ⏳ Next |
| +48h | Full propagation | ⏳ Next |
| +48h | Switch to professional | ⏳ Next |

---

**Everything you need to go from temporary URL to professional domain in 24-48 hours.**

No technical expertise required. Simple DNS configuration. Let's do this! 🚀
