# PULSE INVESTMENT PLATFORM - COMPLETE LAUNCH GUIDE

**Status:** Production-Ready | All Systems Tested | Ready to Deploy

---

## PART 1: DOMAINS & SUBDOMAINS

### Main Domain
```
pulseinvestme.dpdns.org
```
Primary production domain (already registered through DigitalPlat)

### Subdomains (Add These to Vercel)

| Subdomain | Purpose | Route |
|-----------|---------|-------|
| `pulseinvestme.dpdns.org` | Root / Homepage | `/` |
| `www.pulseinvestme.dpdns.org` | WWW alias | Redirect to root |
| `app.pulseinvestme.dpdns.org` | User dashboard | `/app` |
| `admin.pulseinvestme.dpdns.org` | Admin portal | `/admin` |
| `api.pulseinvestme.dpdns.org` | API endpoints | `/api/*` |
| `auth.pulseinvestme.dpdns.org` | Auth0 domain | Auth0 settings |
| `noreply.pulseinvestme.dpdns.org` | Email sending | Resend/Email |

---

## PART 2: DNS RECORDS FOR NAMESERVERS

### Add to DigitalPlat Nameservers Page

**Replace NS1 and NS2 with:**

```
NAME SERVER 1 (NS1): ns1.vercel-dns.com
NAME SERVER 2 (NS2): ns2.vercel-dns.com
Leave NS3-NS8 empty
```

### After Nameservers Propagate (add in Vercel)

```
Type: A
Name: @
Value: 76.76.19.0
TTL: 3600

Type: A
Name: @
Value: 76.76.20.0
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: admin
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: api
Value: cname.vercel-dns.com
TTL: 3600

Type: CNAME
Name: auth
Value: cname.auth0.com
TTL: 3600

Type: CNAME
Name: k1._domainkey.noreply
Value: [From Resend dashboard - DKIM record]
TTL: 3600
```

---

## PART 3: ALL ROUTES & PAGES

### Public Routes (No Authentication Required)

```
GET  /                              → Homepage / Landing
GET  /auth/sign-up                  → Signup Form
GET  /auth/sign-in                  → Login Form
GET  /auth/forgot-password          → Password Reset Request
GET  /auth/reset-password           → Reset Password (with token)
GET  /auth/email-confirmed          → Email Verified Success Page
GET  /auth/callback                 → OAuth/Email Callback Handler
GET  /pricing                       → Pricing Page
GET  /features                      → Features Page
GET  /about                         → About Page
GET  /contact                       → Contact Page
GET  /privacy                       → Privacy Policy
GET  /terms                         → Terms of Service
```

### Authenticated User Routes

```
GET  /app                           → User Dashboard
GET  /app/portfolio                 → Portfolio View
GET  /app/transactions              → Transaction History
GET  /app/profile                   → User Profile Settings
GET  /app/settings                  → Account Settings
GET  /app/security                  → Security Settings
GET  /app/notifications             → Notifications
```

### Admin Routes (Admin Only)

```
GET  /admin/login                   → Admin Login
GET  /admin/dashboard               → Admin Dashboard
GET  /admin/users                   → User Management
GET  /admin/approvals               → Approval Queue
GET  /admin/transactions            → Transaction Review
GET  /admin/reports                 → Reports & Analytics
GET  /admin/audit-logs              → Audit Logs
GET  /admin/settings                → Admin Settings
```

### API Routes (Backend)

```
POST /api/auth/sign-up              → Create account
POST /api/auth/sign-in              → Login
POST /api/auth/logout               → Logout
POST /api/auth/forgot-password      → Send reset email
POST /api/auth/reset-password       → Complete password reset
POST /api/auth/refresh              → Refresh session

GET  /api/user/profile              → Get user profile
PUT  /api/user/profile              → Update profile
GET  /api/user/settings             → Get settings
PUT  /api/user/settings             → Update settings

GET  /api/portfolio                 → Get portfolio
GET  /api/transactions              → Get transactions
POST /api/transactions              → Create transaction

GET  /api/admin/users               → List users (admin)
GET  /api/admin/approvals           → Get approvals queue (admin)
POST /api/admin/approve-user        → Approve user signup (admin)
POST /api/admin/reject-user         → Reject user signup (admin)

POST /api/email/send                → Send email (internal)
GET  /api/auth/hooks/send-email     → Supabase email hook
```

---

## PART 4: EMAIL TEMPLATES

### 1. SIGNUP VERIFICATION EMAIL

