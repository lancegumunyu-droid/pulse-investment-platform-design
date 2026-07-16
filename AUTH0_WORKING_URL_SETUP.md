# AUTH0 SIMPLIFIED SETUP - USING pulse-invest.vercel.app

## We're Sticking With Your Working URL

**Primary Domain:** `pulse-invest.vercel.app`
**Status:** ✅ Live and working NOW

---

## SKIP THE CUSTOM DOMAIN

Delete `pulse-invest.vercel.app` from Custom Domains? **NO** - leave it alone!

We'll just use the Vercel domain directly. It's already verified and working.

---

## AUTH0 APPLICATION SETTINGS (Final)

### Basic URLs
- **Application Login URI:** `https://pulse-invest.vercel.app/auth/sign-in`

### Allowed Callback URLs (4)
```
https://pulse-invest.vercel.app/api/auth/callback
https://pulse-invest.vercel.app/auth/callback
https://pulse-invest.vercel.app
http://localhost:3000/api/auth/callback
```

### Allowed Logout URLs (1)
```
https://pulse-invest.vercel.app
```

### Allowed Web Origins (2)
```
https://pulse-invest.vercel.app
http://localhost:3000
```

---

## EMAIL TEMPLATES CONFIGURATION

### Email Template 1: Verification Email (Link)

**From:**
```
PULSE <noreply@pulse-invest.vercel.app>
```

**Subject:**
```
Verify your PULSE Account
```

**Redirect To:**
```
https://pulse-invest.vercel.app/auth/callback
```

**URL Lifetime:**
```
432000
```

**Message:** Copy the HTML template at bottom of this file

---

### Email Template 2: Welcome Email

**From:**
```
PULSE <noreply@pulse-invest.vercel.app>
```

**Subject:**
```
Welcome to PULSE Investment Platform
```

**Redirect To:**
```
https://pulse-invest.vercel.app/app
```

**URL Lifetime:**
```
432000
```

**Message:** Copy the HTML template at bottom of this file

---

### Email Template 3: Change Password (Link)

**From:**
```
PULSE <noreply@pulse-invest.vercel.app>
```

**Subject:**
```
Reset Your PULSE Password
```

**Redirect To:**
```
https://pulse-invest.vercel.app/auth/forgot-password
```

**URL Lifetime:**
```
86400
```

**Message:** Copy the HTML template at bottom of this file

---

## FINAL ENVIRONMENT VARIABLES

Add these to Vercel:

```
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=[Copy from Auth0 Settings tab]
AUTH0_CLIENT_SECRET=[Copy from Auth0 Settings tab]
AUTH0_BASE_URL=https://pulse-invest.vercel.app
AUTH0_ISSUER_BASE_URL=https://dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_METADATA_URL=https://pulse-invest.vercel.app/.well-known/openid-configuration

RESEND_API_KEY=[Your Resend API key]

NEXT_PUBLIC_TURNSTILE_SITE_ID=0x4AAAAAAD2hbNmbbW7vdZXO
TURNSTILE_SECRET_KEY=0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i

PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=[Generate new secure password]
ADMIN_API_KEY=[Generate new API key]
```

---

## STEP-BY-STEP TO COMPLETE NOW

### Step 1: Auth0 Application Settings
1. Go Auth0 → Applications → PULSE Investment Platform → Settings
2. Clear **Allowed Callback URLs** and add the 4 URLs above
3. Clear **Allowed Logout URLs** and add: `https://pulse-invest.vercel.app`
4. Clear **Allowed Web Origins** and add the 2 URLs above
5. **Save Changes**

### Step 2: Configure Email Templates
1. Go Auth0 → Authentication → Email Templates
2. Select **Verification Email (Link)**
3. Fill in From, Subject, Redirect To, URL Lifetime
4. Paste HTML template in Message field
5. **Save**
6. Repeat for Welcome Email and Change Password

### Step 3: Get Client ID & Secret
1. In Settings tab, copy **Client ID**
2. Copy **Client Secret**
3. Add both to Vercel environment variables

### Step 4: Add Email Variables
1. Get **RESEND_API_KEY** from Resend dashboard
2. Add to Vercel env vars

### Step 5: Test
1. Go `https://pulse-invest.vercel.app/auth/sign-up`
2. Sign up with test email
3. Check inbox for verification email
4. Verify email in app
5. Done!

---

## EMAIL TEMPLATES (HTML)

