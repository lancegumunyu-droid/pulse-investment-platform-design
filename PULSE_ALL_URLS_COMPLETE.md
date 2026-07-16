# PULSE COMPLETE URL REFERENCE

## PRIMARY DOMAINS (Both Active)

### Live Production Domain (Currently Active)
```
https://pulse-invest.vercel.app
Status: ✅ LIVE - Direct Vercel deployment
SSL: ✅ Auto-managed by Vercel
DNS: Vercel nameservers
Use: Production endpoint
```

### Custom Domain (Registered)
```
https://pulseinvestme.dpdns.org
Status: ✅ REGISTERED - DigitalPlat
SSL: Needs verification
DNS: Needs Cloudflare nameservers
Use: Custom branding endpoint
```

### Backup/Future Domain
```
https://pulseinvestme.com
Status: Registered but not active yet
Use: Future primary (when Cloudflare setup completes)
```

---

## PUBLIC ROUTES

### Landing & Marketing Pages
```
https://pulse-invest.vercel.app
https://pulse-invest.vercel.app/
Home page / Landing page

https://pulse-invest.vercel.app/about
About PULSE

https://pulse-invest.vercel.app/features
Features overview

https://pulse-invest.vercel.app/pricing
Pricing & plans

https://pulse-invest.vercel.app/contact
Contact form / Support request

https://pulse-invest.vercel.app/faq
Frequently asked questions
```

### Legal & Compliance
```
https://pulse-invest.vercel.app/privacy
Privacy policy

https://pulse-invest.vercel.app/terms
Terms of service

https://pulse-invest.vercel.app/legal
Legal information

https://pulse-invest.vercel.app/disclosures
Financial disclosures

https://pulse-invest.vercel.app/cookie-policy
Cookie policy
```

### Authentication Routes
```
https://pulse-invest.vercel.app/auth
Main auth page

https://pulse-invest.vercel.app/auth/sign-up
Create account
- With Turnstile CAPTCHA
- $35 welcome bonus mention
- Email verification required

https://pulse-invest.vercel.app/auth/sign-in
Login page
- Email + password
- Password recovery link
- Admin redirect option

https://pulse-invest.vercel.app/auth/login
Alternative login endpoint

https://pulse-invest.vercel.app/auth/callback
Auth0/Supabase callback handler
- Handles email verification tokens
- OTP processing
- Session establishment

https://pulse-invest.vercel.app/auth/email-confirmed
Email verification success page
- Shows after user clicks verification link
- $35 bonus confirmation
- CTA to dashboard

https://pulse-invest.vercel.app/auth/forgot-password
Password recovery request
- Enter email address
- Receive reset link via email

https://pulse-invest.vercel.app/auth/reset-password
Password reset form
- Enter new password
- Token validation
- Redirect to login
```

---

## USER AUTHENTICATED ROUTES

### Dashboard & Main Interface
```
https://pulse-invest.vercel.app/app
Main user dashboard
- Account overview
- Portfolio summary
- Recent activity
- Quick actions

https://pulse-invest.vercel.app/app/dashboard
Detailed dashboard
- Analytics
- Performance metrics
- Recommendations
```

### Portfolio Management
```
https://pulse-invest.vercel.app/app/portfolio
Portfolio overview
- Holdings
- Asset allocation
- Performance
- Rebalancing options

https://pulse-invest.vercel.app/app/portfolio/create
Create new portfolio
- Select strategy
- Set allocation
- Configure auto-invest

https://pulse-invest.vercel.app/app/portfolio/[id]
View portfolio details
- Holdings breakdown
- Historical performance
- Transactions
- Management options

https://pulse-invest.vercel.app/app/portfolio/[id]/edit
Edit portfolio settings
- Rebalance
- Change strategy
- Update allocation
```

