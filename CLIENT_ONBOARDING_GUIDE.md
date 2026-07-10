# PULSE CLIENT ONBOARDING GUIDE

Complete guide for new clients to signup, submit KYC, and start using Pulse.

---

## CLIENT SIGNUP FLOW (5 Minutes)

### Step 1: Sign Up
```
URL: https://pulse-investment-platform-6auij6irw.vercel.app/auth/sign-up

Fill Form:
  Full Name: [Your Full Name]
  Email: [Your Email]
  Password: [Min 6 characters]

Click "Create Account"
```

### Step 2: Verify Email
```
Check your email inbox
Click verification link from Supabase
You'll be redirected to the app automatically
```

### Step 3: Complete Profile
```
URL: /app/profile

Fill:
  Full Name: [Your name - already populated]
  Phone: [Optional]
  Country: [Select your country]
  
Click "Save Profile"
```

---

## KYC SUBMISSION FLOW (5 Minutes)

### Why KYC is Required
- Required to deposit and invest
- Minimum requirement: Full name, ID number, Country
- No personal data is shared externally
- Secure and encrypted

### How to Submit KYC

```
URL: /app/kyc

Click "Submit KYC"

Fill the form:
  Full Name: [Your legal name]
  ID Number: [Passport/ID card number]
  Date of Birth: [MM/DD/YYYY]
  Country: [Country of residence]
  
Click "Submit"

Status: "Pending" appears
```

### Status Tracking

```
KYC Status:
  ⏳ Pending → Waiting for admin review (usually 24 hours)
  ✅ Verified → Approved! You can invest and withdraw
  ❌ Rejected → Contact support (click details for reason)
```

### After KYC Approval

Once approved:
1. ✅ Can make deposits
2. ✅ Can invest in projects
3. ✅ Can stake tokens
4. ✅ Can request withdrawals
5. ✅ Can vote on governance

---

## ACCOUNT FEATURES - WHAT YOU CAN DO

### 1. VIEW DASHBOARD
```
URL: /app

See:
  - Your total balance
  - Invested amount
  - Staked tokens
  - Pending yield
  - Recent transactions
  - KYC status
```

### 2. DEPOSIT FUNDS
```
AFTER KYC APPROVAL:

Click "Deposit"

Options:
  A) Crypto (NOWPayments)
     - Enter amount in USD
     - Get wallet address
     - Send cryptocurrency
     - Funds credited automatically
  
  B) Admin Disburse (Special)
     - Admin can send you funds
     - No deposit needed
     - Direct to your account
```

### 3. INVEST IN PROJECTS
```
AFTER KYC APPROVAL:

Click "Invest"

1. Select Project
   - See project details
   - Target yield (e.g., 18-34% p.a.)
   - Min/max investment

2. Enter Amount
   - Must have funds in account
   - Min $500 for most projects

3. Click "Invest"
   - Funds deducted from cash balance
   - Invested balance updated
   - Tier upgrades automatically (if applicable)

4. View Investment
   - All holdings in "My Portfolio"
   - Current value
   - Projected yield
   - Maturity date
```

### 4. STAKE TOKENS (PULSE)
```
Click "Staking"

1. Enter PULSE amount to stake
   - You must own PULSE tokens
   - Min $100 to stake

2. View APY
   - Current: 24.8% per annum
   - Yield accrues daily

3. Click "Stake"
   - Tokens locked in staking
   - View in "Staking Positions"

4. Unstake Anytime
   - Click "Unstake"
   - Return to wallet
   - Yield transferred to balance
```

### 5. REQUEST WITHDRAWAL
```
AFTER KYC APPROVAL:

Click "Withdraw"

1. Enter Amount
   - Must have available cash
   - Cannot exceed balance

2. Select Currency
   - USD (fiat)
   - PULSE (tokens)

3. Provide Wallet (for crypto)
   - If withdrawing crypto
   - Enter wallet address

4. Submit
   - Goes to admin queue
   - Admin approves/rejects
   - Funds sent to wallet/bank

Status:
  ⏳ Pending → Awaiting admin approval
  ✅ Approved → Funds being sent
  ❌ Rejected → Funds returned to your account
```

### 6. VIEW TRANSACTION HISTORY
```
URL: /app/history

See all transactions:
  - Deposits
  - Withdrawals
  - Investments
  - Stakes
  - Yield payouts
  - Dates and amounts
  - Status of each
```

### 7. MANAGE WALLET
```
URL: /app/wallet

Connect/Update Wallet:
  - Add wallet address for withdrawals
  - Update anytime
  - Must be verified before withdrawal
```

