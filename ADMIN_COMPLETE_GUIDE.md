# PULSE INVESTMENT PLATFORM - COMPLETE ADMIN GUIDE

## PRODUCTION URL
**https://pulse-investment-platform-qagzh6rrj.vercel.app**

---

## ADMIN PORTAL LOGIN

**Admin Portal URL:** `https://pulse-investment-platform-qagzh6rrj.vercel.app/admin/login`

---

## ADMIN CREDENTIALS & ROLES

### 1. CHIEF ADMIN (Full Control)
**Email:** `admin@pulse.com`
**Password:** `PulseAdmin@2024!Secure`
**Role:** Admin
**Permissions:**
- Approve/Reject all users
- Manage admin float (USD + PULSE tokens)
- Review KYC documents
- View all audit trails
- Manage other admins

**Initial Float Allocation:**
- USD Balance: $1,000,000
- PULSE Tokens: 2,000,000
- Promotional PULSE: 100,000

---

### 2. APPROVAL MANAGER
**Email:** `manager@pulse.com`
**Password:** `Manager@Pulse#2024Secure`
**Role:** Manager
**Permissions:**
- Approve/Reject users
- View pending users queue
- Manage own float balance
- View audit trails

**Initial Float Allocation:**
- USD Balance: $500,000
- PULSE Tokens: 1,000,000
- Promotional PULSE: 50,000

---

### 3. KYC REVIEWER
**Email:** `kyc@pulse.com`
**Password:** `KYC@Reviewer#2024Pulse`
**Role:** KYC Reviewer
**Permissions:**
- Review KYC documents
- Approve/Reject KYC submissions
- View user profiles
- Update KYC status

**Initial Float Allocation:**
- USD Balance: $250,000
- PULSE Tokens: 500,000
- Promotional PULSE: 25,000

---

## TOKEN ALLOCATION FOR $10M USD TARGET

### Total Platform Tokens: 10,000,000 PULSE

**Breakdown:**

```
Total Supply: 10,000,000 PULSE Tokens

Allocation:
├─ Admin Float (3 admins): 3,500,000 PULSE
│  ├─ Chief Admin: 2,000,000 PULSE
│  ├─ Approval Manager: 1,000,000 PULSE
│  └─ KYC Reviewer: 500,000 PULSE
│
├─ Promotional Pool (Users): 5,000,000 PULSE
│  └─ 50 USDT per user × 100,000 users = 5,000,000 PULSE
│
├─ Liquidity Reserve: 1,000,000 PULSE
│  └─ For platform operations & contingencies
│
└─ Growth Fund: 500,000 PULSE
   └─ For bonus distributions & marketing
```

### Exchange Rates
```
1 PULSE Token = 1 USDT equivalent
1 User Promotional = 50 USDT PULSE
Max Users Supported: 100,000 users
Total Platform Value: $10,000,000 USD
```

---

## USER FLOW WITH TOKEN ALLOCATION

### Step 1: User Signs Up
- Receives 50 USDT PULSE tokens (promotional, locked)
- Account status: `pending_email_confirmation`
- Tokens visible in wallet: `50 PULSE`

### Step 2: Email Confirmed
- Status: `pending_admin_approval`
- Tokens remain locked
- Dashboard access: Limited (view only)
- Deposit button: Locked "Complete KYC"
- Withdraw button: Locked "Complete KYC"

### Step 3: Admin Approves
- Status: `approved`
- Access expanded (all features visible)
- Tokens still locked (until KYC)
- Deposit: Still locked
- Withdraw: Still locked

### Step 4: KYC Completed
- Status: `kyc_verified`
- Full unlimited access
- Tokens become fully withdrawable
- Can deposit and access tiers
- Can withdraw 50 USDT PULSE + any earned PULSE

---

## ADMIN FLOAT MANAGEMENT

Each admin has two separate balances:

### USD Balance (Real Money)
Used for:
- Processing user deposits
- Managing payment flows
- Transaction settlements

### PULSE Token Balance
Used for:
- Distributing promotional tokens
- Bonus rewards
- Platform incentives

### Float Top-Up Process
1. Log in to Admin Portal
2. Go to "Float Management" tab
3. Click "Request Top-Up"
4. Enter amount (USD or PULSE)
5. Provide reason
6. Submit for approval

---