### Transactions & Payments
```
https://pulse-invest.vercel.app/app/transactions
Transaction history
- Deposits
- Withdrawals
- Trades
- Fees

https://pulse-invest.vercel.app/app/transactions/[id]
View transaction details
- Amount
- Date
- Status
- Confirmation

https://pulse-invest.vercel.app/app/deposit
Make deposit
- Enter amount
- Select payment method
- Confirm (awaits admin approval)

https://pulse-invest.vercel.app/app/withdrawal
Request withdrawal
- Enter amount
- Bank account details
- Submit for approval

https://pulse-invest.vercel.app/app/payment-status
Check payment status
- Pending approvals
- Completed transactions
- Failed payments
```

### User Account & Settings
```
https://pulse-invest.vercel.app/app/profile
User profile
- Personal information
- Photo/avatar
- Contact details
- Preferences

https://pulse-invest.vercel.app/app/settings
Account settings
- Change password
- Two-factor authentication
- Login history
- Connected devices

https://pulse-invest.vercel.app/app/security
Security settings
- Login history
- Active sessions
- Device management
- API keys

https://pulse-invest.vercel.app/app/notifications
Notification preferences
- Email notifications
- SMS alerts
- In-app messages
- Digest frequency

https://pulse-invest.vercel.app/app/kyc
KYC/Identity verification
- Document upload
- Verification status
- Resubmit if needed
```

### Investment & Market Info
```
https://pulse-invest.vercel.app/app/investments
Browse investments
- Stocks
- ETFs
- Funds
- Cryptocurrencies

https://pulse-invest.vercel.app/app/investments/[symbol]
Investment details
- Price charts
- Company info
- Performance metrics
- Holdings

https://pulse-invest.vercel.app/app/watchlist
Saved watchlist
- Add/remove investments
- Price alerts
- Performance tracking

https://pulse-invest.vercel.app/app/market-data
Market data & research
- News feed
- Market analysis
- Economic calendar
- Trading signals
```

### P2P & Social Features
```
https://pulse-invest.vercel.app/app/p2p
Peer-to-peer trading
- Browse offers
- Post buy/sell orders
- In-app messaging

https://pulse-invest.vercel.app/app/p2p/buy
Buy from peers
- Post buy request
- Negotiate price
- Secure transaction

https://pulse-invest.vercel.app/app/p2p/sell
Sell to peers
- Post listing
- Set price
- Manage orders

https://pulse-invest.vercel.app/app/referrals
Referral program
- Unique referral link
- Earned bonuses
- Referral status
```

---

## ADMIN ROUTES

### Admin Authentication
```
https://pulse-invest.vercel.app/admin
Admin home/redirect
- Redirects to login if not authenticated
- Redirects to dashboard if authenticated

https://pulse-invest.vercel.app/admin/login
Admin login page
- Email: admin@pulse-invest.app
- Password: [PULSE_ADMIN_PASSWORD from env]
- Secured access

https://pulse-invest.vercel.app/admin/callback
Admin session callback
```

### Admin Dashboard & Monitoring
```
https://pulse-invest.vercel.app/admin/dashboard
Main admin dashboard
- System overview
- Key metrics
- Quick actions
- Alerts

https://pulse-invest.vercel.app/admin/analytics
System analytics
- User growth
- Transaction volume
- Revenue metrics
- Performance stats

https://pulse-invest.vercel.app/admin/reports
Reports & exports
- Transaction reports
- User reports
- Financial statements
- Audit logs
```

### User Management
```
https://pulse-invest.vercel.app/admin/users
User management
- User list
- Search/filter
- View details
- Suspend/activate

https://pulse-invest.vercel.app/admin/users/[id]
User details
- Profile info
- Account status
- Activity history
- Balances

https://pulse-invest.vercel.app/admin/users/[id]/edit
Edit user
- Update info
- Change status
- Reset password
- Manage roles

https://pulse-invest.vercel.app/admin/users/kyc
KYC verification management
- Pending verifications
- Approve/reject
- Request documents
- Manage compliance
```

