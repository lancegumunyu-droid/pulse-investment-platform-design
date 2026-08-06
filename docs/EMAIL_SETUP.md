# PULSE Platform - Email Configuration Guide

## Quick Setup

### Company Email Address
**Primary Contact Email:** `support@pulse-invest.app`

### Email Roles
- `support@pulse-invest.app` - Customer support inquiries
- `admin@pulse-invest.app` - Admin notifications & approvals
- `payments@pulse-invest.app` - Payment processing notifications
- `noreply@pulse-invest.app` - Automated system notifications

---

## SendGrid Integration

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up for a free account
3. Complete email verification

### Step 2: Get SendGrid API Key
1. In SendGrid dashboard, go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it: "PULSE Platform"
4. Select **Restricted Access**
5. Under "Mail Send", check:
   - Mail Send
   - Template Engine
6. Copy the API key

### Step 3: Set Environment Variables

Add these to your `.env.local` file (or Vercel project settings):

```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@pulse-invest.app
SENDGRID_FROM_NAME=PULSE Investment Platform

# Admin Email
ADMIN_EMAIL=admin@pulse-invest.app

# App URLs
NEXT_PUBLIC_APP_URL=https://pulse-invest.vercel.app
```

### Step 4: Verify Sender Email in SendGrid

1. In SendGrid, go to **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter:
   - Email: `noreply@pulse-invest.app`
   - Name: `PULSE Investment Platform`
4. Check your email and click the verification link
5. Repeat for `support@pulse-invest.app`

---

## SendGrid Dynamic Templates (Optional)

For beautiful, pre-designed emails, create templates in SendGrid:

### Template 1: Signal Closure Notification
**Template Name:** `pulse-signal-closed`
**Recipients:** Admin
**Variables:**
- signalTitle
- projectName
- investorCount
- totalAmount
- adminDashboardUrl

### Template 2: Investor Credit Approved
**Template Name:** `pulse-investor-credit`
**Recipients:** Investors
**Variables:**
- investorName
- creditAmount
- signalTitle
- projectName
- dashboardUrl

### Template 3: Payment Approved
**Template Name:** `pulse-payment-approved`
**Recipients:** Users
**Variables:**
- userName
- paymentAmount
- paymentType (withdrawal/deposit)
- transactionId

### Template 4: Welcome Email
**Template Name:** `pulse-welcome`
**Recipients:** New users
**Variables:**
- userName
- activationLink
- dashboardUrl

---

## Email Notification Flow

### Signal Auto-Closure Flow
1. Signal reaches closing date
2. System auto-closes signal
3. Admin receives email: "Signal Closed - X Credits Pending Approval"
4. Admin approves in dashboard
5. Investors receive email: "Your Investment Returns Credited"

### Payment Approval Flow
1. User requests withdrawal
2. Admin receives email: "Withdrawal Pending Your Approval"
3. Admin approves/rejects
4. User receives confirmation email

### New Signal Flow
1. Admin creates signal
2. Investors receive email alert (optional)
3. Signal appears on Signals page

---

## Testing Email in Development

### Option 1: Use SendGrid Sandbox Mode
```env
SENDGRID_SANDBOX_MODE=true
```
Emails won't actually send but API will return success.

### Option 2: Use a Test Email Service
- MailHog: Local email testing
- Ethereal: Free temporary email service
- Mailtrap: Inbox for testing

### Option 3: Check SendGrid Activity Feed
1. SendGrid dashboard
2. Mail Activity
3. View all sent emails and delivery status

---

## Email API Integration

### Using the Email Notification System

```typescript
import { generateSignalClosureEmail, sendEmailNotification } from '@/lib/signal-notifications'
import { EMAIL_RECIPIENTS } from '@/lib/email-config'

// Create email template
const emailTemplate = generateSignalClosureEmail({
  signalTitle: 'Kalahari Solar Phase 2',
  projectName: 'Kalahari Solar Field',
  investorCount: 47,
  totalAmount: 125340,
  adminDashboardUrl: 'https://pulse-invest.vercel.app/admin',
  companyEmail: 'support@pulse-invest.app',
})

// Send to admin
await sendEmailNotification(EMAIL_RECIPIENTS.admin, emailTemplate)
```

---

## Troubleshooting

### "Authentication failed"
- Check SENDGRID_API_KEY is correct
- Make sure key has "Mail Send" permission
- Verify key isn't expired

### "Invalid From Address"
- Verify sender email in SendGrid dashboard
- Make sure email is in "Single Sender Verification"
- Wait 24 hours after verification request

### "Template not found"
- Check template ID is correct in SENDGRID_TEMPLATE_IDS
- Make sure template exists in SendGrid dashboard
- Verify template is in same SendGrid account

### Emails not sending in production
- Check environment variables in Vercel project settings
- Verify SendGrid API key has correct permissions
- Check SendGrid activity feed for failures
- Look at application logs in Vercel

---

## Email Audit Logging

All emails sent are logged with:
- Email type
- Recipient
- Send timestamp
- Success/failure status
- Error message (if failed)

Check logs in your database or application logs.

---

## Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Rotate API keys** - Change SendGrid key periodically
3. **Use IP Whitelist** - In SendGrid, restrict API access to your servers
4. **Monitor activity** - Check SendGrid dashboard regularly
5. **Test templates** - Always test emails before deployment

---

## Support

For issues with:
- **SendGrid:** support@sendgrid.com
- **PULSE:** support@pulse-invest.app
- **Vercel deployment:** https://vercel.com/help

---

## Summary

✅ Company email configured: `support@pulse-invest.app`
✅ Email roles defined (support, admin, payments, noreply)
✅ SendGrid integration ready
✅ Email templates designed
✅ Auto-close notifications ready
✅ Payment approval emails ready
✅ Admin dashboard integrated

Next: Start receiving notifications when signals close or payments need approval!
