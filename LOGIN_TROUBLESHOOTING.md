# Login Troubleshooting Guide

## Error: "Insufficient Credentials"

### What This Means
This error occurs when you try to **sign in** with an email/password combination that doesn't exist in Supabase Auth.

**This is NORMAL.** You need to sign up first before you can log in.

---

## Solution: Sign Up First (Not Login)

### Step 1: Go to Sign-Up Page
```
https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/auth/sign-up
```

### Step 2: Fill Out Sign-Up Form
```
Full Name: Your Name
Email: admin1@pulsetest.co.za (or any email)
Password: TestPass123! (or any password, min 6 chars)
```

### Step 3: Click "Create Account"
- This creates a NEW user in Supabase Auth
- An email verification link will be sent to your email inbox

### Step 4: Verify Your Email
- Open your email inbox
- Click the verification link from Supabase
- This confirms your email address

### Step 5: Go to App
- After verification, go to: `https://your-url/app`
- You're now logged in as a user!

### Step 6: Create Admin Profile
- If you used an admin email (from admin_allowlist), you'll see admin dashboard
- Otherwise, you're a regular investor

---

## Common Mistakes

### ❌ Mistake 1: Trying to Login Before Sign-Up
```
Going to /auth/login with an account that doesn't exist
→ "Insufficient Credentials" error ✗
```

**Fix:** Go to `/auth/sign-up` first to create the account

### ❌ Mistake 2: Wrong Email Format
```
Email: admin1pulsetest.co.za (missing @)
→ Invalid email error ✗
```

**Fix:** Use proper email format: `admin1@pulsetest.co.za`

### ❌ Mistake 3: Password Too Short
```
Password: 12345 (only 5 characters)
→ Password error ✗
```

**Fix:** Use at least 6 characters: `TestPass123!`

### ❌ Mistake 4: Not Confirming Email
```
Sign-up successful, but trying to login immediately
→ Email not verified yet ✗
```

**Fix:** Click the verification link in your email first

---

## Complete Sign-Up Workflow

1. **Go to sign-up page**
   ```
   https://pulse-investment-platform-design-4xtq0tr3g.vercel.app/auth/sign-up
   ```

2. **Enter details**
   ```
   Full Name: Lance Gumunyu
   Email: admin1@pulsetest.co.za
   Password: Pulse@2024
   ```

3. **Click "Create account"**
   - Check your email for verification link
   - Click the link to confirm

4. **You're verified!**
   - Go to `/app`
   - Should see dashboard (admin if email in admin_allowlist)

---

## Testing Workflow (End-to-End)

### Admin Test (3 minutes)
```
1. Sign-up: admin1@pulsetest.co.za
2. Verify email
3. Go to /app
4. See Admin Dashboard ✓
```

### Investor Test (5 minutes)
```
1. Open incognito window (separate session)
2. Sign-up: investor1@pulsetest.co.za
3. Verify email
4. Go to /app → Submit KYC
5. Switch back to admin
6. Approve KYC in admin queue
7. Switch back to investor → See "KYC Verified" ✓
```

---

## If You Still Get "Insufficient Credentials"

### Checklist

- [ ] Did you click "Sign-Up" not "Login"?
- [ ] Did you verify your email?
- [ ] Is your password at least 6 characters?
- [ ] Is your email formatted correctly (has @)?
- [ ] Did you wait 30 seconds after sign-up?

### Still Not Working?

1. **Hard refresh browser**
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

2. **Try incognito window**
   ```
   Ctrl+Shift+N (Windows)
   Cmd+Shift+N (Mac)
   ```

3. **Check browser console for errors**
   ```
   F12 → Console tab → Look for red errors
   ```

4. **Verify Supabase is configured**
   - Go to your Vercel project Settings → Vars
   - Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

---

## Admin Account Checklist

These emails are pre-registered in the database to have admin access:

- admin1@pulsetest.co.za ← Use this first
- admin2@pulsetest.co.za
- support@pulsetest.co.za
- finance@pulsetest.co.za
- lance@pulse.co.za
- you@pulse.co.za

When you sign up with one of these emails, you'll automatically be promoted to admin when you visit `/app`.

---

## Important: Email Verification

Supabase sends a confirmation email to verify your address.

- Check your **Inbox** (not spam)
- Click the "Confirm your email" link
- This takes you back to Pulse
- Now you're fully verified ✓

---

## Reset Password

If you forgot your password:

1. Go to `/auth/login`
2. Click "Forgot password?" (if available)
3. Or: Go to sign-up with same email to create new password

---

## Support

If you're stuck:

1. Check this guide ⬆️
2. Read `TODAY_ACTION_PLAN.md` for step-by-step workflow
3. Check browser console (F12) for technical errors
4. Verify all env vars are set in Vercel

---

**Remember: Sign-Up first, then Login. Not the other way around!**
