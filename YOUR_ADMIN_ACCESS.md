# Your Admin Access - Pulse Investment Platform

## Your Admin Accounts (Ready Now)

Both admin emails have been added to the database and are ready to sign up:

### Admin 1: Lance Gumunyu
- **Email:** lancegumunyu@gmail.com
- **Password:** Test123@
- **Status:** ✅ Added to admin_allowlist

### Admin 2: Samkelisiwe Chiliza
- **Email:** samkelisiwechiliza2@gmail.com
- **Password:** Test123@@
- **Status:** ✅ Added to admin_allowlist

---

## How to Sign Up (Admin Access)

### Step 1: Go to Sign-Up Page
Open: `https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/auth/sign-up`

### Step 2: Create First Admin Account (Lance)
```
Full Name: Lance Gumunyu
Email: lancegumunyu@gmail.com
Password: Test123@
```

Click "Create Account"

### Step 3: Verify Email
- Check your email inbox
- Look for Pulse verification email from Supabase
- Click the verification link
- You'll be redirected to the app

### Step 4: Access Admin Dashboard
- After email verification, you're automatically redirected
- Go to `/app` if not redirected
- You should see **Admin Dashboard** (auto-promoted because email is in allowlist)

### Step 5: Add Second Admin
Repeat steps 1-4 with:
```
Full Name: Samkelisiwe Chiliza
Email: samkelisiwechiliza2@gmail.com
Password: Test123@@
```

---

## What You Can Do As Admin

Once signed in, you have full admin access:

### KYC Management
- View all KYC submissions in queue
- Approve or reject identity verification
- Unlock investor access to platform

### Withdrawal Management
- View all withdrawal requests
- Approve → Process payout
- Reject → Refund to investor balance

### Yield Distribution
- Send yield payments to any investor
- Amount goes directly to their cash balance
- Logged in transaction history

### User Management
- View all investors with balances
- Check KYC status per user
- See complete transaction history
- Add new admins by email

### System Overview
- Complete audit trail of all transactions
- Real-time balance dashboard
- Platform statistics

---

## Admin Dashboard Location

After sign-up and email verification:
- **URL:** `https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/app`
- **You'll see:** Admin Dashboard (not investor dashboard)
- **Admin indicator:** Profile menu shows "Admin Dashboard" option

---

## Troubleshooting

### "Insufficient Credentials" Error
**Cause:** Email/password doesn't exist yet  
**Solution:** Go to `/auth/sign-up` (not login) and create account

### Email Not Verified
**Cause:** Verification email may be in spam  
**Solution:** Check spam folder or request resend in Supabase dashboard

### Not Seeing Admin Dashboard
**Cause:** Email not in admin_allowlist  
**Solution:** Your emails (lancegumunyu@gmail.com, samkelisiwechiliza2@gmail.com) ARE in the allowlist now

### Still Not Admin After Sign-Up
**Cause:** Cache issue  
**Solution:** 
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Clear cookies and try again
- Try incognito window

---

## Database Record

Your admin emails are stored in: `public.admin_allowlist`

```sql
SELECT email FROM public.admin_allowlist WHERE email IN 
('lancegumunyu@gmail.com', 'samkelisiwechiliza2@gmail.com');
```

**Both emails are confirmed in the database.**

---

## First Steps After Sign-Up

1. **Explore the dashboard** — Get familiar with UI
2. **Create test investor** — Open incognito, sign up as investor
3. **Test KYC workflow** — Submit KYC, approve in admin panel
4. **Test deposits** — Use sandbox deposits
5. **Test withdrawals** — Request, approve, refund

---

## Account Security

Your passwords are:
- **Lance:** Test123@
- **Samkelisiwe:** Test123@@

**⚠️ Important:** These are test passwords. Change them to secure passwords after first login for production use.

---

## Next Steps

1. Go to `/auth/sign-up`
2. Sign up with your email
3. Verify email
4. Access admin dashboard
5. Invite Samkelisiwe to sign up

Let me know if you hit any errors!
