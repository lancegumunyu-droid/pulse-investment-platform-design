import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

interface WithdrawalApprovalRequest {
  withdrawalId: string
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

    const body: WithdrawalApprovalRequest = await request.json()
    const { withdrawalId, approve, rejectionReason } = body

    if (!withdrawalId) {
      return NextResponse.json(
        { error: 'Missing withdrawalId' },
        { status: 400 }
      )
    }

    // Get withdrawal details
    const withdrawalResult = await client.query(
      `SELECT w.*, u.email, u.full_name 
       FROM withdrawals w 
       JOIN users u ON w.user_id = u.id 
       WHERE w.id = $1`,
      [withdrawalId]
    )

    if (withdrawalResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      )
    }

    const withdrawal = withdrawalResult.rows[0]

    if (withdrawal.approval_status !== 'pending') {
      return NextResponse.json(
        { error: 'Withdrawal already processed' },
        { status: 400 }
      )
    }

    // Check user has sufficient balance
    const walletResult = await client.query(
      'SELECT available_balance FROM wallets WHERE user_id = $1',
      [withdrawal.user_id]
    )

    if (walletResult.rows.length === 0 || walletResult.rows[0].available_balance < withdrawal.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance for withdrawal' },
        { status: 400 }
      )
    }

    if (approve) {
      // APPROVE WITHDRAWAL
      await client.query('BEGIN')

      // Update withdrawal status
      await client.query(
        `UPDATE withdrawals 
         SET approval_status = 'approved', 
             approved_by = $1, 
             approved_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [adminId, withdrawalId]
      )

      // Debit user's wallet
      await client.query(
        `UPDATE wallets 
         SET balance = balance - $1, 
             available_balance = available_balance - $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [withdrawal.amount, withdrawal.user_id]
      )

      // Create transaction record
      await client.query(
        `INSERT INTO transactions 
         (user_id, type, amount, status, description, created_at)
         VALUES ($1, 'withdrawal', $2, 'completed', $3, NOW())`,
        [withdrawal.user_id, withdrawal.amount, `Withdrawal approved: $${withdrawal.amount}`]
      )

      // Log audit
      await client.query(
        `INSERT INTO audit_logs 
         (admin_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, 'approve_withdrawal', 'withdrawal', $2, $3, NOW())`,
        [adminId, withdrawalId, `Approved withdrawal of $${withdrawal.amount} for ${withdrawal.email}`]
      )

      // Send approval email
      await client.query(
        `INSERT INTO email_logs 
         (user_id, email, email_type, subject, status, sent_at)
         VALUES ($1, $2, 'withdrawal_approved', 'Your Withdrawal Has Been Approved', 'sent', NOW())`,
        [withdrawal.user_id, withdrawal.email]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        status: 'approved',
        message: `Withdrawal of $${withdrawal.amount} approved for ${withdrawal.full_name}`,
        withdrawal: {
          id: withdrawalId,
          amount: withdrawal.amount,
          status: 'approved',
          approvedAt: new Date(),
          approvedBy: adminId
        }
      })
    } else {
      // REJECT WITHDRAWAL
      await client.query('BEGIN')

      // Update withdrawal status
      await client.query(
        `UPDATE withdrawals 
         SET approval_status = 'rejected', 
             rejected_by = $1, 
             rejected_at = NOW(),
             rejection_reason = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [adminId, rejectionReason || 'No reason provided', withdrawalId]
      )

      // Restore balance to available
      await client.query(
        `UPDATE wallets 
         SET available_balance = available_balance + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [withdrawal.amount, withdrawal.user_id]
      )

      // Log audit
      await client.query(
        `INSERT INTO audit_logs 
         (admin_id, action, entity_type, entity_id, details, created_at)
         VALUES ($1, 'reject_withdrawal', 'withdrawal', $2, $3, NOW())`,
        [adminId, withdrawalId, `Rejected withdrawal: ${rejectionReason}`]
      )

      // Send rejection email
      await client.query(
        `INSERT INTO email_logs 
         (user_id, email, email_type, subject, status, sent_at)
         VALUES ($1, $2, 'withdrawal_rejected', 'Your Withdrawal Request Was Rejected', 'sent', NOW())`,
        [withdrawal.user_id, withdrawal.email]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        status: 'rejected',
        message: `Withdrawal of $${withdrawal.amount} rejected for ${withdrawal.full_name}`,
        withdrawal: {
          id: withdrawalId,
          amount: withdrawal.amount,
          status: 'rejected',
          rejectedAt: new Date(),
          rejectionReason: rejectionReason
        }
      })
    }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[WITHDRAWAL API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