### 8. GOVERNANCE (Voting)
```
URL: /app/governance

Participate in decisions:
  - Vote on proposals
  - See voting power
  - View results
  - History of votes
```

---

## ACCOUNT BALANCES EXPLAINED

### Cash Balance
```
Money available to:
  - Invest in projects
  - Stake
  - Withdraw

Increases when:
  - You deposit
  - Admin disburses funds
  - You unstake
  - You receive yield
  
Decreases when:
  - You invest
  - You stake
  - You withdraw
```

### Invested Balance
```
Money currently invested in projects

Cannot withdraw until:
  - Project maturity
  - Admin approval

Earns:
  - Project yield
  - Target 18-34% p.a. depending on project
```

### Staked Balance
```
PULSE tokens earning APY

Currently earning:
  - 24.8% per annum

Cannot withdraw:
  - Locked while staking

Withdraw:
  - Click "Unstake"
  - Immediate access
  - Yield credited
```

### Pending Yield
```
Yield earned but not yet paid out

Increases:
  - Daily from staking
  - At project maturity
  - From dividends

Paid when:
  - Admin disburses
  - Automatically each month
```

---

## COMMON QUESTIONS

### Q: How long does KYC take?
A: Usually 24 hours. Check status in "Profile" → "KYC Status"

### Q: What if KYC is rejected?
A: You'll see reason. Update info and resubmit.

### Q: Can I change my wallet address?
A: Yes, anytime in Profile → Wallet Settings

### Q: How often does yield pay out?
A: Monthly, automatically to your account

### Q: Can I withdraw while invested?
A: No, must wait for project maturity or admin approval

### Q: What's the minimum deposit?
A: $100 USD or equivalent crypto

### Q: Can I stake PULSE?
A: Yes, minimum $100, earns 24.8% APY

### Q: Is my data secure?
A: Yes, all data encrypted, RLS protects your privacy

---

## TROUBLESHOOTING

### Email not received
- Check spam folder
- Click "Resend verification"
- Wait 5 minutes, check again

### KYC submission fails
- Ensure all fields filled
- Check date format (MM/DD/YYYY)
- ID number must be valid
- Try again or contact support

### Cannot invest
- Check KYC status (must be verified)
- Ensure sufficient balance
- Try refreshing page
- Clear browser cache

### Deposit not arriving
- Check reference number in transactions
- Verify wallet/address correct
- Wait 30 minutes for confirmation
- Contact admin if delayed >1 hour

### Withdrawal rejected
- Insufficient balance?
- KYC not verified?
- Admin approval pending?
- Click details for reason

---

## SECURITY BEST PRACTICES

1. ✅ Use strong password (mix of letters, numbers, symbols)
2. ✅ Never share your password
3. ✅ Verify wallet addresses before withdrawal
4. ✅ Enable 2FA if available (coming soon)
5. ✅ Check URL before entering credentials
6. ✅ Logout after each session
7. ✅ Don't click suspicious links
8. ✅ Report issues immediately to admin

---

## ADMIN CONTACTS (For Support)

**For KYC Issues:**
- Email: samkelisiwechiliza2@gmail.com
- Role: KYC Manager

**For General Support:**
- Email: lancegumunyu@gmail.com
- Role: Founder & CEO

**Response Time:** 24 hours or less

---

## GETTING STARTED - 10 MINUTE FLOW

### Minute 1-2: Sign Up
- Go to sign-up page
- Enter details
- Receive verification email

### Minute 3-4: Verify Email
- Click link in email
- Redirected to app

### Minute 5-6: Complete Profile
- Add phone (optional)
- Select country
- Save

### Minute 7-10: Submit KYC
- Click "Submit KYC"
- Enter: Full name, ID, DOB, Country
- Click Submit
- Status: Pending

### Wait ~24 hours: KYC Approved
- Check email for approval
- Login to app
- Status shows: Verified
- You're ready to invest!

---

## READY TO START?

1. ✅ Understand the flow above
2. ✅ Go to sign-up page
3. ✅ Complete profile
4. ✅ Submit KYC
5. ✅ Wait for approval
6. ✅ Start investing
7. ✅ Earn yield

**You're all set. Welcome to Pulse! 🚀**

---

## QUICK LINKS

- **Sign Up:** /auth/sign-up
- **Login:** /auth/login
- **App:** /app
- **Dashboard:** /app/dashboard
- **Profile:** /app/profile
- **KYC:** /app/kyc
- **Portfolio:** /app/portfolio
- **Staking:** /app/staking
- **History:** /app/history
- **Support:** support@pulse.co.za

---

Last Updated: 2025
Pulse Investment Platform v1.0