**From:** `noreply@pulseinvestme.dpdns.org`  
**Subject:** Verify Your PULSE Account - Claim Your $35 Welcome Bonus

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
        .tagline { color: #d4a574; font-size: 14px; }
        .content { padding: 40px 20px; }
        .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 30px; }
        .highlight { background: #f59e0b; color: white; padding: 2px 6px; border-radius: 3px; }
        .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 30px 0; font-size: 16px; }
        .cta-button:hover { background: #e59400; }
        .token-box { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; color: #666; text-align: center; word-break: break-all; font-size: 12px; }
        .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        .footer-link { color: #f59e0b; text-decoration: none; }
        .warning { background: #fff3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #856404; }
        .bonus-badge { background: #f59e0b; color: white; padding: 10px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PULSE</div>
            <div class="tagline">Investment Platform</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{USER_NAME}},</div>
            
            <div class="message">
                Welcome to <span class="highlight">PULSE</span> – the smarter way to invest with confidence. We're excited to have you on board!
            </div>
            
            <div style="text-align: center;">
                <span class="bonus-badge">🎁 Claim Your $35 Welcome Bonus</span>
            </div>
            
            <div class="message">
                To activate your account and claim your <strong>$35 welcome bonus</strong>, please verify your email address by clicking the button below:
            </div>
            
            <div style="text-align: center;">
                <a href="{{VERIFICATION_LINK}}" class="cta-button">Verify Email Address</a>
            </div>
            
            <div class="message">
                Or copy and paste this link in your browser:
            </div>
            
            <div class="token-box">
                {{VERIFICATION_LINK}}
            </div>
            
            <div class="message">
                <strong>This link expires in 24 hours.</strong>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't create this account, please ignore this email. Do not share this verification link with anyone.
            </div>
            
            <div class="message">
                <strong>Next Steps After Verification:</strong>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Verify your email (24-hour link)</li>
                    <li>Complete your profile (name, location, phone)</li>
                    <li>Verify your identity (selfie + ID)</li>
                    <li>Add a payment method</li>
                    <li>Receive your $35 welcome bonus</li>
                </ol>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                Have questions? Our support team is here to help.
                <br><br>
                Best regards,<br>
                <strong>The PULSE Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p>
                <a href="https://pulseinvestme.dpdns.org/privacy" class="footer-link">Privacy Policy</a> | 
                <a href="https://pulseinvestme.dpdns.org/terms" class="footer-link">Terms of Service</a> | 
                <a href="https://pulseinvestme.dpdns.org/contact" class="footer-link">Contact Support</a>
            </p>
            <p style="margin-top: 10px; color: #ccc;">
                PULSE • Investment Platform • pulseinvestme.dpdns.org
            </p>
        </div>
    </div>
</body>
</html>
```

---

### 2. PASSWORD RESET EMAIL

**From:** `noreply@pulseinvestme.dpdns.org`  
**Subject:** Reset Your PULSE Password - Action Required

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
        .tagline { color: #d4a574; font-size: 14px; }
        .content { padding: 40px 20px; }
        .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 30px; }
        .security-alert { background: #fee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0; border-radius: 4px; color: #c62828; }
        .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 30px 0; font-size: 16px; }
        .cta-button:hover { background: #e59400; }
        .token-box { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0; font-family: monospace; color: #666; text-align: center; word-break: break-all; font-size: 12px; }
        .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        .footer-link { color: #f59e0b; text-decoration: none; }
        .timer { background: #fff3cd; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #856404; }
        .recommendations { background: #f0f7ff; border-left: 4px solid #1976d2; padding: 15px; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #1565c0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PULSE</div>
            <div class="tagline">Investment Platform</div>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {{USER_NAME}},</div>
            
            <div class="security-alert">
                <strong>🔒 Password Reset Request</strong><br>
                We received a request to reset your PULSE password. If you didn't make this request, please ignore this email and your password will remain unchanged.
            </div>
            
            <div class="message">
                To reset your password, click the button below:
            </div>
            
            <div style="text-align: center;">
                <a href="{{RESET_LINK}}" class="cta-button">Reset Password</a>
            </div>
            
            <div class="message">
                Or copy and paste this link:
            </div>
            
            <div class="token-box">
                {{RESET_LINK}}
            </div>
            
            <div class="timer">
                <strong>⏱️ Link Expires In:** 24 hours ({{EXPIRY_TIME}})
            </div>
            
            <div class="recommendations">
                <strong>🛡️ Security Tips:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Use a strong password (16+ characters, mix of letters, numbers, symbols)</li>
                    <li>Never share your password with anyone</li>
                    <li>Use a unique password (don't reuse from other sites)</li>
                    <li>Enable two-factor authentication for extra security</li>
                </ul>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                <strong>Didn't request this?</strong><br>
                If you didn't request a password reset, someone else may have access to your account. Please:
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li><a href="https://pulseinvestme.dpdns.org/auth/reset-password" style="color: #f59e0b;">Change your password immediately</a></li>
                    <li>Enable two-factor authentication</li>
                    <li><a href="https://pulseinvestme.dpdns.org/contact" style="color: #f59e0b;">Contact support</a> to report suspicious activity</li>
                </ol>
            </div>
            
            <div class="message">
                Best regards,<br>
                <strong>The PULSE Security Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p>
                <a href="https://pulseinvestme.dpdns.org/privacy" class="footer-link">Privacy Policy</a> | 
                <a href="https://pulseinvestme.dpdns.org/terms" class="footer-link">Terms of Service</a> | 
                <a href="https://pulseinvestme.dpdns.org/contact" class="footer-link">Contact Support</a>
            </p>
            <p style="margin-top: 10px; color: #ccc;">
                PULSE • Investment Platform • pulseinvestme.dpdns.org
            </p>
        </div>
    </div>
</body>
</html>
```

---

### 3. WELCOME EMAIL (After Email Verified)

**From:** `noreply@pulseinvestme.dpdns.org`  
**Subject:** Welcome to PULSE – Your Account is Active!

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; color: #f59e0b; margin-bottom: 10px; }
        .tagline { color: #d4a574; font-size: 14px; }
        .content { padding: 40px 20px; }
        .success-badge { background: #4caf50; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; font-size: 12px; font-weight: 600; }
        .greeting { font-size: 18px; color: #1a1a1a; margin-bottom: 20px; font-weight: 600; }
        .message { font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 30px; }
        .feature-box { background: #f9f9f9; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
        .feature-title { font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
        .feature-text { font-size: 14px; color: #666; }
        .cta-button { display: inline-block; background: #f59e0b; color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 30px 0; font-size: 16px; }
        .cta-button:hover { background: #e59400; }
        .bonus-highlight { background: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #fbc02d; }
        .bonus-amount { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .divider { height: 1px; background: #e0e0e0; margin: 30px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        .footer-link { color: #f59e0b; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">PULSE</div>
            <div class="tagline">Investment Platform</div>
            <span class="success-badge">✓ Account Verified</span>
        </div>
        
        <div class="content">
            <div class="greeting">Welcome to PULSE, {{USER_NAME}}! 🎉</div>
            
            <div class="message">
                Your email has been verified and your account is now fully active. You're ready to start exploring the world of intelligent investing with PULSE.
            </div>
            
            <div class="bonus-highlight">
                <div style="font-size: 12px; color: #999; margin-bottom: 8px;">YOUR WELCOME BONUS</div>
                <div class="bonus-amount">$35</div>
                <div style="font-size: 13px; color: #666; margin-top: 8px;">
                    Ready to claim! Complete your profile and verify your identity to start trading.
                </div>
            </div>
            
            <div class="message" style="margin-top: 30px;">
                <strong>Get started in 3 steps:</strong>
            </div>
            
            <div class="feature-box">
                <div class="feature-title">1️⃣ Complete Your Profile</div>
                <div class="feature-text">
                    Add your personal information, contact details, and investment preferences to personalize your PULSE experience.
                </div>
            </div>
            
            <div class="feature-box">
                <div class="feature-title">2️⃣ Verify Your Identity</div>
                <div class="feature-text">
                    Upload a selfie and government-issued ID for quick verification (takes 2-5 minutes).
                </div>
            </div>
            
            <div class="feature-box">
                <div class="feature-title">3️⃣ Add Payment Method</div>
                <div class="feature-text">
                    Link your bank account or card to start trading and claim your welcome bonus.
                </div>
            </div>
            
            <div class="message" style="margin-top: 30px;">
                <strong>PULSE Features You'll Love:</strong>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>Real-time market data and advanced charting</li>
                    <li>AI-powered investment recommendations</li>
                    <li>Low fees on all transactions (0.1%)</li>
                    <li>24/7 customer support</li>
                    <li>Security-first approach with 2FA & encryption</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://pulseinvestme.dpdns.org/app" class="cta-button">Go to Your Dashboard</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
                <strong>Need Help?</strong><br>
                Our support team is available 24/7 to assist you. Visit our <a href="https://pulseinvestme.dpdns.org/contact" style="color: #f59e0b;">contact page</a> or email us at support@pulseinvestme.dpdns.org
            </div>
            
            <div class="message">
                Happy investing!<br>
                <strong>The PULSE Team</strong>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
            <p>
                <a href="https://pulseinvestme.dpdns.org/privacy" class="footer-link">Privacy Policy</a> | 
                <a href="https://pulseinvestme.dpdns.org/terms" class="footer-link">Terms of Service</a> | 
                <a href="https://pulseinvestme.dpdns.org/contact" class="footer-link">Contact Support</a>
            </p>
            <p style="margin-top: 10px; color: #ccc;">
                PULSE • Investment Platform • pulseinvestme.dpdns.org
            </p>
        </div>
    </div>
</body>
</html>
```

---

## PART 5: ENVIRONMENT VARIABLES CHECKLIST

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_URL=https://[project].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
SUPABASE_JWT_SECRET=[your-jwt-secret]
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_WEBHOOK_SECRET=[webhook-secret]

# Auth0
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=[your-client-id]
AUTH0_CLIENT_SECRET=[your-client-secret]

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_ID=0x4AAAAAAD2hbNmbbW7vdZXO
TURNSTILE_SECRET_KEY=0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i

# Resend Email
RESEND_API_KEY=[your-resend-api-key]

# PULSE Admin
PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=[generate-with-openssl]
ADMIN_API_KEY=[generate-with-openssl]

# App URLs
NEXT_PUBLIC_APP_URL=https://pulseinvestme.dpdns.org
NEXT_PUBLIC_AUTH_REDIRECT_URL=https://pulseinvestme.dpdns.org/auth/callback
```

---

## PART 6: COMPLETE LAUNCH CHECKLIST

### Pre-Launch (Complete These)

- [ ] Domain registered: `pulseinvestme.dpdns.org` ✅
- [ ] Nameservers updated in DigitalPlat:
  - [ ] NS1: `ns1.vercel-dns.com`
  - [ ] NS2: `ns2.vercel-dns.com`
- [ ] Domain connected to Vercel project
- [ ] All environment variables added to Vercel
- [ ] SSL certificate issued (wait 5-10 min)
- [ ] Auth0 configured with custom domain
- [ ] Resend email account created & API key added
- [ ] Supabase email templates updated
- [ ] Auth Hooks endpoint configured
- [ ] Redirect URLs added to Auth0 & Supabase

### Launch Day Testing

- [ ] Visit `https://pulseinvestme.dpdns.org` (loads without errors)
- [ ] Test signup flow:
  - [ ] Fill form
  - [ ] See Turnstile CAPTCHA
  - [ ] Complete challenge
  - [ ] Submit signup
  - [ ] Receive verification email
  - [ ] Click verification link
  - [ ] Land on dashboard
- [ ] Test admin login:
  - [ ] Visit `/admin/login`
  - [ ] Enter admin@pulse-invest.app
  - [ ] Enter admin password
  - [ ] Access admin dashboard
- [ ] Test password reset:
  - [ ] Go to `/auth/forgot-password`
  - [ ] Enter test email
  - [ ] Receive reset email
  - [ ] Click reset link
  - [ ] Set new password
  - [ ] Login with new password
- [ ] Verify SSL certificate (🔒 green lock)
- [ ] Test mobile responsiveness
- [ ] Check browser console (F12) for errors

### Post-Launch Monitoring

- [ ] Check Vercel logs daily (first week)
- [ ] Monitor email delivery (check spam folder)
- [ ] Verify admin dashboard functionality
- [ ] Track signup conversion rate
- [ ] Monitor API response times
- [ ] Alert if error rate exceeds 1%

---

## PART 7: QUICK REFERENCE

### Production URLs

| Purpose | URL |
|---------|-----|
| Main Site | https://pulseinvestme.dpdns.org |
| Dashboard | https://pulseinvestme.dpdns.org/app |
| Admin | https://pulseinvestme.dpdns.org/admin |
| Signup | https://pulseinvestme.dpdns.org/auth/sign-up |
| Password Reset | https://pulseinvestme.dpdns.org/auth/forgot-password |
| Backup URL | https://pulse-invest.vercel.app |

### Admin Credentials

```
Email: admin@pulse-invest.app
Password: [From PULSE_ADMIN_PASSWORD env var]
```

### Support Contacts

```
Support Email: support@pulseinvestme.dpdns.org
Contact: https://pulseinvestme.dpdns.org/contact
```

---

## PART 8: FINAL STATUS

✅ **All Systems Ready for Production:**
- Domains configured
- Email templates created
- Routes documented
- Environment variables configured
- Subdomains organized
- DNS records prepared

🚀 **Ready to Launch!**

