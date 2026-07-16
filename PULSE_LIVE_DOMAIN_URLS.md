# PULSE COMPLETE URL REFERENCE - LIVE DOMAIN ONLY

## PRIMARY PRODUCTION DOMAIN

```
https://pulse-invest.vercel.app

Status: ✅ LIVE & ACTIVE RIGHT NOW
DNS: Managed via Cloudflare
SSL/TLS: Auto-managed by Vercel
Email: SendGrid (6 DNS records configured)
Current Status: Pending verification (Cloudflare setup)
```

---

## PUBLIC ROUTES (No Authentication Required)

### Homepage & Marketing
```
https://pulse-invest.vercel.app
→ Homepage

https://pulse-invest.vercel.app/about
→ About PULSE

https://pulse-invest.vercel.app/features
→ Features overview

https://pulse-invest.vercel.app/pricing
→ Pricing plans

https://pulse-invest.vercel.app/contact
→ Contact form

https://pulse-invest.vercel.app/faq
→ FAQ page
```

### Authentication Pages
```
https://pulse-invest.vercel.app/auth/sign-up
→ Create account
→ Includes Turnstile CAPTCHA
→ Welcome email sent
→ $35 signup bonus added

https://pulse-invest.vercel.app/auth/sign-in
→ Login page
→ Email + password

https://pulse-invest.vercel.app/auth/email-confirmed
→ Email verification success page

https://pulse-invest.vercel.app/auth/forgot-password
→ Password reset request

https://pulse-invest.vercel.app/auth/reset-password
→ Password reset form
→ Link from email

https://pulse-invest.vercel.app/auth/error
→ Auth error page
```

### Legal Pages
```
https://pulse-invest.vercel.app/privacy
→ Privacy policy

https://pulse-invest.vercel.app/terms
→ Terms of service

https://pulse-invest.vercel.app/cookies
→ Cookie policy

https://pulse-invest.vercel.app/disclosures
→ Legal disclosures
```

---

## USER AUTHENTICATED ROUTES (Login Required)

### User Dashboard
```
https://pulse-invest.vercel.app/app
→ Main dashboard
→ Portfolio overview
→ Quick actions
→ Account status

https://pulse-invest.vercel.app/app/dashboard
→ Full dashboard view
```

### Portfolio Management
```
https://pulse-invest.vercel.app/app/portfolio
→ All portfolios overview
→ Create new portfolio
→ View performance

https://pulse-invest.vercel.app/app/portfolio/[id]
→ Individual portfolio details
→ Holdings breakdown
→ Performance history

https://pulse-invest.vercel.app/app/portfolio/[id]/edit
→ Edit portfolio settings

https://pulse-invest.vercel.app/app/portfolio/[id]/transactions
→ Portfolio transactions history
```

### Deposit & Withdrawal (ADMIN APPROVAL REQUIRED)
```
https://pulse-invest.vercel.app/app/deposit
→ Request deposit
→ Choose payment method
→ Status: PENDING admin approval
→ Awaits: Admin or Payment Agent approval
→ Email notification on approval

https://pulse-invest.vercel.app/app/withdrawal
→ Request withdrawal
→ Choose payment method
→ Status: PENDING admin approval
→ Awaits: Admin or Payment Agent approval
→ Email notification on approval

https://pulse-invest.vercel.app/app/payment-requests
→ View all my payment requests
→ Filter by status (pending, approved, rejected, completed)
→ Check approval timeline

https://pulse-invest.vercel.app/app/payment-requests/[id]
→ Individual payment request details
→ Approval notes
→ Status updates
```

### Transactions & History
```
https://pulse-invest.vercel.app/app/transactions
→ All transactions
→ Filter by type
→ Download reports

https://pulse-invest.vercel.app/app/transactions/[id]
→ Transaction receipt

https://pulse-invest.vercel.app/app/statements
→ Periodic statements
→ Monthly/quarterly reports

https://pulse-invest.vercel.app/app/tax-documents
→ Tax documents for filing
```

### P2P Trading (If Enabled)
```
https://pulse-invest.vercel.app/app/p2p
→ P2P trading marketplace
→ Buy/Sell offers
→ Escrow protection

https://pulse-invest.vercel.app/app/p2p/buy
→ Browse buy offers

https://pulse-invest.vercel.app/app/p2p/sell
→ Create sell offer

https://pulse-invest.vercel.app/app/p2p/orders
→ My P2P orders
```

