# Pulse - Your Personal Admin Access

## Right Now - Get Started in 3 Minutes

### Your Admin Credentials

```
Email:    lancegumunyu@gmail.com
Password: Test123@
Role:     Administrator (Auto-promoted)
```

### Step 1: Sign Up (2 minutes)
Go to: **https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/auth/sign-up**

Fill in:
- Full Name: Lance Gumunyu
- Email: lancegumunyu@gmail.com
- Password: Test123@

Click "Create Account"

### Step 2: Verify Email (1 minute)
Check your email inbox (lancegumunyu@gmail.com):
- Look for Supabase confirmation email
- Click the verification link
- You'll be redirected to the app automatically

### Step 3: Access Admin Dashboard
You're now automatically promoted to **Admin** because your email is in the allowlist.

Go to: **https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/app**

You should see the **Admin Dashboard** with:
- KYC Queue
- Withdrawal Queue
- Yield Distribution
- User Management
- Transaction History

---

## Add Your Co-Admin (Samkelisiwe)

Once you're in the dashboard, you can either:

### Option A: Have Samkelisiwe Sign Up Herself
Send her the same URL:
- Go to `/auth/sign-up`
- Email: samkelisiwechiliza2@gmail.com
- Password: Test123@@
- Auto-promoted to admin

### Option B: Add Via Dashboard
1. Go to Admin Dashboard → Settings
2. Click "Add Admin"
3. Enter: samkelisiwechiliza2@gmail.com
4. She signs up → Auto-admin

---

## Test the Platform (5 minutes)

### Test 1: Create Investor Account
1. Open **Incognito Window** (Ctrl+Shift+N or Cmd+Shift+N)
2. Go to `/auth/sign-up`
3. Email: investor@test.com
4. Password: Test123!
5. Sign up and verify email

### Test 2: Submit KYC (as investor)
1. In incognito (investor account)
2. Go to `/app` → Profile → KYC
3. Fill in: Name, ID Number, DOB, Country
4. Click Submit

### Test 3: Approve KYC (as you, Lance)
1. Go back to your admin account (regular browser)
2. Refresh `/app` → Admin Dashboard
3. Go to **KYC Queue**
4. See investor's submission
5. Click **Approve**
6. Go back to incognito → Refresh → Status shows **Verified** ✓

### Test 4: Test Deposit
1. In incognito (investor account)
2. Go to `/app` → Deposit
3. Choose amount ($100)
4. Click "Simulate Deposit" (sandbox mode)
5. Balance credits immediately

### Test 5: Request Withdrawal
1. In incognito
2. Go to `/app` → Withdrawals
3. Enter amount
4. Click "Request Withdrawal"

### Test 6: Approve Withdrawal (as admin)
1. Go back to admin
2. Refresh `/app` → Admin Dashboard
3. Go to **Withdrawal Queue**
4. See request
5. Click **Approve**
6. Investor balance deducted ✓

---

## Admin Features Available Now

### KYC Management
- Review all pending KYC submissions
- Approve → Investor unlocks full platform
- Reject → Investor must resubmit

### Withdrawal Management
- See all withdrawal requests
- Approve → Process payout
- Reject → Money refunded to balance

### Yield Distribution
- Manually credit yield to any investor
- Specify amount (e.g., $50)
- Goes to their cash balance
- Logged in transaction history

### User Management
- View all investor accounts
- See each investor's:
  - Total balance
  - Invested amount
  - Staked tokens
  - KYC status
  - Transaction history

### Add More Admins
- Enter any email
- They sign up → Auto-admin
- Full admin access

---

## Deployed Platform URLs

| Page | URL |
|------|-----|
| Homepage | https://pulse-investment-platform-design-4xtq0tr3g.vercel.app |
| Sign Up | https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/auth/sign-up |
| Admin Dashboard | https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/app |

---

## Important Notes

✅ Your email (lancegumunyu@gmail.com) is in the admin allowlist  
✅ You'll be auto-promoted to admin on sign-up  
✅ Samkelisiwe's email (samkelisiwechiliza2@gmail.com) is also in the allowlist  
✅ All data is persisted in Supabase  
✅ Platform is live and production-ready  

---

## Need to Change Password?

After first login:
1. Go to Profile → Account Settings
2. Click "Change Password"
3. Enter new password (secure one for production)
4. Save

---

## Database Backup

Your admin emails are stored in Supabase:
- Table: `admin_allowlist`
- Your email: `lancegumunyu@gmail.com`
- Samkelisiwe: `samkelisiwechiliza2@gmail.com`

They can never be removed unless you explicitly delete them.

---

## Next Steps

1. **Sign up now** with lancegumunyu@gmail.com → Test123@
2. **Verify email**
3. **Access admin dashboard**
4. **Invite Samkelisiwe** to sign up or add her via admin panel
5. **Test all workflows** (KYC, deposits, withdrawals)

---

**You're ready to go. Your platform is live! 🚀**

Questions? All documentation is in your repo.
