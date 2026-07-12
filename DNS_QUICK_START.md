# DNS Quick Start - 2 Minutes to Professional Domain

## TL;DR - Do This Now

1. Log into your domain registrar
2. Go to DNS settings for pulseinvestme.com
3. Add ONE A record:
   - **Value**: `76.76.21.21`
   - **TTL**: Leave default
4. Save
5. Done! Wait 24-48 hours.

---

## Your 4-Step Setup

### Step 1: Log In (30 seconds)
- GoDaddy: https://godaddy.com → Sign In → My Products
- Namecheap: https://namecheap.com → Sign In → Dashboard
- Other: Find "Domains" in your registrar's dashboard

### Step 2: Find DNS (30 seconds)
- Find "pulseinvestme.com" domain
- Click "Manage" or "Manage DNS"
- Look for "DNS Settings" or "Zone File"

### Step 3: Add A Record (45 seconds)
- Click "Add Record" or "+"
- Select Type: **A**
- Name/Host: Leave blank (or put @)
- Value/Points to: **76.76.21.21**
- TTL: Leave default
- Click Save/Add

### Step 4: Verify (15 seconds)
- See your new A record in the list
- Shows: A record → 76.76.21.21
- Status: Active

**Total time: 2 minutes**

---

## After You Add the Record

| When | Check |
|------|-------|
| Now | Record appears in registrar ✓ |
| +15 min | Try https://mxtoolbox.com/ search |
| +1 hour | Try https://pulseinvestme.com in browser |
| +24 hours | Should mostly work globally |
| +48 hours | 100% working everywhere |

---

## Your Registrar Doesn't Match? 

Find it here:
- **GoDaddy**: See DNS_REGISTRAR_SETUP.md (page 1)
- **Namecheap**: See DNS_REGISTRAR_SETUP.md (page 2)
- **Bluehost**: See DNS_REGISTRAR_SETUP.md (page 3)
- **1&1**: See DNS_REGISTRAR_SETUP.md (page 4)
- **Other**: Google "[Your registrar] how to add A record"

---

## Testing (After 1-2 Hours)

### Quick Test
1. Visit: https://pulseinvestme.com
2. Should see Pulse homepage
3. Done!

### Detailed Test
1. Go to: https://mxtoolbox.com/
2. Search: `pulseinvestme.com`
3. Look for: A record showing 76.76.21.21 ✓
4. See more at DNS_VERIFICATION_TOOLS.md

---

## That's It!

You've configured professional DNS for pulseinvestme.com while your users stay on the temporary URL.

**Result**: In 24-48 hours, you have a professional branded domain ready to switch to.

---

## Still Need Help?

| Need | Read |
|------|------|
| Detailed steps | DNS_REGISTRAR_SETUP.md |
| Testing methods | DNS_VERIFICATION_TOOLS.md |
| Full timeline | DOMAIN_SETUP_CHECKLIST.md |
| Troubleshooting | DNS_REGISTRAR_SETUP.md (bottom) |

---

**Go add that A record! You're 2 minutes away from starting the 24-48 hour process.** ✓