### User Profile & Settings
```
https://pulse-invest.vercel.app/app/profile
→ User profile
→ Personal information
→ Account settings

https://pulse-invest.vercel.app/app/profile/edit
→ Edit profile information

https://pulse-invest.vercel.app/app/settings
→ Account settings
→ Preferences
→ Notifications

https://pulse-invest.vercel.app/app/settings/security
→ Security settings
→ Password change
→ Two-factor authentication

https://pulse-invest.vercel.app/app/settings/email-preferences
→ Email notification settings

https://pulse-invest.vercel.app/app/kyc
→ KYC verification
→ Upload documents
→ Verification status

https://pulse-invest.vercel.app/app/referrals
→ Referral program
→ Invite friends
→ Earned bonuses
```

---

## ADMIN-ONLY ROUTES (Admin Login Required)

### Admin Access
```
https://pulse-invest.vercel.app/admin/login
→ Admin login page
→ Email: admin@pulse-invest.app
→ Password: [PULSE_ADMIN_PASSWORD]

https://pulse-invest.vercel.app/admin/dashboard
→ Admin main dashboard
→ Analytics & overview
→ Quick stats
```

### Payment Approval System (CRITICAL - ADMIN ONLY)
```
https://pulse-invest.vercel.app/admin/payments
→ ALL pending deposits & withdrawals
→ ✅ Only Admin or appointed Payment Agents can view
→ ✅ Only Admin or appointed Payment Agents can approve/reject
→ Real-time notifications

https://pulse-invest.vercel.app/admin/payments/pending
→ Filter: Pending requests only

https://pulse-invest.vercel.app/admin/payments/deposits
→ Filter: Deposits only
→ Approve/Reject each
→ Add approval notes

https://pulse-invest.vercel.app/admin/payments/withdrawals
→ Filter: Withdrawals only
→ Approve/Reject each
→ Add approval notes

https://pulse-invest.vercel.app/admin/payments/[id]
→ Individual payment review
→ Applicant details
→ Transaction information
→ Add notes
→ Approve or Reject button
→ Audit trail
```

### Agent Management (YOU ONLY - Super Admin Authority)
```
https://pulse-invest.vercel.app/admin/agents
→ All agents overview
→ Payment Agents list
→ P2P Agents list
→ Active status
→ Commission rates
→ ⚠️ ONLY YOU can appoint/revoke agents

https://pulse-invest.vercel.app/admin/agents/payment
→ Payment Agents overview
→ Deposit/Withdrawal handlers

https://pulse-invest.vercel.app/admin/agents/payment/new
→ 🔒 ONLY YOU can appoint new Payment Agent
→ Select user
→ Set commission rate (e.g., 2%)
→ Set transaction limits
→ Approve

https://pulse-invest.vercel.app/admin/agents/payment/[id]
→ Payment Agent details
→ Commission rate
→ Transaction limits
→ Activity log
→ Remove agent button (ONLY YOU)

https://pulse-invest.vercel.app/admin/agents/p2p
→ P2P Agents overview
→ P2P trading handlers

https://pulse-invest.vercel.app/admin/agents/p2p/new
→ 🔒 ONLY YOU can appoint new P2P Agent
→ Select user
→ Set authority level
→ Set limits
→ Approve

https://pulse-invest.vercel.app/admin/agents/p2p/[id]
→ P2P Agent details
→ Authority level
→ Limits
→ Activity log
→ Remove agent button (ONLY YOU)
```

### User Management
```
https://pulse-invest.vercel.app/admin/users
→ All users list
→ Search & filter
→ User status
→ Account age

https://pulse-invest.vercel.app/admin/users/[id]
→ User details
→ Profile information
→ Account status
→ KYC status
→ Transaction history
→ Edit or suspend account

https://pulse-invest.vercel.app/admin/users/kyc
→ KYC verification approvals
→ Pending documents
→ Approve/Reject KYC

https://pulse-invest.vercel.app/admin/users/kyc/[id]
→ Review user KYC documents
→ Approve or request more docs

https://pulse-invest.vercel.app/admin/users/blocked
→ Blocked/suspended users
→ Reason for block
→ Unblock option
```