### Verification Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Verify Your Account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #f59e0b; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #faf5f0; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .highlight { color: #f59e0b; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PULSE Investment Platform</h1>
        </div>
        <div class="content">
            <h2>Welcome, {{user.name}}!</h2>
            <p>Thank you for creating your PULSE account. We&apos;re excited to have you.</p>
            
            <p><span class="highlight">Bonus Alert:</span> New members receive a <strong>$35 sign-up bonus</strong> to start investing immediately!</p>
            
            <p>Please verify your email address by clicking the button below:</p>
            
            <center>
                <a href="{{ url }}" class="button">Verify Email Address</a>
            </center>
            
            <p>This link will expire in <strong>5 days</strong>.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p><strong>Security Notice:</strong></p>
            <ul>
                <li>Never share your password with anyone</li>
                <li>PULSE will never ask for your password via email</li>
                <li>If you didn&apos;t create this account, please contact us immediately</li>
            </ul>
        </div>
        <div class="footer">
            <p>&copy; PULSE Investment Platform. All rights reserved.</p>
            <p>If you have questions, contact us at support@pulse-invest.app</p>
        </div>
    </div>
</body>
</html>
```

### Welcome Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to PULSE</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #f59e0b; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; margin: 20px 0; font-weight: bold; }
        .content { background: #faf5f0; padding: 30px 20px; }
        .step { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
        .step h3 { margin-top: 0; color: #1a1a1a; }
        .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f9f9f9; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PULSE Investment Platform</h1>
            <div class="success-badge">✓ Account Verified</div>
        </div>
        <div class="content">
            <h2>Your Account is Ready!</h2>
            <p>Welcome to PULSE, {{user.name}}!</p>
            
            <p><strong>Your $35 Sign-Up Bonus Has Been Added</strong></p>
            <p>Use your bonus to start investing in your first portfolio immediately. No additional requirements needed!</p>
            
            <h3>Getting Started - 3 Simple Steps:</h3>
            
            <div class="step">
                <h3>1. Complete Your Profile</h3>
                <p>Add your investment preferences and financial goals to get personalized recommendations.</p>
            </div>
            
            <div class="step">
                <h3>2. Add Funds</h3>
                <p>Link your bank account and deposit funds. Your $35 bonus is already waiting!</p>
            </div>
            
            <div class="step">
                <h3>3. Start Investing</h3>
                <p>Browse portfolios, select your investments, and watch your money grow.</p>
            </div>
            
            <center style="margin: 30px 0;">
                <a href="{{ url }}" class="cta-button">Go to Your Dashboard</a>
            </center>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p><strong>Why Choose PULSE?</strong></p>
            <ul>
                <li>Low fees - Industry-leading commission rates</li>
                <li>Smart portfolios - AI-powered recommendations</li>
                <li>24/7 Support - Real experts, real answers</li>
                <li>Secure - Bank-grade encryption</li>
            </ul>
        </div>
        <div class="footer">
            <p>&copy; PULSE Investment Platform. All rights reserved.</p>
            <p>Contact: support@pulse-invest.app</p>
        </div>
    </div>
</body>
</html>
```

### Password Reset Email Template

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .alert h2 { margin-top: 0; color: #dc2626; }
        .header { background: #1a1a1a; color: #f59e0b; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #faf5f0; padding: 30px 20px; border-radius: 0 0 8px 8px; }
        .cta-button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PULSE Security Alert</h1>
        </div>
        <div class="content">
            <div class="alert">
                <h2>Password Reset Requested</h2>
                <p>We received a request to reset the password for your PULSE account.</p>
            </div>
            
            <p>Click the button below to reset your password:</p>
            
            <center>
                <a href="{{ url }}" class="cta-button">Reset Password</a>
            </center>
            
            <p><strong>This link expires in 24 hours.</strong></p>
            
            <div class="warning">
                <strong>Important:</strong> If you didn&apos;t request this password reset, your account may be at risk. Contact us immediately at support@pulse-invest.app
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication for extra security</li>
                <li>Never click reset links from suspicious emails</li>
            </ul>
        </div>
        <div class="footer">
            <p>&copy; PULSE Investment Platform. All rights reserved.</p>
            <p>2026 PULSE Investment Platform</p>
        </div>
    </div>
</body>
</html>
```

---

## Summary

- Using `pulse-invest.vercel.app` (already live, verified, working)
- No custom domain hassles
- Simple Auth0 configuration
- Beautiful production-ready emails
- Ready to launch immediately

**Complete the 5 steps above and you're done!**