## APPROVAL WORKFLOW

### For Chief Admin:
1. Login to `/admin/login`
2. View pending users queue
3. Click user to review profile
4. Click "Approve" or "Reject"
5. Add optional note
6. Confirm action

### For Approval Manager:
1. Same as Chief Admin
2. Cannot override other approvals
3. Limited to 50 users per day (optional)

### For KYC Reviewer:
1. Login to admin portal
2. Go to "KYC Submissions"
3. Review uploaded documents
4. Click "Approve" or "Request More Info"
5. Documents verified

---

## PROMOTIONAL EMAIL TEMPLATE

When user signs up, they receive:

**Subject:** Welcome to Pulse! 🎁 Your $50 USDT Bonus Awaits

**Email Content:**
- Welcome message
- 50 USDT PULSE token badge
- List of what they can do
- Confirmation link
- Next steps
- Security reminder

---

## DASHBOARD ACCESS LEVELS

### Unconfirmed (Email pending)
- No access to dashboard

### Confirmed (Email verified, Pending Admin)
- View: Investments, Sales, Staking, Wallet, Signals
- Cannot: Deposit, Withdraw, Access Tiers
- Messages: "Pending Admin Approval"

### Admin Approved (Pending KYC)
- View: All features
- Cannot: Deposit, Withdraw, Access Tiers
- Messages: "Complete KYC to unlock"

### KYC Verified (Full Access)
- Deposit: ENABLED
- Withdraw: ENABLED
- Tiers: ENABLED
- PULSE Tokens: WITHDRAWABLE

---

## TOKEN WITHDRAWAL RULES

**Locked Tokens (Promotional):**
- Cannot be withdrawn until user makes first deposit
- Becomes unlocked permanently after deposit
- Non-transferable until unlocked

**Unlocked Tokens:**
- Fully withdrawable to user wallet
- Can be transferred to other users
- Can be used for investments
- Can be exchanged for USD (when available)

---

## AUDIT TRAIL LOGGING

All actions logged:
- User approvals/rejections (with timestamp & reason)
- KYC submissions & reviews
- Token distributions
- Float adjustments
- Login attempts
- Admin actions

---

## SECURITY PROTOCOLS

1. **Password Requirements:**
   - Minimum 12 characters
   - 1 uppercase, 1 lowercase, 1 number, 1 special character
   - Change every 90 days

2. **Two-Factor Authentication:**
   - Available for all admin accounts
   - Highly recommended

3. **Session Timeout:**
   - 30 minutes of inactivity = logout
   - Automatic re-login required

4. **IP Whitelisting:**
   - Restrict admin access to specific IPs
   - Set in admin settings

---

## COMMON ADMIN TASKS

### Approve a User
1. Login as Admin/Manager
2. Click "Pending Users"
3. Select user from queue
4. Click "Approve"
5. User gains dashboard access

### Review KYC
1. Login as KYC Reviewer
2. Click "KYC Submissions"
3. Review ID & Address docs
4. Click "Approve" or "Request Info"
5. User notified of status

### Adjust Float
1. Login as Chief Admin
2. Click "Float Management"
3. Enter new balance
4. Confirm change
5. Change logged to audit trail

### View Audit Trail
1. Login as Admin
2. Click "Audit Trail"
3. Filter by date, action, user
4. View all historical actions

---

## TROUBLESHOOTING

**User can't confirm email:**
- Check email is in inbox/spam
- Check confirmation link isn't expired
- Have user request new confirmation email

**Admin can't approve users:**
- Check admin float (USD balance)
- Verify admin role permissions
- Check if user already approved

**KYC documents won't upload:**
- File size < 5MB
- Format: JPG, PNG, PDF
- Image quality: High resolution

**Float transfer failed:**
- Check balance is sufficient
- Verify recipient exists
- Check for network connectivity

---

## SUPPORT CONTACTS

**Platform Issues:** support@pulse.com
**Admin Support:** admin@pulse.com
**KYC Issues:** kyc@pulse.com
**Finance Issues:** finance@pulse.com

---

## COMPLIANCE & LEGAL

All admins must:
- Comply with GDPR
- Maintain confidentiality
- Follow approval guidelines
- Document all decisions
- Never bypass security protocols

---

**Last Updated:** July 2026
**Version:** 1.0
**Status:** Production Ready
