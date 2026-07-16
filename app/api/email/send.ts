import { NextRequest, NextResponse } from 'next/server';
import {
  sendPulseEmail,
  signupVerificationEmail,
  passwordResetEmail,
  welcomeEmail,
} from '@/lib/resend-email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, userName, verificationLink, resetLink } = body;

    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'signup_verification':
        if (!userName || !verificationLink) {
          return NextResponse.json(
            { error: 'Missing: userName, verificationLink' },
            { status: 400 }
          );
        }
        subject = 'Verify Your PULSE Account';
        html = signupVerificationEmail(userName, verificationLink);
        break;

      case 'password_reset':
        if (!userName || !resetLink) {
          return NextResponse.json(
            { error: 'Missing: userName, resetLink' },
            { status: 400 }
          );
        }
        subject = 'Reset Your PULSE Password';
        html = passwordResetEmail(userName, resetLink);
        break;

      case 'welcome':
        if (!userName) {
          return NextResponse.json(
            { error: 'Missing: userName' },
            { status: 400 }
          );
        }
        subject = 'Welcome to PULSE Investment Platform';
        html = welcomeEmail(userName);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    const result = await sendPulseEmail({
      to,
      subject,
      html,
      from: 'noreply@pulse-invest.vercel.app',
    });

    return NextResponse.json({
      success: true,
      messageId: result?.id,
      type,
      to,
    });
  } catch (error) {
    console.error('[v0] Email API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
