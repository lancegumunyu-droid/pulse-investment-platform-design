# PULSE Environment Variables Configuration

## Updated Configuration for New Features

### 1. Welcome Bonus Configuration
```
WELCOME_BONUS_AMOUNT=35
WELCOME_BONUS_CURRENCY=USDT
WELCOME_BONUS_EXPIRY_DAYS=30
```

### 2. Admin Approval Settings
```
# Require admin approval for all deposits/withdrawals
REQUIRE_ADMIN_APPROVAL_DEPOSITS=true
REQUIRE_ADMIN_APPROVAL_WITHDRAWALS=true
REQUIRE_ADMIN_APPROVAL_KYC=true
ADMIN_APPROVAL_TIMEOUT_HOURS=2
```

### 3. Referral Program Configuration
```
# Referral rewards and settings
REFERRAL_ENABLED=true
REFERRAL_BONUS_AMOUNT=35
REFERRAL_BONUS_CURRENCY=USDT
REFERRAL_MAX_PER_USER_PER_DAY=20
REFERRAL_EXPIRY_DAYS=30
REFERRAL_TRACKING_ENABLED=true
```

### 4. Security Hardening
```
# Email verification
EMAIL_VERIFICATION_REQUIRED=true
DUPLICATE_EMAIL_CHECK=true
DUPLICATE_PHONE_CHECK=true
DUPLICATE_ID_CHECK=true

# Session security
SESSION_TIMEOUT_MINUTES=30
IP_CHANGE_DETECTION=true
DEVICE_FINGERPRINT_REQUIRED=true

# API Security
REQUEST_SIGNATURE_REQUIRED=true
API_RATE_LIMITING_ENABLED=true
CSRF_TOKEN_REQUIRED=true
XSS_PROTECTION=true
SQL_INJECTION_PROTECTION=true

# Anti-Scraping
CONTENT_PROTECTION=true
ROBOTS_CHECK_ENABLED=true
HONEYPOT_FIELDS_ENABLED=true
BEHAVIOR_ANALYTICS_ENABLED=true
```

### 5. Email Confirmation Flow
```
# Email callback configuration
EMAIL_CALLBACK_URL=/auth/callback
EMAIL_CONFIRMATION_REDIRECT=/auth/email-confirmed
EMAIL_CONFIRMATION_TIMEOUT_MINUTES=24
```

### 6. Database Configuration
```
# Supabase configuration (update if needed)
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>

# New fields for users table
# - referral_code: unique referral code per user
# - referral_link_generated_at: timestamp
# - referral_share_count: count of times shared
# - admin_approval_pending: boolean for transaction approvals
```

### 7. Application URLs
```
# Base URL for referral links
NEXT_PUBLIC_APP_URL=https://pulse-investment-platform-design-lancegumunyu-droids-projects.vercel.app

# After DNS setup, update to:
# NEXT_PUBLIC_APP_URL=https://pulseinvestme.com
```

## What Changed

### New Environment Variables Added
✓ WELCOME_BONUS_AMOUNT (changed from 50 to 35)
✓ REQUIRE_ADMIN_APPROVAL_DEPOSITS (true)
✓ REQUIRE_ADMIN_APPROVAL_WITHDRAWALS (true)
✓ REFERRAL_ENABLED (true)
✓ REFERRAL_BONUS_AMOUNT (35)
✓ Security hardening vars (10+)

### Features Enabled
✓ Welcome bonus of $35 USDT
✓ Admin approval for all deposits
✓ Admin approval for all withdrawals
✓ Referral program enabled
✓ Email confirmation flow fixed
✓ Enhanced security hardening
✓ Rate limiting on referral shares
✓ Behavior analytics

## Deployment Steps

1. Add all new env vars to Vercel Settings → Environment Variables
2. Update `.env.development.local` with new values
3. Rebuild application: `npm run build`
4. Deploy: `vercel deploy --prod`

## Verification Checklist

After deployment, verify:
- [ ] Users receive $35 welcome bonus after KYC approval
- [ ] Email confirmation link works and redirects properly
- [ ] Referral code is generated automatically
- [ ] Referral link displays on email confirmed page
- [ ] Copy referral link button works
- [ ] Deposit requests require admin approval
- [ ] Withdrawal requests require admin approval
- [ ] Security headers are present
- [ ] Rate limiting is active
- [ ] No referral spam possible (rate limited to 20/day)

## Support

If any variable is missing or not working:
1. Check Vercel Environment Variables settings
2. Verify local `.env.development.local` has all vars
3. Rebuild with `npm run build`
4. Check logs for specific errors
5. Contact v0 support if needed
