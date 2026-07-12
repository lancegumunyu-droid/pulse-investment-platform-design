# DNS Verification & Testing Tools

## What to Test

After adding your A record, use these tools to verify everything is working correctly.

---

## Method 1: Online DNS Checker (Easiest)

### Using MXToolbox
1. Go to https://mxtoolbox.com/
2. Click "DNS Lookup" (or search bar at top)
3. Enter: `pulseinvestme.com`
4. Click "DNS Lookup"
5. Look for the result showing:
   - **Type**: A
   - **IP**: 76.76.21.21
   - **Status**: ✓ (checkmark)

### Using nslookup.io
1. Go to https://www.nslookup.io/
2. Enter domain: `pulseinvestme.com`
3. Look for A Record section
4. Should show: **76.76.21.21**

### Using whatsmydns.net
1. Go to https://www.whatsmydns.net/
2. Enter: `pulseinvestme.com`
3. Record type: A (default)
4. Click "Search"
5. See propagation across global DNS servers
6. Green checkmarks = propagated in that region
7. Red X = still propagating (normal)

---

## Method 2: Command Line (Terminal)

### On Mac or Linux

Open Terminal and run:

```bash
nslookup pulseinvestme.com
```

You should see:
```
Server:  8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name:    pulseinvestme.com
Address: 76.76.21.21
```

Or use dig:
```bash
dig pulseinvestme.com
```

Should show:
```
pulseinvestme.com.     3600    IN  A   76.76.21.21
```

### On Windows

Open Command Prompt and run:
```cmd
nslookup pulseinvestme.com
```

Same output as Mac/Linux.

---

## Method 3: Browser Address Bar (Simplest)

Just type in your browser:

```
https://pulseinvestme.com
```

### What You'll See

**If DNS is working:**
- Page loads (might say "Vercel" or show Pulse homepage)
- URL shows: https://pulseinvestme.com
- Lock icon shows (HTTPS working)

**If DNS is not ready:**
- Error message
- "Can't connect" or "ERR_NAME_NOT_RESOLVED"
- That's OK - just wait and try again in an hour

---

## Method 4: DNS Propagation Checker

### Using DNSChecker.org
1. Go to https://dnschecker.org/
2. Enter: `pulseinvestme.com`
3. Select: A (from dropdown)
4. Click "Check"
5. See which DNS servers worldwide have the record
6. Green = Propagated
7. Gray/Red = Still propagating

---

## Testing Timeline

### Immediately After Adding Record (Time 0)
- Your registrar dashboard: Shows 76.76.21.21 ✓
- MXToolbox: Might show old or new (depends on cache)
- Browser: Usually fails (not propagated yet)

### 15 Minutes Later (Time +15min)
- MXToolbox: Likely shows 76.76.21.21 ✓
- DNS checker sites: Shows partial propagation
- Browser: Might start working for some regions

### 1 Hour Later (Time +1h)
- All online checkers: Show 76.76.21.21 ✓
- Browser: Working for most users
- Command line: `nslookup pulseinvestme.com` shows 76.76.21.21

### 24 Hours Later (Time +24h)
- Everywhere: 100% showing 76.76.21.21
- Browser: pulseinvestme.com fully working
- Global: Accessible from anywhere in world

### 48 Hours Later (Time +48h)
- Perfect: All systems showing correct IP
- Verified: Ready for full migration

---

## Quick Verification Checklist

After adding the A record, use this checklist:

### Immediate (5 minutes after adding)
- [ ] Registrar dashboard shows A record with 76.76.21.21
- [ ] Record shows "Active" status
- [ ] No error messages in registrar

### Short Term (30 minutes later)
- [ ] Visit https://mxtoolbox.com/
- [ ] Search "pulseinvestme.com"
- [ ] DNS Lookup shows: 76.76.21.21 ✓

### Medium Term (2 hours later)
- [ ] Visit https://whatsmydns.net/
- [ ] Search "pulseinvestme.com"
- [ ] See green checkmarks appearing on map
- [ ] At least 50% servers show 76.76.21.21