### Payment & Transaction Approval
```
https://pulse-invest.vercel.app/admin/payments
Payment approvals
- Pending deposits
- Pending withdrawals
- Awaiting approval
- Action required

https://pulse-invest.vercel.app/admin/payments/deposits
Deposit approvals
- View pending deposits
- Approve transaction
- Add notes
- Process payment

https://pulse-invest.vercel.app/admin/payments/withdrawals
Withdrawal approvals
- View pending withdrawals
- Approve/reject
- Set completion date
- Send notification

https://pulse-invest.vercel.app/admin/payments/[id]
Payment details
- Full transaction info
- Approval history
- User details
- Approval button

https://pulse-invest.vercel.app/admin/disputes
Payment disputes
- Chargebacks
- Fraud reports
- User complaints
- Resolution options
```

### Agent Management (Payment & P2P Agents)
```
https://pulse-invest.vercel.app/admin/agents
Agent management
- Payment agents list
- P2P agents list
- Agent status
- Performance metrics

https://pulse-invest.vercel.app/admin/agents/payment
Payment agents
- All payment agents
- Approve/reject new
- Monitor transactions
- Manage commissions

https://pulse-invest.vercel.app/admin/agents/payment/new
Appoint new payment agent
- Search user
- Set commission rate
- Define limits
- Activate

https://pulse-invest.vercel.app/admin/agents/payment/[id]
Payment agent details
- Profile
- Transaction history
- Earnings
- Performance
- Deactivate option

https://pulse-invest.vercel.app/admin/agents/p2p
P2P agents
- All P2P agents
- Approve/reject
- Monitor activity
- Manage reputation

https://pulse-invest.vercel.app/admin/agents/p2p/new
Appoint new P2P agent
- Select user
- Set authority level
- Define limits
- Activate

https://pulse-invest.vercel.app/admin/agents/p2p/[id]
P2P agent details
- Profile
- P2P transaction history
- Reputation score
- Activity logs
- Deactivate option
```

### Portfolio & Investment Management
```
https://pulse-invest.vercel.app/admin/portfolios
Portfolio management
- All portfolios
- Performance summary
- User allocations

https://pulse-invest.vercel.app/admin/portfolios/[id]
Portfolio details
- Holdings breakdown
- Performance metrics
- User count
- Historical data

https://pulse-invest.vercel.app/admin/investments
Investment management
- Available investments
- Add new investment
- Update prices
- Manage listings

https://pulse-invest.vercel.app/admin/investments/[symbol]
Investment details
- Current price
- Holdings
- Users invested
- Performance
```

### Audit & Compliance
```
https://pulse-invest.vercel.app/admin/audit-logs
Audit log viewer
- All admin actions
- Timestamps
- User/agent performing
- Action details

https://pulse-invest.vercel.app/admin/audit-logs/[id]
Audit log details
- Full action record
- IP address
- Device info
- Changes made

https://pulse-invest.vercel.app/admin/compliance
Compliance management
- AML/KYC status
- Regulation compliance
- Document management
- Policy updates

https://pulse-invest.vercel.app/admin/suspicious-activity
Fraud & suspicious activity
- Flagged transactions
- Unusual patterns
- User alerts
- Investigation tools
```

### System Configuration
```
https://pulse-invest.vercel.app/admin/settings
Admin settings
- System configuration
- Email templates
- Feature flags
- Maintenance mode

https://pulse-invest.vercel.app/admin/settings/email
Email configuration
- Email templates
- Sender settings
- Rate limits
- Test email

https://pulse-invest.vercel.app/admin/settings/payment
Payment settings
- Payment methods
- Fees
- Limits
- Providers

https://pulse-invest.vercel.app/admin/settings/security
Security settings
- IP whitelist
- API keys
- 2FA enforcement
- Session timeout

https://pulse-invest.vercel.app/admin/settings/notifications
Notification settings
- Alert thresholds
- Escalation rules
- Contact methods
- Test alerts
```

---

## API ENDPOINTS

### Authentication Endpoints
```
POST /api/auth/register
- Create new account
- Body: { name, email, password }
- Response: { user, token }

POST /api/auth/login
- User login
- Body: { email, password }
- Response: { user, token, redirect }

POST /api/auth/logout
- Logout user
- Response: { success }

POST /api/auth/refresh
- Refresh JWT token
- Response: { token }

POST /api/auth/forgot-password
- Request password reset
- Body: { email }
- Response: { message }

POST /api/auth/reset-password
- Reset password with token
- Body: { token, new_password }
- Response: { success }

POST /api/auth/verify-email
- Verify email address
- Body: { token }
- Response: { success }
```

