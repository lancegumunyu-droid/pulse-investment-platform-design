import * as React from 'react';

export const WelcomeEmail = ({ fullName, email, confirmLink, pulseTokens = 50 }: {
  fullName: string;
  email: string;
  confirmLink: string;
  pulseTokens?: number;
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#0f0f12', color: '#e5e5ea', padding: '20px' }}>
    {/* Header */}
    <div style={{ 
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      padding: '30px',
      textAlign: 'center',
      borderRadius: '12px 12px 0 0'
    }}>
      <h1 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
        Welcome to Pulse
      </h1>
      <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
        Your Investment Journey Starts Here
      </p>
    </div>

    {/* Main Content */}
    <div style={{ 
      background: '#1a1a1e',
      padding: '40px',
      borderRadius: '0 0 12px 12px'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#f59e0b' }}>
        Hello {fullName}!
      </h2>

      <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        Thank you for joining <strong>Pulse</strong> – the ultimate investment platform for sophisticated investors.
      </p>

      {/* Promotional Badge */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        border: '2px solid #f59e0b',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>
          🎁 Welcome Bonus
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
          {pulseTokens} USDT
        </div>
        <div style={{ fontSize: '14px', color: '#a0aec0' }}>
          in PULSE Promotional Tokens
        </div>
        <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
          Non-withdrawable until your first deposit • Fully withdrawable after
        </div>
      </div>

      {/* What You Get */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#f59e0b', marginBottom: '16px' }}>What You Can Do Now:</h3>
        <ul style={{ 
          listStyle: 'none', 
          padding: '0', 
          margin: '0',
          color: '#e5e5ea'
        }}>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
            ✓ <strong>View Investments</strong> – Explore our portfolio of premium investment opportunities
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
            ✓ <strong>Understand Our Tiers</strong> – See how you can grow with us
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>
            ✓ <strong>Track Your PULSE Tokens</strong> – {pulseTokens} USDT worth waiting for you
          </li>
          <li style={{ padding: '10px 0' }}>
            ✓ <strong>Complete KYC</strong> – Unlock deposits and full platform access
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <a href={confirmLink} style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#fff',
          padding: '16px 40px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '16px',
          border: 'none',
          cursor: 'pointer'
        }}>
          Confirm Email & Access Dashboard
        </a>
      </div>

      <p style={{ fontSize: '12px', color: '#718096', textAlign: 'center', marginBottom: '20px' }}>
        Or copy this link: {confirmLink}
      </p>

      {/* Token Info */}
      <div style={{
        background: 'rgba(100, 116, 139, 0.2)',
        borderLeft: '4px solid #f59e0b',
        padding: '16px',
        borderRadius: '4px',
        marginBottom: '30px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        <strong style={{ color: '#f59e0b' }}>About Your PULSE Tokens:</strong>
        <p style={{ margin: '8px 0 0 0', color: '#cbd5e0' }}>
          Your {pulseTokens} USDT promotional tokens are a gift from Pulse to get you started. These tokens represent real value and can be used for investments once you complete KYC and make your first deposit. Think of it as a head start to building wealth with us!
        </p>
      </div>

      {/* Next Steps */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '18px', color: '#f59e0b', marginBottom: '12px' }}>Your Next Steps:</h3>
        <ol style={{ 
          paddingLeft: '20px',
          color: '#e5e5ea',
          lineHeight: '1.8'
        }}>
          <li>Confirm your email by clicking the button above</li>
          <li>Access your dashboard and explore investment opportunities</li>
          <li>Complete KYC verification (upload ID + Address)</li>
          <li>Make your first deposit to unlock your {pulseTokens} USDT bonus</li>
          <li>Start investing and growing your wealth!</li>
        </ol>
      </div>

      {/* Security Note */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        borderLeft: '4px solid #3b82f6',
        padding: '16px',
        borderRadius: '4px',
        marginBottom: '30px',
        fontSize: '13px'
      }}>
        <strong style={{ color: '#3b82f6' }}>🔒 Security Reminder:</strong>
        <p style={{ margin: '8px 0 0 0', color: '#cbd5e0' }}>
          Never share your login credentials. The Pulse team will never ask for your password via email.
        </p>
      </div>
    </div>

    {/* Footer */}
    <div style={{
      background: '#0f0f12',
      padding: '20px',
      textAlign: 'center',
      fontSize: '12px',
      color: '#718096',
      borderTop: '1px solid #333'
    }}>
      <p style={{ margin: '0 0 8px 0' }}>
        Questions? Our support team is here to help.
      </p>
      <p style={{ margin: '0' }}>
        © 2026 Pulse Investment Platform. All rights reserved.
      </p>
      <p style={{ margin: '8px 0 0 0', fontSize: '11px' }}>
        <a href="#" style={{ color: '#f59e0b', textDecoration: 'none' }}>Terms of Service</a> • 
        <a href="#" style={{ color: '#f59e0b', textDecoration: 'none' }}> Privacy Policy</a> • 
        <a href="#" style={{ color: '#f59e0b', textDecoration: 'none' }}> Contact Us</a>
      </p>
    </div>
  </div>
);

export default WelcomeEmail;
