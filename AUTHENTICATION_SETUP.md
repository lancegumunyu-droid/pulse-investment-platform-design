# Pulse Authentication Setup Guide

## Issue: Login/SignUp Not Working

If you're experiencing "insufficient credentials" or auth failures, follow this guide.

---

## Step 1: Verify Supabase Auth is Enabled

1. **Go to your Supabase dashboard:**
   - https://supabase.com/dashboard
   - Select project: `pulse-investment-platform`

2. **Navigate to Authentication:**
   - Left sidebar → Authentication → Providers

3. **Enable Email/Password Provider:**
   - Click on "Email" 
   - Toggle "Enable Email provider" to ON
   - Save

4. **Check Auth Settings:**
   - Go to Authentication → Settings
   - Verify "Enable signup" is ON
   - Verify "Enable email confirmations" is ON (or OFF if you want instant access)

---

## Step 2: Create Your Admin Account Manually in Supabase

If web signup doesn't work, create users directly in Supabase:

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard

2. **Navigate to Authentication → Users**

3. **Click "Add User"**

4. **Enter:**
   ```
   Email: lancegumunyu@gmail.com
   Password: Test123@
   Auto-confirm user: YES (toggle ON)
   ```

5. **Click "Create User"**

6. Repeat for second admin:
   ```
   Email: samkelisiwechiliza2@gmail.com
   Password: Test123@@
   Auto-confirm user: YES
   ```

---

## Step 3: Access Your App

After creating users in Supabase:

1. **Go to app login:**
   ```
   https://pulse-investment-platform-6auij6irw.vercel.app/auth/login
   ```

2. **Enter credentials:**
   ```
   Email: lancegumunyu@gmail.com
   Password: Test123@
   ```

3. **Click "Log In"**

4. **You should now be in the app dashboard**

---

## Step 4: Check Email Confirmation (if enabled)

If you have email confirmation enabled:

1. Check your email for Supabase confirmation link
2. Click the link to verify
3. You can then login

---

## Troubleshooting

### Error: "Invalid login credentials"
**Solution:** User doesn't exist in Supabase yet. Create them manually in Supabase dashboard.

### Error: "User already exists"
**Solution:** User is already in Supabase. Use login page instead of signup.

### Error: "Email not confirmed"
**Solution:** Check your email for confirmation link and click it.

### Redirect loop or blank page
**Solution:** 
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Try incognito window

---

## Direct URLs

**Signup Page:**
```
https://pulse-investment-platform-6auij6irw.vercel.app/auth/sign-up
```

**Login Page:**
```
https://pulse-investment-platform-6auij6irw.vercel.app/auth/login
```

**App Dashboard:**
```
https://pulse-investment-platform-6auij6irw.vercel.app/app
```

**Homepage:**
```
https://pulse-investment-platform-6auij6irw.vercel.app/
```

---

## Database Structure

Your admin emails are already in the database:

| Email | Role | Status |
|-------|------|--------|
| lancegumunyu@gmail.com | Admin | Ready |
| samkelisiwechiliza2@gmail.com | Admin | Ready |

When you log in, you'll be auto-promoted to admin because your email is in `admin_allowlist`.

---

## Next Steps

1. Go to Supabase dashboard
2. Enable Email/Password auth
3. Create your users manually
4. Go to login page
5. Enter credentials
6. Access admin dashboard