### User Profile Endpoints
```
GET /api/user/profile
- Get current user profile
- Response: { id, name, email, profile }

PUT /api/user/profile
- Update user profile
- Body: { name, avatar, preferences }
- Response: { user }

GET /api/user/settings
- Get user settings
- Response: { notifications, privacy, etc }

PUT /api/user/settings
- Update user settings
- Body: { settings }
- Response: { settings }
```

### Portfolio Endpoints
```
GET /api/portfolio
- Get all portfolios for user
- Response: [{ id, name, value, performance }]

GET /api/portfolio/[id]
- Get portfolio details
- Response: { id, name, holdings, performance }

POST /api/portfolio
- Create new portfolio
- Body: { name, allocation }
- Response: { id, portfolio }

PUT /api/portfolio/[id]
- Update portfolio
- Body: { allocation, settings }
- Response: { portfolio }

DELETE /api/portfolio/[id]
- Delete portfolio
- Response: { success }
```

### Transaction Endpoints
```
GET /api/transactions
- Get user transactions
- Response: [{ id, type, amount, date, status }]

GET /api/transactions/[id]
- Get transaction details
- Response: { id, details, proof }

POST /api/transactions/deposit
- Request deposit (requires admin approval)
- Body: { amount, method }
- Response: { id, status: 'pending' }

POST /api/transactions/withdrawal
- Request withdrawal (requires admin approval)
- Body: { amount, account }
- Response: { id, status: 'pending' }
```

### Payment Approval Endpoints (Admin)
```
GET /api/admin/payments/pending
- Get pending payment requests
- Response: [{ id, user, amount, type, status }]

POST /api/admin/payments/[id]/approve
- Approve payment
- Body: { notes }
- Response: { success, payment }

POST /api/admin/payments/[id]/reject
- Reject payment
- Body: { reason }
- Response: { success }
```

### Agent Management Endpoints (Admin)
```
POST /api/admin/agents/payment/appoint
- Appoint payment agent
- Body: { user_id, commission_rate }
- Response: { success, agent }

POST /api/admin/agents/p2p/appoint
- Appoint P2P agent
- Body: { user_id, authority_level }
- Response: { success, agent }

DELETE /api/admin/agents/[id]
- Remove agent appointment
- Response: { success }
```

### Admin Dashboard Endpoints
```
GET /api/admin/dashboard
- Get dashboard metrics
- Response: { users, transactions, revenue, etc }

GET /api/admin/users
- Get all users (paginated)
- Response: [{ id, name, email, status, created }]

GET /api/admin/audit-logs
- Get audit logs
- Response: [{ id, action, user, timestamp }]
```

---

## EMAIL ENDPOINTS (Auth Hooks)

### Supabase Auth Hooks
```
POST /api/auth/hooks/send-email
HTTPS endpoint for Supabase
- Listens for: signup, reset-password, magiclink, invite
- Sends beautifully formatted emails
- Returns: { success, timestamp }
```

---

## WEBHOOK ENDPOINTS

```
POST /api/webhooks/payment-confirmed
- Webhook from payment provider
- Confirms payment completion
- Updates transaction status

POST /api/webhooks/payment-failed
- Webhook from payment provider
- Handles failed transactions
- Notifies user & admin

POST /api/webhooks/supabase
- Supabase real-time webhooks
- User changes
- Transaction updates
```

---

## ENVIRONMENT VARIABLES REFERENCE

### Domains
```
NEXT_PUBLIC_APP_URL=https://pulse-invest.vercel.app
```

