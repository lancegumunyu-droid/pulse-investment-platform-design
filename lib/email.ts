import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const PULSE_BRANDING = {
  from: 'PULSE <noreply@pulse-invest.vercel.app>',
  logoUrl: 'https://pulse-invest.vercel.app/pulse-logo.png',
  primaryColor: '#f59e0b', // Gold
  brandColor: '#1a1a1a', // Dark
  accentColor: '#f5f5dc', // Crème
};

/**
 * PULSE Email Template: Signup Confirmation
 */
export const sendSignupConfirmationEmail = async (
  email: string,
  fullName: string,
  confirmationLink: string
) => {
  return resend.emails.send({
    from: PULSE_BRANDING.from,
    to: email,
    subject: '✨ Welcome to PULSE Investment Platform',
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, ${PULSE_BRANDING.brandColor}, #333); color: ${PULSE_BRANDING.accentColor}; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 32px; }
      .content { background: white; padding: 40px; border-radius: 0 0 8px 8px; }
      .welcome-text { font-size: 18px; color: #1a1a1a; margin: 20px 0; }
      .bonus-box { background: ${PULSE_BRANDING.primaryColor}15; border-left: 4px solid ${PULSE_BRANDING.primaryColor}; padding: 20px; margin: 30px 0; border-radius: 4px; }
      .bonus-text { color: #1a1a1a; font-weight: 600; font-size: 16px; }
      .cta-button { display: inline-block; background: ${PULSE_BRANDING.primaryColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 30px 0; text-align: center; }
      .cta-button:hover { background: #d97706; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
      .security-note { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #856404; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 Welcome to PULSE</h1>
        <p>Your Premium Investment Platform</p>
      </div>
      <div class="content">
        <p class="welcome-text">Hi ${fullName},</p>
        
        <p>Thank you for signing up! We're thrilled to have you join the PULSE investment community.</p>
        
        <div class="bonus-box">
          <p class="bonus-text">🎁 Welcome Bonus: 50 USDT in PULSE Tokens</p>
          <p>Your welcome bonus has been credited to your account immediately!</p>
        </div>

        <p>To get started and unlock full access to your dashboard, please confirm your email address by clicking the button below:</p>
        
        <center>
          <a href="${confirmationLink}" class="cta-button">Confirm Email Address</a>
        </center>

        <p><strong>Link expires in 24 hours.</strong></p>

        <div class="security-note">
          <strong>Security Notice:</strong> If you didn't create this account, please ignore this email or contact our support team immediately.
        </div>

        <p>
          <strong>What's Next?</strong><br>
          1. Confirm your email address<br>
          2. Complete your profile<br>
          3. Start investing in premium opportunities<br>
          4. Access exclusive insights and market signals
        </p>

        <p>Questions? Our support team is here to help!</p>

        <div class="footer">
          <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
          <p>PULSE | Premium Investment Platform | <a href="https://pulse-invest.vercel.app">Visit Dashboard</a></p>
        </div>
      </div>
    </div>
  </body>
</html>
    `,
  });
};

/**
 * PULSE Email Template: Password Reset
 */
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  resetLink: string
) => {
  return resend.emails.send({
    from: PULSE_BRANDING.from,
    to: email,
    subject: '🔐 Reset Your PULSE Password',
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #d97706, ${PULSE_BRANDING.brandColor}); color: ${PULSE_BRANDING.accentColor}; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 32px; }
      .content { background: white; padding: 40px; border-radius: 0 0 8px 8px; }
      .warning-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px; color: #991b1b; }
      .cta-button { display: inline-block; background: ${PULSE_BRANDING.primaryColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 30px 0; }
      .cta-button:hover { background: #d97706; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
      .code-box { background: #f3f4f6; padding: 15px; border-radius: 4px; font-family: monospace; text-align: center; margin: 20px 0; word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🔐 Password Reset</h1>
        <p>Secure Account Recovery</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        
        <p>We received a request to reset the password for your PULSE account.</p>

        <div class="warning-box">
          <strong>⚠️ Important:</strong> If you didn't request this, your account may be at risk. Please change your password immediately or contact support.
        </div>

        <p><strong>Reset your password by clicking the button below:</strong></p>
        
        <center>
          <a href="${resetLink}" class="cta-button">Reset Password</a>
        </center>

        <p><strong>Or copy this link:</strong></p>
        <div class="code-box">${resetLink}</div>

        <p style="color: #666; font-size: 14px;">
          <strong>This link expires in 24 hours.</strong><br>
          If you didn't request a password reset, please ignore this email.
        </p>

        <div class="footer">
          <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
          <p>For security, never share this email or link with anyone.</p>
        </div>
      </div>
    </div>
  </body>
</html>
    `,
  });
};

/**
 * PULSE Email Template: Welcome After Email Confirmation
 */
export const sendWelcomeActiveEmail = async (
  email: string,
  fullName: string,
  dashboardUrl: string
) => {
  return resend.emails.send({
    from: PULSE_BRANDING.from,
    to: email,
    subject: '🎉 Your Account is Active - Welcome to PULSE!',
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, ${PULSE_BRANDING.primaryColor}, #fbbf24); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 32px; }
      .content { background: white; padding: 40px; border-radius: 0 0 8px 8px; }
      .feature-box { background: ${PULSE_BRANDING.accentColor}; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid ${PULSE_BRANDING.primaryColor}; }
      .feature-box h3 { margin-top: 0; color: #1a1a1a; }
      .cta-button { display: inline-block; background: ${PULSE_BRANDING.primaryColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 30px 0; }
      .cta-button:hover { background: #d97706; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
      .stats { display: flex; justify-content: space-around; text-align: center; margin: 30px 0; }
      .stat { padding: 15px; }
      .stat-number { font-size: 24px; font-weight: bold; color: ${PULSE_BRANDING.primaryColor}; }
      .stat-label { font-size: 12px; color: #666; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Account Confirmed!</h1>
        <p>You're All Set to Start Investing</p>
      </div>
      <div class="content">
        <p class="welcome-text">Hi ${fullName},</p>
        
        <p>Congratulations! Your email has been confirmed and your PULSE account is now fully active.</p>

        <div class="stats">
          <div class="stat">
            <div class="stat-number">50</div>
            <div class="stat-label">USDT PULSE Bonus</div>
          </div>
          <div class="stat">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Platform Access</div>
          </div>
          <div class="stat">
            <div class="stat-number">Premium</div>
            <div class="stat-label">Features Unlocked</div>
          </div>
        </div>

        <p><strong>You can now:</strong></p>
        <ul>
          <li>Access your premium investment dashboard</li>
          <li>View exclusive market signals and insights</li>
          <li>Explore premium investment opportunities</li>
          <li>Manage your 50 USDT welcome bonus</li>
          <li>Connect with premium investor community</li>
        </ul>

        <center>
          <a href="${dashboardUrl}" class="cta-button">Go to Dashboard</a>
        </center>

        <div class="feature-box">
          <h3>🎯 Next Steps</h3>
          <p>
            1. <strong>Complete Your Profile</strong> - Add your investment preferences and interests<br>
            2. <strong>Enable Two-Factor Authentication</strong> - Secure your account<br>
            3. <strong>Explore Opportunities</strong> - Browse premium investment options<br>
            4. <strong>Start Earning</strong> - Begin your wealth-building journey
          </p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Need help? Our support team is available 24/7 at support@pulse-invest.app
        </p>

        <div class="footer">
          <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
          <p>Welcome to the premium investment experience.</p>
        </div>
      </div>
    </div>
  </body>
</html>
    `,
  });
};

/**
 * PULSE Email Template: Account Approved by Admin
 */
export const sendAccountApprovedEmail = async (
  email: string,
  fullName: string,
  dashboardUrl: string
) => {
  return resend.emails.send({
    from: PULSE_BRANDING.from,
    to: email,
    subject: '✅ Your Account Has Been Approved - Welcome to PULSE!',
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
      .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .header h1 { margin: 0; font-size: 32px; }
      .content { background: white; padding: 40px; border-radius: 0 0 8px 8px; }
      .approval-badge { text-align: center; margin: 30px 0; }
      .badge { font-size: 48px; }
      .cta-button { display: inline-block; background: ${PULSE_BRANDING.primaryColor}; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 30px 0; }
      .cta-button:hover { background: #d97706; }
      .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 30px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>✅ Account Approved!</h1>
        <p>You're Ready to Invest</p>
      </div>
      <div class="content">
        <p>Hi ${fullName},</p>
        
        <p>Great news! Your account has been approved by our team and you now have full access to all PULSE premium features.</p>

        <div class="approval-badge">
          <div class="badge">✨</div>
          <p style="font-size: 20px; color: #10b981; font-weight: 600;">Account Fully Activated</p>
        </div>

        <p><strong>You can now:</strong></p>
        <ul>
          <li>Access all premium investment opportunities</li>
          <li>Deposit and withdraw funds</li>
          <li>View exclusive market signals</li>
          <li>Participate in premium tier system</li>
          <li>Attend exclusive investor events</li>
        </ul>

        <center>
          <a href="${dashboardUrl}" class="cta-button">Access Your Dashboard</a>
        </center>

        <p>We're excited to have you as part of the PULSE premium investment community. Thank you for joining us!</p>

        <div class="footer">
          <p>© 2026 PULSE Investment Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
    `,
  });
};

export default resend;
