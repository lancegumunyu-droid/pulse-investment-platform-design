# PULSE DNS RECORDS - COMPLETE CLOUDFLARE SETUP

## Domain: pulse-invest.vercel.app
## Platform: Cloudflare DNS Management

---

## RECORDS TO ADD (Copy/Paste Exactly)

### CNAME Record 1 - SendGrid Email Routing
```
Type: CNAME
Name: 110894509
Content: sendgrid.net
TTL: Auto
Proxy status: Proxied
```

### CNAME Record 2 - SendGrid Email Routing
```
Type: CNAME
Name: em5933
Content: u110894509.wl010.sendgrid.net
TTL: Auto
Proxy status: Proxied
```

### CNAME Record 3 - SendGrid Email Routing
```
Type: CNAME
Name: url2566
Content: sendgrid.net
TTL: Auto
Proxy status: Proxied
```

### CNAME Record 4 - SendGrid DKIM Key 1
```
Type: CNAME
Name: s1._domainkey
Content: s1.domainkey.u110894509.wl010.sendgrid.net
TTL: Auto
Proxy status: DNS only
```

### CNAME Record 5 - SendGrid DKIM Key 2
```
Type: CNAME
Name: s2._domainkey
Content: s2.domainkey.u110894509.wl010.sendgrid.net
TTL: Auto
Proxy status: DNS only
```

### TXT Record 1 - DMARC Policy (Email Security)
```
Type: TXT
Name: _dmarc
Content: "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"
TTL: Auto
```

---

## STEP-BY-STEP INSTRUCTIONS (Cloudflare)

### How to Add Records:

1. **Go to Cloudflare Dashboard**
   - https://dash.cloudflare.com

2. **Select Your Domain**
   - Click: pulse-invest.vercel.app

3. **Navigate to DNS**
   - Left sidebar → DNS

4. **Add Each Record**
   - Click: "+ Add record"
   - Select: Record type (CNAME or TXT)
   - Name: [Enter name from above]
   - Content: [Enter content from above]
   - TTL: Auto
   - Click: Save

5. **Repeat for all 6 records above**

---

## RECORDS ALREADY EXISTS (Keep As-Is)

These should already be visible in your Cloudflare DNS (as shown in your screenshot):

```
✅ TXT: _domainkey (verification)
✅ TXT: Domain verification record (c-domain-verify-pul...)
✅ SPF record (v=spf1)
```

**Do NOT delete these.** Leave them as they are.

---

## NAMESERVERS (Already Updated)

Your nameservers should already point to Cloudflare:

```
Nameserver 1: jose.ns.cloudflare.com
Nameserver 2: sreeni.ns.cloudflare.com
```

If not updated yet, go to your domain registrar (DigitalPlat) and change:

**Delete old nameservers:**
- ns1.vercel-dns.com
- ns2.vercel-dns.com

**Add Cloudflare nameservers:**
- jose.ns.cloudflare.com
- sreeni.ns.cloudflare.com

---

## VERIFICATION TIMELINE

| Step | Timeline | Status |
|------|----------|--------|
| Add DNS records | Immediate | ✅ Do now |
| DNS Propagation | 5-30 minutes | ⏳ Wait |
| Verification | 30-60 minutes | 🔄 Auto-checks |
| Email delivery | After verified | ✅ Enabled |

---

## WHAT HAPPENS AFTER

Once all records are added and verified:

```
✅ Email sending: Via SendGrid
✅ DKIM verification: Emails signed
✅ DMARC policy: Email authentication enforced
✅ Bounce prevention: Invalid emails rejected upstream
✅ Spam filtering: Reduced spam folder placement
✅ Admin approval emails: Sent reliably
✅ User notification emails: Delivered to inbox
```

---

## TROUBLESHOOTING

### If emails not sending:
1. Check all 6 records are added
2. Wait full 30 minutes for propagation
3. Verify proxy status:
   - CNAME records 1-3: Proxied (orange cloud)
   - CNAME records 4-5: DNS only (gray cloud)
   - TXT record: DNS only

### If records show "PENDING REVIEW":
- This is normal
- Cloudflare will verify within 30-60 minutes
- Check back in 1 hour

### If still having issues:
- Test email delivery at SendGrid dashboard
- Check email logs at SendGrid
- Verify domain is verified in SendGrid

---

## CURRENT STATUS (From Your Screenshot)

Your Cloudflare shows:

```
✅ 110894509 CNAME → sendgrid.net (Proxied)
✅ em5933 CNAME → u110894509.wl010.sendgrid.net (Proxied)
✅ s1._domainkey CNAME → s1.domainkey.u110894509.wl010.sendgrid.net (DNS only)
✅ s2._domainkey CNAME → s2.domainkey.u110894509.wl010.sendgrid.net (DNS only)
✅ url2566 CNAME → sendgrid.net (Proxied)
✅ _dmarc TXT → v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; (DNS only)
+ Other verification records (leave as-is)

Status: Pending verification
→ Wait 5-30 minutes for full propagation
```

**All 6 records appear to be correctly added!**

---

## NEXT STEPS

1. ✅ Records are all added (you're done!)
2. ⏳ Wait 30 minutes for DNS propagation
3. 🔄 Cloudflare auto-verifies domain
4. ✅ Email delivery begins
5. ✅ Notifications sent to admin & users

---

## QUICK REFERENCE - WHAT EACH RECORD DOES

| Record | Purpose | Status |
|--------|---------|--------|
| 110894509 CNAME | Email routing | ✅ Configured |
| em5933 CNAME | SendGrid bounce handling | ✅ Configured |
| url2566 CNAME | SendGrid link tracking | ✅ Configured |
| s1._domainkey CNAME | DKIM signing key 1 | ✅ Configured |
| s2._domainkey CNAME | DKIM signing key 2 | ✅ Configured |
| _dmarc TXT | Email authentication policy | ✅ Configured |

---

## EMAIL FLOW

```
User Action (Deposit/Withdrawal Request)
         ↓
Supabase triggers email
         ↓
SendGrid receives email request
         ↓
Uses DNS records to route
         ↓
DKIM signs email with s1/s2 keys
         ↓
DMARC policy verified
         ↓
Email sent to recipient
         ↓
Admin/User receives notification
```

---

**All DNS records are configured and ready. Wait 30 minutes for propagation, then test email sending!**
