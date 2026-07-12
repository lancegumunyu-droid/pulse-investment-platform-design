import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET(request: NextRequest) {
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

    const adminId = request.headers.get('x-admin-id')
    
    await client.connect()

    // Verify admin exists and is active
    const adminCheck = await client.query(
      'SELECT user_id FROM admin_users WHERE user_id = $1 AND is_active = true',
      [adminId]
    )

    if (adminCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Admin authorization failed' },
        { status: 403 }
      )
    }

    // Get pending deposits
    const depositsResult = await client.query(`
      SELECT 
        d.id,
        d.user_id,
        d.amount,
        d.payment_method,
        d.currency,
        d.approval_status,
        d.created_at,
        u.email,
        u.full_name,
        u.kyc_status
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.approval_status = 'pending'
      ORDER BY d.created_at DESC
    `)

    // Get pending withdrawals
    const withdrawalsResult = await client.query(`
      SELECT 
        w.id,
        w.user_id,
        w.amount,
        w.withdrawal_method,
        w.approval_status,
        w.created_at,
        u.email,
        u.full_name,
        wallet.balance,
        wallet.available_balance
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      JOIN wallets wallet ON u.id = wallet.user_id
      WHERE w.approval_status = 'pending'
      ORDER BY w.created_at DESC
    `)

    return NextResponse.json({
      success: true,
      pendingDeposits: {
        count: depositsResult.rows.length,
        totalAmount: depositsResult.rows.reduce((sum, d) => sum + parseFloat(d.amount), 0),
        requests: depositsResult.rows.map(d => ({
          id: d.id,
          userId: d.user_id,
          email: d.email,
          fullName: d.full_name,
          amount: parseFloat(d.amount),
          currency: d.currency,
          paymentMethod: d.payment_method,
          kycStatus: d.kyc_status,
          submittedAt: d.created_at
        }))
      },
      pendingWithdrawals: {
        count: withdrawalsResult.rows.length,
        totalAmount: withdrawalsResult.rows.reduce((sum, w) => sum + parseFloat(w.amount), 0),
        requests: withdrawalsResult.rows.map(w => ({
          id: w.id,
          userId: w.user_id,
          email: w.email,
          fullName: w.full_name,
          amount: parseFloat(w.amount),
          withdrawalMethod: w.withdrawal_method,
          userBalance: parseFloat(w.balance),
          availableBalance: parseFloat(w.available_balance),
          submittedAt: w.created_at
        }))
      },
      totalPending: {
        deposits: depositsResult.rows.length,
        withdrawals: withdrawalsResult.rows.length,
        total: depositsResult.rows.length + withdrawalsResult.rows.length
      }
    })
  } catch (error) {
    console.error('[PENDING REQUESTS] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