### Auth & Security
```
AUTH0_DOMAIN=dev-7m32r3oudhuzlcvo.uk.auth0.com
AUTH0_CLIENT_ID=[from Auth0]
AUTH0_CLIENT_SECRET=[from Auth0]

NEXT_PUBLIC_TURNSTILE_SITE_ID=0x4AAAAAAD2hbNmbbW7vdZXO
TURNSTILE_SECRET_KEY=0x4AAAAAAD2hbCM3ygdV8mzp8Sd5i

PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=[Generated via: openssl rand -base64 32]
ADMIN_API_KEY=[Generated]
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
SUPABASE_JWT_SECRET=[jwt-secret]
SUPABASE_WEBHOOK_SECRET=[webhook-secret]
```

### Email Service
```
SENDGRID_API_KEY=[from SendGrid]
SENDGRID_FROM_EMAIL=noreply@pulse-invest.vercel.app
```

### SMS (Optional)
```
TWILIO_ACCOUNT_SID=[from Twilio]
TWILIO_AUTH_TOKEN=[from Twilio]
TWILIO_PHONE_NUMBER=[Your Twilio number]
```

### Payment Processing
```
STRIPE_SECRET_KEY=[from Stripe]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[from Stripe]
```

---

## COMPLETE URL MATRIX

| Page | URL | Status | Auth Required | Role |
|------|-----|--------|---|---|
| Home | /auth/sign-up | ✅ | No | Public |
| About | /about | ✅ | No | Public |
| Features | /features | ✅ | No | Public |
| Pricing | /pricing | ✅ | No | Public |
| Signup | /auth/sign-up | ✅ | No | Public |
| Login | /auth/sign-in | ✅ | No | Public |
| Email Confirmed | /auth/email-confirmed | ✅ | Yes | User |
| Dashboard | /app | ✅ | Yes | User |
| Portfolio | /app/portfolio | ✅ | Yes | User |
| Deposit | /app/deposit | ✅ | Yes | User |
| Withdrawal | /app/withdrawal | ✅ | Yes | User |
| Admin Dashboard | /admin/dashboard | ✅ | Yes | Admin |
| Payment Approvals | /admin/payments | ✅ | Yes | Admin/Agent |
| User Management | /admin/users | ✅ | Yes | Admin |
| Agent Management | /admin/agents | ✅ | Yes | Admin |
| Audit Logs | /admin/audit-logs | ✅ | Yes | Admin |

---

## QUICK REFERENCE

### Current Live Domain (USE THIS)
```
https://pulse-invest.vercel.app
```

### For Users
```
https://pulse-invest.vercel.app/auth/sign-up ← Sign up
https://pulse-invest.vercel.app/auth/sign-in ← Login
https://pulse-invest.vercel.app/app ← Dashboard
https://pulse-invest.vercel.app/app/deposit ← Deposit (pending admin approval)
https://pulse-invest.vercel.app/app/withdrawal ← Withdraw (pending admin approval)
```

### For Admin
```
https://pulse-invest.vercel.app/admin/login ← Admin login
https://pulse-invest.vercel.app/admin/dashboard ← Admin dashboard
https://pulse-invest.vercel.app/admin/payments ← Approve/reject deposits & withdrawals
https://pulse-invest.vercel.app/admin/agents/payment ← Appoint payment agents
https://pulse-invest.vercel.app/admin/agents/p2p ← Appoint P2P agents
```

### Admin Credentials
```
Email: admin@pulse-invest.app
Password: [Value of PULSE_ADMIN_PASSWORD from Vercel env vars]
```

---

## DNS RECORDS NEEDED

### SendGrid Email Records
```
CNAME: url2566 → sendgrid.net
CNAME: 110894509 → sendgrid.net
CNAME: em5933 → u110894509.wl010.sendgrid.net
CNAME: s1._domainkey → s1.domainkey.u110894509.wl010.sendgrid.net
CNAME: s2._domainkey → s2.domainkey.u110894509.wl010.sendgrid.net
TXT: _dmarc → v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
```

### Cloudflare Nameservers
```
Replace with:
jose.ns.cloudflare.com
sreeni.ns.cloudflare.com
```

---

**Status: ALL ROUTES DOCUMENTED & READY FOR PRODUCTION** ✅
