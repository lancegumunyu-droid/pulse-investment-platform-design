/**
 * Signal Event Notifications
 * Email templates for signal events (creation, closure, auto-credit)
 */

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SignalClosureEmailData {
  signalTitle: string
  projectName: string
  investorCount: number
  totalAmount: number
  adminDashboardUrl: string
  companyEmail: string
}

/**
 * Email template for admin notification when signal closes
 */
export function generateSignalClosureEmail(data: SignalClosureEmailData): EmailTemplate {
  const { signalTitle, projectName, investorCount, totalAmount, adminDashboardUrl, companyEmail } = data

  return {
    subject: `PULSE Alert: Signal "${signalTitle}" Has Closed - ${investorCount} Credits Pending Approval`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: #f59e0b; padding: 30px; text-align: center; border-radius: 8px; }
    .content { background: #faf5f0; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .stats { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .stat-row:last-child { border-bottom: none; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PULSE Platform Alert</h1>
    </div>
    
    <div class="content">
      <h2>Signal Closure Requires Admin Approval</h2>
      
      <div class="alert">
        <strong>Action Required:</strong> ${investorCount} investor(s) are waiting for approval to receive their credits from the closed signal.
      </div>
      
      <div class="stats">
        <div class="stat-row">
          <strong>Signal:</strong>
          <span>${signalTitle}</span>
        </div>
        <div class="stat-row">
          <strong>Project:</strong>
          <span>${projectName}</span>
        </div>
        <div class="stat-row">
          <strong>Affected Investors:</strong>
          <span>${investorCount}</span>
        </div>
        <div class="stat-row">
          <strong>Total Credits Pending:</strong>
          <span><strong>$${totalAmount.toFixed(2)}</strong></span>
        </div>
      </div>
      
      <p>The signal has automatically closed and investors are eligible for credits. These credits are pending your final approval before being credited to investor wallets.</p>
      
      <center>
        <a href="${adminDashboardUrl}" class="button">Review in Admin Dashboard</a>
      </center>
      
      <h3>Next Steps:</h3>
      <ol>
        <li>Go to your Admin Dashboard</li>
        <li>Navigate to the Payments tab</li>
        <li>Review the pending credits</li>
        <li>Approve to credit investor accounts</li>
      </ol>
      
      <p style="color: #666; font-size: 14px;">This is an automated notification from PULSE. Signal closures are processed daily at midnight UTC.</p>
    </div>
    
    <div class="footer">
      <p>PULSE Investment Platform</p>
      <p>Questions? Contact us at ${companyEmail}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
PULSE Platform Alert: Signal Closure Requires Admin Approval

Signal: ${signalTitle}
Project: ${projectName}
Affected Investors: ${investorCount}
Total Credits Pending: $${totalAmount.toFixed(2)}

Action Required: ${investorCount} investor(s) are waiting for approval to receive their credits.

Visit your Admin Dashboard: ${adminDashboardUrl}

Next Steps:
1. Go to your Admin Dashboard
2. Navigate to the Payments tab
3. Review the pending credits
4. Approve to credit investor accounts

Questions? Contact us at ${companyEmail}
    `.trim(),
  }
}

export interface InvestorCreditEmailData {
  investorName: string
  creditAmount: number
  signalTitle: string
  projectName: string
  dashboardUrl: string
  companyEmail: string
}

/**
 * Email template for investor notification when credits are approved
 */
export function generateInvestorCreditEmail(data: InvestorCreditEmailData): EmailTemplate {
  const { investorName, creditAmount, signalTitle, projectName, dashboardUrl, companyEmail } = data

  return {
    subject: `Your PULSE Investment Returns: $${creditAmount.toFixed(2)} Credited to Your Account`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #f59e0b; padding: 40px; text-align: center; border-radius: 8px; }
    .success { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 15px 0; }
    .content { background: #faf5f0; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .amount { font-size: 28px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 1px solid #e5e7eb; }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-row:last-child { border-bottom: none; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Investment Returns</h1>
    </div>
    
    <div class="content">
      <p>Hi ${investorName},</p>
      
      <div class="success">
        <strong>Great news!</strong> Your investment returns have been credited to your PULSE account.
      </div>
      
      <div class="amount">+$${creditAmount.toFixed(2)}</div>
      
      <p>This credit represents your returns from the following investment:</p>
      
      <div class="details">
        <div class="detail-row">
          <strong>Signal:</strong>
          <span>${signalTitle}</span>
        </div>
        <div class="detail-row">
          <strong>Project:</strong>
          <span>${projectName}</span>
        </div>
        <div class="detail-row">
          <strong>Credit Amount:</strong>
          <span><strong style="color: #10b981;">+$${creditAmount.toFixed(2)}</strong></span>
        </div>
        <div class="detail-row">
          <strong>Credited On:</strong>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <h3>What's Next?</h3>
      <ul>
        <li>Your funds are now available in your wallet</li>
        <li>You can withdraw to your bank account</li>
        <li>Or reinvest in other opportunities</li>
      </ul>
      
      <center>
        <a href="${dashboardUrl}" class="button">View Your Dashboard</a>
      </center>
      
      <p style="color: #666; font-size: 14px;">Thank you for investing with PULSE. We're committed to transparent, professional portfolio management.</p>
    </div>
    
    <div class="footer">
      <p>PULSE Investment Platform</p>
      <p>Questions? Contact us at ${companyEmail}</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
    text: `
Your PULSE Investment Returns

Hi ${investorName},

Great news! Your investment returns have been credited to your PULSE account.

Credit: +$${creditAmount.toFixed(2)}

Signal: ${signalTitle}
Project: ${projectName}
Credited On: ${new Date().toLocaleDateString()}

Your funds are now available in your wallet. You can withdraw to your bank account or reinvest in other opportunities.

View Your Dashboard: ${dashboardUrl}

Thank you for investing with PULSE.

Questions? Contact us at ${companyEmail}
    `.trim(),
  }
}

/**
 * Send email via SendGrid (integration point)
 */
export async function sendEmailNotification(
  to: string,
  template: EmailTemplate
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // This is a placeholder for SendGrid integration
    // In production, you would call the SendGrid API directly from a server action
    console.log(`[PULSE Email] Sending to ${to}:`, template.subject)

    // For now, just return success
    // In real implementation, call your API route:
    // const response = await fetch('/api/email/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, subject: template.subject, html: template.html })
    // })

    return { success: true, messageId: `msg-${Date.now()}` }
  } catch (error) {
    console.error('[PULSE Email] Error:', error)
    return { success: false, error: String(error) }
  }
}
