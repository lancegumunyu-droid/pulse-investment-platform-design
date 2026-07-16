import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendPulseEmail({
  to,
  subject,
  html,
  from = 'noreply@pulse-invest.vercel.app',
}: EmailParams) {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error('[v0] Resend error:', response.error);
      throw new Error(response.error.message);
    }

    console.log('[v0] Email sent successfully:', response.data?.id);
    return response.data;
  } catch (error) {
    console.error('[v0] Failed to send email:', error);
    throw error;
  }
}

// Email template: Signup Verification
export function signupVerificationEmail(
  userName: string,
  verificationLink: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #f59e0b;
          }
          .logo {
            color: #f59e0b;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            color: #1a1a1a;
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
          }
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background: #f59e0b;
            color: #fff;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
            transition: all 0.3s ease;
          }
          .button:hover {
            background: #d97706;
            transform: translateY(-2px);
          }
          .button-container {
            text-align: center;
          }
          .alternative {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
          }
          .alternative-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
          }
          .code {
            font-family: 'Courier New', monospace;
            background: #fff;
            padding: 8px 12px;
            border-left: 3px solid #f59e0b;
            word-break: break-all;
            color: #f59e0b;
            font-weight: 600;
          }
          .footer {
            background: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
          .footer-links a {
            color: #f59e0b;
            text-decoration: none;
            margin: 0 15px;
          }
          .footer-divider {
            color: #ddd;
          }
          .security-note {
            background: #fff3cd;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">PULSE</h1>
            <p style="color: #999; margin: 8px 0 0 0; font-size: 14px;">Investment Platform</p>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome to <span class="highlight">PULSE</span>, ${userName}! 👋</div>
            
            <div class="message">
              Thank you for signing up. We&apos;re excited to have you join the investment community. 
              To complete your registration and unlock full access to PULSE, please verify your email address.
            </div>
            
            <div class="button-container">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <div class="security-note">
              <strong>Security Tip:</strong> If you didn&apos;t create this account, please ignore this email. 
              This link will expire in 24 hours.
            </div>
            
            <div class="alternative">
              <div class="alternative-title">Or copy and paste this link:</div>
              <div class="code">${verificationLink}</div>
            </div>
            
            <div class="message" style="margin-top: 40px; color: #999; font-size: 14px;">
              Once verified, you&apos;ll get:
              <br>✓ Full platform access
              <br>✓ Portfolio management
              <br>✓ Investment opportunities
              <br>✓ Real-time market updates
            </div>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 15px;">
              <strong style="color: #1a1a1a;">PULSE Investment Platform</strong>
            </div>
            <div class="footer-links">
              <a href="https://pulse-invest.vercel.app">Website</a>
              <span class="footer-divider">|</span>
              <a href="https://pulse-invest.vercel.app/support">Support</a>
              <span class="footer-divider">|</span>
              <a href="https://pulse-invest.vercel.app/privacy">Privacy</a>
            </div>
            <div style="margin-top: 15px; color: #bbb;">
              © 2026 PULSE Investment Platform. All rights reserved.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email template: Password Reset
export function passwordResetEmail(
  userName: string,
  resetLink: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid #f59e0b;
          }
          .logo {
            color: #f59e0b;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            color: #1a1a1a;
          }
          .alert {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .alert-title {
            color: #991b1b;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .alert-text {
            color: #7f1d1d;
            font-size: 14px;
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #555;
            margin-bottom: 30px;
          }
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background: #f59e0b;
            color: #fff;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            margin: 30px 0;
          }
          .button-container {
            text-align: center;
          }
          .code {
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 8px 12px;
            border-left: 3px solid #f59e0b;
            word-break: break-all;
            color: #f59e0b;
            font-weight: 600;
          }
          .footer {
            background: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">PULSE</h1>
            <p style="color: #999; margin: 8px 0 0 0; font-size: 14px;">Investment Platform</p>
          </div>
          
          <div class="content">
            <div class="alert">
              <div class="alert-title">🔒 Password Reset Request</div>
              <div class="alert-text">We received a request to reset your password. If you didn&apos;t make this request, please ignore this email.</div>
            </div>
            
            <div class="greeting">Hi ${userName},</div>
            
            <div class="message">
              Click the button below to reset your password. This link will expire in <span class="highlight">24 hours</span>.
            </div>
            
            <div class="button-container">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            
            <div class="message" style="margin-top: 40px; background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 14px;">
              <strong>Or paste this link:</strong>
              <div class="code" style="margin-top: 10px;">${resetLink}</div>
            </div>
            
            <div class="message" style="margin-top: 30px; color: #999; font-size: 13px;">
              <strong style="color: #1a1a1a;">For your security:</strong>
              <br>• Never share this link with anyone
              <br>• Use a strong, unique password
              <br>• Enable two-factor authentication if available
            </div>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 15px;">
              <strong style="color: #1a1a1a;">PULSE Investment Platform</strong>
            </div>
            <div>© 2026 PULSE. All rights reserved.</div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Email template: Welcome (After verification)
export function welcomeEmail(userName: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a1a;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 40px 20px;
            text-align: center;
          }
          .logo {
            color: #fff;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 2px;
            margin: 0;
          }
          .content {
            padding: 40px 30px;
            color: #1a1a1a;
          }
          .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
          }
          .feature-box {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
          }
          .feature-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          .feature-desc {
            color: #666;
            font-size: 14px;
            line-height: 1.5;
          }
          .cta-button {
            display: inline-block;
            background: #f59e0b;
            color: #fff;
            padding: 14px 40px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background: #f9f9f9;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">PULSE</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome to PULSE, ${userName}! 🎉</div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Your account has been successfully verified. You now have full access to PULSE and all its premium features.
            </p>
            
            <div class="feature-box">
              <div class="feature-title">📊 Portfolio Management</div>
              <div class="feature-desc">Track your investments in real-time with comprehensive analytics and performance metrics.</div>
            </div>
            
            <div class="feature-box">
              <div class="feature-title">💰 Investment Opportunities</div>
              <div class="feature-desc">Explore curated investment opportunities and diversify your portfolio with confidence.</div>
            </div>
            
            <div class="feature-box">
              <div class="feature-title">📈 Market Insights</div>
              <div class="feature-desc">Get real-time market updates and expert analysis to make informed investment decisions.</div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://pulse-invest.vercel.app/app" class="cta-button">Go to Dashboard</a>
            </div>
            
            <p style="margin-top: 40px; color: #999; font-size: 13px; line-height: 1.6;">
              <strong>Need help?</strong> Our support team is here for you. 
              <a href="https://pulse-invest.vercel.app/support" style="color: #f59e0b; text-decoration: none;">Contact support</a>
            </p>
          </div>
          
          <div class="footer">
            <div style="margin-bottom: 15px;">
              <strong style="color: #1a1a1a;">PULSE Investment Platform</strong>
            </div>
            <div>© 2026 PULSE. All rights reserved.</div>
          </div>
        </div>
      </body>
    </html>
  `;
}