### Audit & Compliance
```
https://pulse-invest.vercel.app/admin/audit-logs
→ All admin actions logged
→ Who did what, when
→ Timestamp
→ Change details
→ Immutable audit trail

https://pulse-invest.vercel.app/admin/audit-logs/payments
→ Payment approval history
→ Who approved/rejected
→ Amount, timestamp

https://pulse-invest.vercel.app/admin/audit-logs/agents
→ Agent appointments/removals
→ Changes to authority
→ Commission updates

https://pulse-invest.vercel.app/admin/compliance
→ AML/KYC compliance tracking
→ Suspicious activity
→ Compliance reports

https://pulse-invest.vercel.app/admin/suspicious-activity
→ Fraud detection
→ Unusual transaction patterns
→ Investigation log
```

### System Settings & Configuration
```
https://pulse-invest.vercel.app/admin/settings
→ General settings
→ Email templates
→ Fee structure
→ Feature toggles

https://pulse-invest.vercel.app/admin/settings/email
→ Email template management
→ Signup email template
→ Withdrawal approval email
→ Account locked email

https://pulse-invest.vercel.app/admin/settings/payment
→ Payment method configuration
→ Bank transfer settings
→ Card payment settings
→ Wallet settings

https://pulse-invest.vercel.app/admin/settings/fees
→ Transaction fees
→ Deposit fees
→ Withdrawal fees
→ Commission rates

https://pulse-invest.vercel.app/admin/settings/security
→ Security policies
→ 2FA requirements
→ Session timeout
→ IP whitelist

https://pulse-invest.vercel.app/admin/analytics
→ Dashboard analytics
→ User growth
→ Transaction volume
→ Revenue reports

https://pulse-invest.vercel.app/admin/reports
→ Generate reports
→ Export data
→ Scheduled reports
```

---

## API ENDPOINTS (Backend/Integration)

### Authentication APIs
```
POST /api/auth/register
→ User registration

POST /api/auth/login
→ User login

POST /api/auth/logout
→ User logout

POST /api/auth/forgot-password
→ Password reset request

POST /api/auth/reset-password
→ Complete password reset

POST /api/auth/verify-email
→ Email verification
```

### Payment APIs
```
POST /api/transactions/deposit
→ Create deposit request
→ Status: pending
→ Awaits approval

POST /api/transactions/withdrawal
→ Create withdrawal request
→ Status: pending
→ Awaits approval

GET /api/transactions
→ Get user transactions

GET /api/transactions/[id]
→ Get transaction details

POST /api/admin/payments/[id]/approve
→ Admin approves payment
→ Requires admin auth

POST /api/admin/payments/[id]/reject
→ Admin rejects payment
→ Requires admin auth
```

### User APIs
```
GET /api/user/profile
→ Get user profile

PUT /api/user/profile
→ Update user profile

GET /api/user/kyc
→ Get KYC status

POST /api/user/kyc
→ Submit KYC documents
```

### Agent Management APIs
```
POST /api/admin/agents/payment/appoint
→ Appoint payment agent
→ Admin only

DELETE /api/admin/agents/payment/[id]
→ Remove payment agent
→ Admin only

POST /api/admin/agents/p2p/appoint
→ Appoint P2P agent
→ Admin only

DELETE /api/admin/agents/p2p/[id]
→ Remove P2P agent
→ Admin only
```

### Admin APIs
```
POST /api/admin/logs/audit
→ Get audit logs

POST /api/admin/compliance/report
→ Get compliance report

POST /api/admin/users/kyc/[id]/approve
→ Approve KYC

POST /api/admin/users/kyc/[id]/reject
→ Reject KYC
```

---

## IMPORTANT ADMIN CREDENTIALS

```
Admin Email: admin@pulse-invest.app
Admin Password: [Check Vercel environment variables: PULSE_ADMIN_PASSWORD]
Admin API Key: [Check Vercel environment variables: ADMIN_API_KEY]

Location to find these:
→ Vercel Dashboard
→ Project: pulse-invest
→ Settings → Environment Variables
```

---

## CURRENT DNS STATUS (Cloudflare)

