import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db/neon-client'
import { PulseEmailService } from '@/lib/email/pulse-email-service'

// Step 3: Admin Approval
// POST /api/launch/step3-admin-approve
// Admin approves KYC, user gets $35 welcome bonus, can now deposit

interface AdminApproveRequest {
  userId: string
  adminId: string
  approve: boolean
  rejectionReason?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: AdminApproveRequest = await request.json()
    const { userId, adminId, approve, rejectionReason } = body

    if (!userId || !adminId) {
      return NextResponse.json({ error: 'Missing user or admin ID' }, { status: 400 })
    }

    // Verify admin is actually an admin
    const adminCheck = await sql`
      SELECT id FROM admin_users WHERE user_id = ${adminId} AND is_active = true
    `

    if (adminCheck.length === 0) {
      return NextResponse.json({ error: 'Admin authorization failed' }, { status: 403 })
    }

    // Get user details
    const users = await sql`
      SELECT id, email, full_name, kyc_status FROM users WHERE id = ${userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    if (approve) {
      // APPROVE KYC

      // 1. Update user KYC status
      await sql`
        UPDATE users
        SET 
          kyc_status = 'verified',
          kyc_approved_at = NOW(),
          kyc_approved_by = ${adminId}
        WHERE id = ${userId}
      `

      // 2. Update approval queue
      await sql`
        UPDATE approval_queues
        SET status = 'approved'
        WHERE entity_id = ${userId} AND entity_type = 'kyc'
      `

      // 3. Send KYC approved email
      await PulseEmailService.sendKYCApprovedEmail(user.email, user.full_name)

      // 4. Log audit
      await sql`
        INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes)
        VALUES (
          ${adminId},
          'kyc_approved',
          'users',
          ${userId},
          jsonb_build_object('kyc_status', 'verified', 'timestamp', NOW())
        )
      `

      // 5. Create welcome bonus transaction
      const wallets = await sql`
        SELECT id FROM wallets WHERE user_id = ${userId}
      `

      if (wallets.length > 0) {
        await sql`
          INSERT INTO transactions (
            user_id,
            wallet_id,
            type,
            amount,
            status,
            approval_status,
            description
          ) VALUES (
            ${userId},
            ${wallets[0].id},
            'welcome_bonus',
            35.00,
            'completed',
            'approved',
            'Welcome bonus for new member'
          )
        `
      }

      return NextResponse.json({
        success: true,
        status: 'approved',
        message: 'KYC approved. User now has deposit access.',
        user: {
          id: user.id,
          email: user.email,
          kycStatus: 'verified',
          welcomeBonus: 35,
        },
      }, { status: 200 })
    } else {
      // REJECT KYC

      if (!rejectionReason) {
        return NextResponse.json({ error: 'Rejection reason required' }, { status: 400 })
      }

      // 1. Update user KYC status
      await sql`
        UPDATE users
        SET 
          kyc_status = 'rejected',
          kyc_approved_at = NOW(),
          kyc_approved_by = ${adminId}
        WHERE id = ${userId}
      `

      // 2. Update approval queue
      await sql`
        UPDATE approval_queues
        SET status = 'rejected'
        WHERE entity_id = ${userId} AND entity_type = 'kyc'
      `

      // 3. Log audit
      await sql`
        INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, changes)
        VALUES (
          ${adminId},
          'kyc_rejected',
          'users',
          ${userId},
          jsonb_build_object('kyc_status', 'rejected', 'reason', ${rejectionReason}, 'timestamp', NOW())
        )
      `

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: 'KYC rejected.',
        reason: rejectionReason,
      }, { status: 200 })
    }
  } catch (error) {
    console.error('[PULSE API] Admin approval error:', error)
    return NextResponse.json({ error: 'Approval failed' }, { status: 500 })
  }
}
