# Pulse Admin Approval & Float System

## Overview

This system implements a complete user approval workflow with admin float management for deposits and token distribution.

### User Signup Flow

1. **Signup** - User creates account with email/password
2. **50 USDT PULSE Promo** - Automatically credited (non-withdrawable until first deposit)
3. **Email Confirmation** - Confirmation email sent
4. **Limited Access** - After email confirmation, user sees dashboard but:
   - CAN view investments, sales, staking
   - CANNOT deposit/withdraw (shows pending admin approval)
   - CANNOT access tiers

5. **Admin Approval** - Admin reviews and approves account
6. **KYC Required** - User completes KYC verification
7. **Full Access** - After KYC, user can:
   - Deposit funds
   - Access tier system
   - Withdraw funds (PULSE tokens become withdrawable after first deposit)

## Admin Portal

### Accessing Admin Portal

**URL:** `https://yourapp.com/admin/login`

### Main Admin Credentials

```
Email: admin@pulse.com
Password: PulseAdmin@2024!Secure
```

### Approval Manager Credentials

```
Email: manager@pulse.com
Password: Manager@Pulse#2024Secure
```

## Admin Dashboard Features

### 1. User Approvals Tab

- View pending user approvals
- See user's promotional PULSE balance (50 USDT)
- Approve or reject users with one click
- All actions logged automatically

**Process:**
1. User signs up → Gets 50 USDT PULSE tokens
2. User confirms email → Pending approval status
3. Admin approves → User gains access to all features (except deposits until KYC)

### 2. Admin Float Tab

- View current USD balance (for user deposits)
- View current PULSE tokens balance (for distributions)
- Top-up balances as needed
- All transactions logged with timestamps

**Float Usage:**
- **USD Balance**: Used to process deposits into user accounts
- **PULSE Tokens**: Distributed to new users (50 USDT promo) and other incentives

**Starting Balances:**
- USD: $10,000
- PULSE Tokens: 10,000

## User Account States

### Unconfirmed (Email Not Verified)
- No dashboard access
- Must confirm email first

### Confirmed/Pending Approval
- View all investments
- View sales & staking
- View portfolio (limited)
- **CANNOT** deposit or withdraw
- **CANNOT** access tier system
- Shows "Pending Admin Approval" on action buttons

### Approved (After Admin Approval)
- Full feature access
- **CANNOT** deposit until KYC completed
- **CANNOT** access tiers until KYC completed
- Can view all pages

### KYC Completed
- Full unlimited access
- Can deposit funds
- Can access tier system
- PULSE tokens become withdrawable

## Database Schema

### profiles table additions

```sql
approval_status: 'pending' | 'approved' | 'rejected'
email_confirmed: boolean
approved_by: UUID (admin ID)
approved_at: timestamp
kyc_status: 'pending' | 'approved' | 'rejected'
pulse_tokens_balance: decimal (50 = promo credit)
usd_balance: decimal
```

### admin_float table

```sql
admin_id: UUID
pulse_tokens_balance: decimal
usd_balance: decimal
updated_at: timestamp
```

### admin_approvals table (audit trail)

```sql
user_id: UUID
admin_id: UUID
action: 'approved' | 'rejected' | 'float_topup'
reason: text
created_at: timestamp
```

## Setup Instructions

### 1. Run Migration

Execute `migrations/add-approval-system.sql` in Supabase SQL Editor:

```bash
# In Supabase SQL Editor, paste and run:
migrations/add-approval-system.sql
```

### 2. Environment Variables

No additional env vars needed - uses existing Supabase config.

### 3. Deploy

```bash
npm run build
vercel deploy --prod
```

## Approval Workflow

### For Users

1. **Signup Page** (`/auth/sign-up`)
   - Fill form with name, email, password
   - Immediately created with 50 USDT PULSE tokens

2. **Success Page** (`/auth/sign-up-success`)
   - Shows confirmation email sent
   - Shows promo balance credited
   - Instructions to confirm email

3. **Email Confirmation**
   - User clicks link in email
   - Account transitions to pending approval
   - Dashboard unlocked (limited features)

4. **Wait for Admin**
   - User sees "Pending Admin Approval" banner
   - Can browse investments
   - Cannot deposit/withdraw

5. **Admin Approves**
   - User notification (future: email sent)
   - Access expands

6. **KYC Verification** (`/app/kyc`)
   - User uploads documents
   - Completes personal info
   - Waits for KYC approval

7. **Full Access**
   - Can now deposit
   - Can access tiers
   - Full platform access

### For Admins

1. **Login** (`/admin/login`)
   - Use strict credentials
   - Session stored in localStorage

2. **Dashboard** (`/admin/dashboard`)
   - View pending approvals
   - Review user info
   - Approve or reject with one click

3. **Float Management**
   - Check current balances
   - Top-up USD and PULSE as needed
   - All logged automatically

4. **Settings** (`/admin/settings`)
   - View account info
   - Security information
   - Session details

## Security Features

- Strict credential requirements for admin login
- All admin actions logged with timestamp
- Audit trail preserved in `admin_approvals` table
- RLS policies on all tables
- Session management with localStorage
- Unauthorized access detection

## Key Features

✓ Instant user signup (no email delay)
✓ 50 USDT PULSE token promo on signup
✓ Email confirmation required for limited access
✓ Admin approval required for full access
✓ KYC required to unlock deposits
✓ Admin float management for USD and PULSE
✓ Complete audit trail
✓ Secure admin credentials

## Troubleshooting

**User cannot see dashboard after email confirmation**
- Check `email_confirmed` column is true
- Verify admin hasn't rejected user
- Check for KYC requirement blocking

**Admin float balance incorrect**
- Check `admin_float` table in Supabase
- Review `admin_approvals` table for transaction history
- Verify topup amounts

**Admin login fails**
- Verify credentials exactly (case-sensitive)
- Check localStorage not cleared
- Try incognito window

## Support

For issues or questions, contact platform administrators at admin@pulse.com