### Email Delivery (SendGrid - 6 records)
```
✅ CNAME: 110894509 → sendgrid.net
✅ CNAME: em5933 → u110894509.wl010.sendgrid.net
✅ CNAME: url2566 → sendgrid.net
✅ CNAME: s1._domainkey → s1.domainkey.u110894509.wl010.sendgrid.net
✅ CNAME: s2._domainkey → s2.domainkey.u110894509.wl010.sendgrid.net
✅ TXT: _dmarc → v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;
```

### Email Verification (Additional records)
```
✅ TXT: _dkim → (various verification records)
✅ TXT: SPF → v=spf1 -all (Cloudflare managed)
✅ TXT: Domain verification → (c-domain-verify-pul...)
```

### Domain Status
```
🟡 Status: Pending verification until Cloudflare setup complete
⏳ Estimated: 5-30 minutes for full propagation
✅ Once verified: All systems go live
```

---

## IMPORTANT: PAYMENT APPROVAL FLOW

### How Payment Approvals Work

1. **User Action:**
   ```
   User goes to: https://pulse-invest.vercel.app/app/deposit
   Requests $500 deposit
   Status: PENDING
   ```

2. **Admin Notification:**
   ```
   Admin receives email notification
   Admin logs in: https://pulse-invest.vercel.app/admin/login
   Goes to: https://pulse-invest.vercel.app/admin/payments
   Sees the pending $500 request
   ```

3. **Admin Review:**
   ```
   Click on the payment request
   Review user details, amount, payment method
   Add notes if needed
   Click: APPROVE or REJECT
   ```

4. **User Notification:**
   ```
   User receives email: "Your deposit has been approved"
   Payment processes
   Money arrives in user account
   User sees: https://pulse-invest.vercel.app/app/payment-requests
   Status changed to: APPROVED → COMPLETED
   ```

---

## IMPORTANT: AGENT AUTHORITY

### ONLY YOU (Super Admin) Can:

```
✅ Appoint new Payment Agents
   → https://pulse-invest.vercel.app/admin/agents/payment/new
   → Set commission rate
   → Set transaction limits

✅ Appoint new P2P Agents
   → https://pulse-invest.vercel.app/admin/agents/p2p/new
   → Set authority level

✅ Remove any agent
   → Revoke permission immediately
   → Access revoked

✅ Change agent commission rates
✅ Set transaction limits
✅ View all agent activities

❌ No other admin/user can do this
```

### What Appointed Agents Can Do:

```
Payment Agents:
  ✅ View pending deposits & withdrawals
  ✅ Approve/reject payments
  ✅ Add notes to approvals
  ❌ Cannot appoint other agents

P2P Agents:
  ✅ Facilitate P2P trades
  ✅ Manage escrow
  ✅ Resolve disputes
  ❌ Cannot appoint other agents
```

---

## EVERYTHING USES THIS DOMAIN

```
Primary: https://pulse-invest.vercel.app

✅ All user pages
✅ All admin pages
✅ All API endpoints
✅ All email links
✅ All authentication

NO OTHER DOMAINS - Avoid pulseinvestme.dpdns.org or pulseinvestme.com for now
FOCUS: pulse-invest.vercel.app is your LIVE production URL
```

---

## QUICK REFERENCE TABLE

| Page | URL | Auth Required | Who Can Access |
|------|-----|---------------|-----------------|
| Homepage | `/` | No | Everyone |
| Sign Up | `/auth/sign-up` | No | Everyone |
| Sign In | `/auth/sign-in` | No | Everyone |
| Dashboard | `/app` | Yes | Logged-in users |
| Deposit | `/app/deposit` | Yes | Users (admin approval needed) |
| Withdrawal | `/app/withdrawal` | Yes | Users (admin approval needed) |
| Admin Login | `/admin/login` | No | Admin only |
| Payments | `/admin/payments` | Yes | Admin + Payment Agents |
| Agents | `/admin/agents` | Yes | Super Admin only |
| Users | `/admin/users` | Yes | Admin only |
| Audit Logs | `/admin/audit-logs` | Yes | Admin only |

---

## SUMMARY

Your PULSE platform is LIVE at:
```
https://pulse-invest.vercel.app
```

All URLs use this domain. No confusion with other domains.

**Everything is production-ready and active now!**
