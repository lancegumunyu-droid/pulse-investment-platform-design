# Fix Login Issues - Complete Guide

## Problem
- "Insufficient credentials" error
- Supabase auth not working
- Can't sign up or log in

## Root Cause
Email/password authentication is NOT enabled in your Supabase project.

---

## FIX (3 Steps, 5 Minutes)

### Step 1: Enable Email/Password Auth in Supabase

1. **Go to Supabase dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Select your project** "pulse-investment-platform"

3. **Go to Authentication:**
   - Left sidebar → Click "Authentication"
   - Click "Providers"

4. **Enable Email Provider:**
   - Look for "Email" in the list
   - Click on it
   - Toggle "Enable Email provider" to ON
   - Click "Save"

---

### Step 2: Create Your Admin Users in Supabase

1. **Still in Supabase, go to Users:**
   - Authentication → Users

2. **Click "Add User" button**

3. **Create first admin:**
   ```
   Email: lancegumunyu@gmail.com
   Password: Test123@
   Auto-confirm user: YES (toggle ON)
   ```
   Click "Create User"

4. **Create second admin:**
   - Click "Add User" again
   ```
   Email: samkelisiwechiliza2@gmail.com
   Password: Test123@@
   Auto-confirm user: YES (toggle ON)
   ```
   Click "Create User"

5. **Verify both users appear in the Users list**

---

### Step 3: Test Login

1. **Go to your app:**
   ```
   https://pulse-investment-platform-6auij6irw.vercel.app/auth/login
   ```

2. **Enter your credentials:**
   ```
   Email: lancegumunyu@gmail.com
   Password: Test123@
   ```

3. **Click "Log In"**

4. **You should now see the App Dashboard!**

---

## What Will Happen

### If Login Works ✅
- You're logged in
- App dashboard loads
- You see:
  - Portfolio balance
  - KYC status
  - Deposit options
  - Admin controls (KYC queue, withdrawals, etc.)

### If Login Still Fails ❌
Check:
1. Email matches exactly (lancegumunyu@gmail.com)
2. Password is correct (Test123@)
3. User was created with "Auto-confirm" ON
4. Email provider is enabled in Supabase

---

## URL Reference

| Page | URL |
|------|-----|
| App (Logged In) | https://pulse-investment-platform-6auij6irw.vercel.app/app |
| Login | https://pulse-investment-platform-6auij6irw.vercel.app/auth/login |
| Sign Up | https://pulse-investment-platform-6auij6irw.vercel.app/auth/sign-up |
| Home | https://pulse-investment-platform-6auij6irw.vercel.app/ |

---

## After Login Works

You'll have access to:

✅ **Investor Dashboard**
- Portfolio overview
- Balance display
- Deposit wallet
- Investments list
- Staking controls

✅ **Admin Dashboard**
- KYC submissions queue
- Withdrawal requests queue
- Yield distribution tool
- User management
- Add new admins
- Complete audit trail

✅ **Complete App Features**
- Submit KYC
- Make deposits (sandbox or real crypto)
- Invest in projects
- Stake tokens
- Request withdrawals
- Vote on governance

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Invalid login credentials" | User doesn't exist in Supabase. Create manually in dashboard. |
| "User already exists" | User already created. Go to login page, don't sign up. |
| "Email not confirmed" | Check spam folder for Supabase confirmation email. |
| Blank page after login | Hard refresh (Ctrl+Shift+R), clear cache. |
| Still showing marketing page | Hard refresh, try incognito window. |

---

## Done!

Once you're logged in:
1. Invite Samkelisiwe to log in with her email
2. Test creating a new investor account
3. Test KYC approval workflow
4. Test deposits
5. Test investments

---

## Questions?

All documentation is in your repo:
- AUTHENTICATION_SETUP.md - Complete auth guide
- TODAY_ACTION_PLAN.md - Step-by-step workflow
- QUICK_REFERENCE.md - Common commands

Start by fixing the Supabase auth, then login. You're minutes away from a fully functional investment app!
