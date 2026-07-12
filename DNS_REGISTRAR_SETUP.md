# DNS Setup Guide for pulseinvestme.com

## Quick Reference: What You're Doing

- **Domain**: pulseinvestme.com
- **Record Type**: A record
- **Value**: 76.76.21.21
- **TTL**: 3600 (or default)
- **Time to Live**: Will take 24-48 hours to propagate globally

---

## GoDaddy (Step-by-Step)

### 1. Log Into GoDaddy
- Go to https://www.godaddy.com
- Click "Sign In" (top right)
- Enter your email and password
- Click "Sign In"

### 2. Go to DNS Management
- Click your account icon (top right)
- Select "My Products"
- Find "pulseinvestme.com" in the list
- Click the dropdown arrow next to it
- Click "Manage DNS"

### 3. Add the A Record
- You'll see a list of existing DNS records
- Look for a button that says "Add" or "+ Add Record"
- Click it

### 4. Fill In the Record
You'll see a form with these fields:
- **Type**: Select "A" from dropdown
- **Name**: Leave blank (or enter @ )
- **Value/Points to**: Enter `76.76.21.21`
- **TTL**: Leave as default (usually 1 hour)

### 5. Save
- Click "Save DNS" or "Add Record"
- You'll see a confirmation message

### 6. Verify
- You should see the new A record in your DNS list
- Shows: A record pointing to 76.76.21.21
- Status: Active (may take a few seconds to show)

**Done!** Your DNS is configured. Now wait 24-48 hours.

---

## Namecheap (Step-by-Step)

### 1. Log Into Namecheap
- Go to https://www.namecheap.com
- Click "Sign In" (top right)
- Enter your username and password
- Click "Sign In"

### 2. Go to Domain List
- Click "Dashboard" in the top menu
- Or click your account icon → "Manage Domains"
- You'll see your list of domains

### 3. Access DNS Settings
- Find "pulseinvestme.com" in the list
- Click "Manage" next to it
- Click the "Advanced DNS" tab

### 4. Add the A Record
- Scroll down to "Host Records"
- You'll see existing records (MX, CNAME, etc.)
- Look for "Add New Record" button at the bottom
- Click it

### 5. Fill In the Record
A new row will appear with these fields:
- **Type**: Select "A Record"
- **Host**: Leave blank (or enter @)
- **Value**: Enter `76.76.21.21`
- **TTL**: Leave as default (1800 or 3600)

### 6. Save
- Click the green checkmark icon at the right end of the row
- Or click "Save Changes" button
- You'll see a confirmation: "DNS changed successfully"

**Done!** Your DNS is configured. Now wait 24-48 hours.

---

## Other Popular Registrars

### Bluehost
1. Log in to Bluehost account
2. Go to "Domains" → "Your Domains"
3. Click "Manage DNS"
4. Click "Add Record"
5. Type: A | Name: @ | Value: 76.76.21.21 | TTL: 3600
6. Click "Add"

### 1&1 (One and One)
1. Log in to 1&1 account
2. Go to "Domains"
3. Click the domain "pulseinvestme.com"
4. Click "Edit DNS Settings" or "Manage DNS"
5. Look for "Add DNS Record"
6. Type: A | Name: @ | Value: 76.76.21.21
7. Click "Save"

### HostGator
1. Log in to HostGator account
2. Go to "Domains"
3. Click "Manage Domain"
4. Click "Zone Editor"
5. Click "Add Record"
6. Select "A Record"
7. Name: @ | Points to: 76.76.21.21
8. Click "Add Record"

### Network Solutions
1. Log in to Network Solutions
2. Click "Manage Accounts"
3. Select domain "pulseinvestme.com"
4. Click "Manage"
5. Click "DNS & Zone File Management"
6. Click "Edit A Records"
7. Name: @ | IP: 76.76.21.21
8. Click "Update"

### AWS Route 53
1. Log into AWS console
2. Go to Route 53 → Hosted zones
3. Find "pulseinvestme.com"
4. Click "Create record"
5. Record type: A
6. Value: 76.76.21.21
7. Click "Create records"

---

## What NOT to Do

❌ **Don't add these records**:
- CNAME records (will conflict)
- MX records (breaks email)
- Multiple A records pointing to different IPs

❌ **Don't change these**:
- Existing MX records (if you have email)
- Existing CNAME records
- Name servers (unless instructed)

✓ **Do this only once**: Add one A record and save
✓ **Do wait**: 24-48 hours for global propagation
✓ **Do verify**: Use testing tools after propagation

---

## Verification After Setup

### Immediate Check (Right After Adding Record)
Your registrar dashboard should show:
```
Type: A
Name: @ (or pulseinvestme.com)
Value: 76.76.21.21
Status: Active
```

### After 15 Minutes
Try visiting in your browser:
```
https://pulseinvestme.com
```
You might get an error - that's normal if not propagated yet.

### After 1 Hour
Try again:
```
https://pulseinvestme.com
```
Should show the Pulse homepage or loading.

### After 24 Hours
Should be working for most users globally.

### After 48 Hours
Should be working for 100% of users worldwide.

---

## If You See Errors

### Error: "DNS_PROBE_FINISHED_NXDOMAIN"
- DNS record exists but hasn't propagated yet
- **Solution**: Wait another hour and refresh

### Error: "Connection Timeout"
- DNS might not be set correctly
- **Solution**: Check registrar shows 76.76.21.21 in A record

### Error: "SSL Certificate Error"
- DNS is working but SSL isn't ready yet
- **Solution**: Vercel auto-generates SSL after 10-15 min

### Error: "This site can't be reached"
- Double-check your A record value
- **Solution**: Verify it's exactly: 76.76.21.21 (no typos)

---

## Need to Undo? (If Something Goes Wrong)

Simply delete the A record you added:

1. Log into your registrar
2. Find the A record pointing to 76.76.21.21
3. Click the delete/trash icon
4. Confirm deletion
5. Your old DNS settings remain

The temporary URL still works:
```
https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app
```

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Log into registrar | 1 min |
| 2 | Find DNS settings | 1 min |
| 3 | Add A record to 76.76.21.21 | 1 min |
| 4 | Wait for propagation | 24-48 hours |
| 5 | Test pulseinvestme.com | 1 min |
| **Total** | **Ready to go** | **24-48 hours** |

---

## Support

If you get stuck:
1. Check this guide again - most answers are here
2. Read "DNS_VERIFICATION_TOOLS.md" for testing
3. Check "DNS_QUICK_START_ONE_PAGER.md" for quick reference
4. Read your registrar's help docs
5. Contact your registrar support (they're very helpful for DNS)

---

**Your domain is waiting! Add that one A record and you're all set.** ✓