### Long Term (24+ hours later)
- [ ] Try https://pulseinvestme.com in browser
- [ ] Page loads successfully
- [ ] Address bar shows: https://pulseinvestme.com
- [ ] Lock icon present (HTTPS working)
- [ ] Homepage displays correctly

### Full Verification (48 hours later)
- [ ] https://pulseinvestme.com works globally
- [ ] https://pulseinvestme.com/auth/sign-up works
- [ ] https://pulseinvestme.com/admin/panel works
- [ ] All pages load with correct styling
- [ ] No SSL errors
- [ ] Email verification links work

---

## Common Results & What They Mean

### Result: "NXDOMAIN"
**Meaning**: Domain not found in DNS
**Cause**: Record not added yet or wrong domain name
**Solution**: 
1. Check registrar - is record there?
2. Verify domain name spelling
3. Wait another 15 minutes
4. Try again

### Result: "Timeout"
**Meaning**: DNS server not responding
**Cause**: Usually temporary, or wrong DNS server
**Solution**: Try different checker tool

### Result: Shows old IP (not 76.76.21.21)
**Meaning**: Old DNS cached somewhere
**Cause**: Normal during propagation
**Solution**: Wait 1-2 hours, try again

### Result: Shows 76.76.21.21 ✓
**Meaning**: DNS is working!
**Cause**: Your record was added successfully
**Solution**: Visit domain in browser to test access

---

## SSL Certificate Testing

After DNS resolves (shows 76.76.21.21), test SSL:

### In Browser
1. Visit https://pulseinvestme.com
2. Look for lock icon in address bar
3. Click lock icon
4. Should show: "Secure" or "Connection is secure"
5. Click "Certificate" to see details
6. Issuer should be: "Let's Encrypt" or "Vercel"

### Using SSL Checker
1. Go to https://www.sslchecker.com/
2. Enter: `pulseinvestme.com`
3. Click "Check"
4. Should show:
   - Status: ✓ Valid
   - Certificate: Issued
   - Expiry: Valid

---

## Troubleshooting Tests

### Test 1: Is My Registrar Record Correct?
```bash
# Run this in terminal
nslookup -query=A pulseinvestme.com ns1.yourregistrar.com
```
Should show: 76.76.21.21

### Test 2: Is DNS Globally Propagated?
Go to: https://www.whatsmydns.net/?domain=pulseinvestme.com&query=A

Count green checkmarks. If 70%+ are green = good to go.

### Test 3: Can I Access the Domain?
In your browser, try:
```
https://pulseinvestme.com/api/health
```
Should return: `{"status":"ok"}` (or similar)

### Test 4: Is SSL Certificate Working?
In your browser, try:
```
https://pulseinvestme.com
```
Should load homepage without SSL warnings.

---

## Timeline Reference

| Time | What to Expect | Action |
|------|----------------|--------|
| 0 min | Record added | Refresh registrar to confirm |
| 15 min | Online checkers show 76.76.21.21 | Test with MXToolbox |
| 1 hour | Most DNS servers updated | Try browser access |
| 24 hours | Global propagation 90%+ | Full functionality testing |
| 48 hours | Complete propagation | Everything working |

---

## Final Verification (After 48 Hours)

Run all these tests:

1. **Browser test**: Visit https://pulseinvestme.com → Should work
2. **DNS test**: https://mxtoolbox.com → Should show 76.76.21.21
3. **SSL test**: https://www.sslchecker.com → Should be valid
4. **Global test**: https://www.whatsmydns.net → Should show 100% green
5. **API test**: https://pulseinvestme.com/api/health → Should return status ok
6. **Sign-up test**: https://pulseinvestme.com/auth/sign-up → Should work
7. **Admin test**: https://pulseinvestme.com/admin/panel → Should work

If all 7 tests pass → **You're ready to switch!**

---

## Still Having Issues?

**Contact your registrar support**:
- They're experts in DNS
- They can verify your record is correct
- They can help with any propagation issues
- Most support 24/7

**Check Vercel status**: https://www.vercel-status.com/
- Make sure their servers are running
- Usually always up, but good to verify

**Temporary URL still works**: 
```
https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app
```
This always works while you troubleshoot pulseinvestme.com

---

**You've got this!** Use these tools and you'll have pulseinvestme.com fully operational in 24-48 hours.
