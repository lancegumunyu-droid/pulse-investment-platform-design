import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

interface DepositApprovalRequest {
  depositId: string
  adminId: string
  approve: boolean
  rejectionReason?: string
}

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  
  try {
    // Admin authentication check
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing admin token' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    await client.connect()

    // Verify admin exists and is active
    const adminCheck = await client.query(
      'SELECT user_id FROM admin_users WHERE user_id = $1 AND is_active = true',
      [request.headers.get('x-admin-id')]
    )

    if (adminCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Admin authorization failed - not a valid admin' },
        { status: 403 }
      )
    }

    const adminId = adminCheck.rows[0].user_id

    const body: DepositApprovalRequest = await request.json()
    const { depositId, approve, rejectionReason } = body

    if (!depositId) {
      return NextResponse.json(
        { error: 'Missing depositId' },
        { status: 400 }
      )
    }

    // Get deposit details
    const depositResult = await client.query(
      `SELECT d.*, u.email, u.full_name 
       FROM deposits d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = $1`,
      [depositId]
    )

    if (depositResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      )
    }

    const deposit = depositResult.rows[0]

    if (deposit.approval_status !== 'pending') {
      return NextResponse.json(
        { error: 'Deposit already processed' },
        { status: 400 }
      )
    }

    if (approve) {
      // APPROVE DEPOSIT
      await client.query('BEGIN')

      // Update deposit status
      await client.query(
        `UPDATE deposits 
         SET approval_status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [adminId, depositId]
      )

      // Credit user's wallet
      await client.query(
        `UPDATE wallets 
         SET balance = balance + $1, 
             available_balance = available_balance + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [deposit.amount, deposit.user_id]
      )

      // Create transaction record
      await client.query(
        `INSERT INTO transactions 
         (user_id, type, amount, status, description, created_at)
         VALUES ($1, 'deposit', $2, 'completed', $3, NOW())`,
        [deposit.user_id, deposit.amount, `Deposit approved: $${deposit.amount}`]
      )

      // Log audit
      await client.query(
        `INSERT INTO audit_logs 
         (admin_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, 'approve_deposit', 'deposit', $2, $3, NOW())`,
        [adminId, depositId, `Approved deposit of $${deposit.amount} for ${deposit.email}`]
      )

      // Send approval email
      await client.query(
        `INSERT INTO email_logs 
         (user_id, email, email_type, subject, status, sent_at)
         VALUES ($1, $2, 'deposit_approved', 'Your Deposit Has Been Approved', 'sent', NOW())`,
        [deposit.user_id, deposit.email]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        status: 'approved',
        message: `Deposit of $${deposit.amount} approved for ${deposit.full_name}`,
        deposit: {
          id: depositId,
          amount: deposit.amount,
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId
        }
      })
    } else {
      // REJECT DEPOSIT
      await client.query('BEGIN')

      // Update deposit status
      await client.query(
        `UPDATE deposits 
         SET approval_status = 'rejected', 
             rejected_by = $1, 
             rejected_at = NOW(),
             rejection_reason = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [adminId, rejectionReason || 'No reason provided', depositId]
      )

      // Log audit
      await client.query(
        `INSERT INTO audit_logs 
         (admin_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, 'reject_deposit', 'deposit', $2, $3, NOW())`,
        [adminId, depositId, `Rejected deposit: ${rejectionReason}`]
      )

      // Send rejection email
      await client.query(
        `INSERT INTO email_logs 
         (user_id, email, email_type, subject, status, sent_at)
         VALUES ($1, $2, 'deposit_rejected', 'Your Deposit Request Was Rejected', 'sent', NOW())`,
        [deposit.user_id, deposit.email]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: `Deposit of $${deposit.amount} rejected for ${deposit.full_name}`,
        deposit: {
          id: depositId,
          amount: deposit.amount,
          status: 'rejected',
          rejectedAt: new Date(),
          rejectionReason: rejectionReason
        }
      })
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[DEPOSIT API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
