import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

interface WithdrawalRequestBody {
  userId: string
  amount: number
  withdrawalMethod: 'bank' | 'crypto'
  bankDetails?: {
    accountNumber: string
    routingNumber: string
    accountName: string
  }
  cryptoDetails?: {
    walletAddress: string
    cryptoType: string
  }
}

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  
  try {
    await client.connect()

    const body: WithdrawalRequestBody = await request.json()
    const { userId, amount, withdrawalMethod } = body

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid withdrawal request - amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify user exists
    const userResult = await client.query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    // Check wallet balance
    const walletResult = await client.query(
      'SELECT balance, available_balance FROM wallets WHERE user_id = $1',
      [userId]
    )

    if (walletResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const wallet = walletResult.rows[0]

    if (wallet.available_balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${wallet.available_balance}` },
        { status: 400 }
      )
    }

    // Lock funds immediately (reduce available_balance)
    await client.query(
      'BEGIN'
    )

    // Reduce available balance (funds are locked pending approval)
    await client.query(
      `UPDATE wallets 
       SET available_balance = available_balance - $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [amount, userId]
    )

    // Create withdrawal request (requires admin approval)
    const withdrawalResult = await client.query(
      `INSERT INTO withdrawals 
       (user_id, amount, withdrawal_method, approval_status, created_at, updated_at)
       VALUES ($1, $2, $3, 'pending', NOW(), NOW())
       RETURNING id, amount, approval_status, created_at`,
      [userId, amount, withdrawalMethod]
    )

    const withdrawal = withdrawalResult.rows[0]

    // Log request
    await client.query(
      `INSERT INTO email_logs 
       (user_id, email, email_type, subject, status, sent_at)
       VALUES ($1, $2, 'withdrawal_requested', 'Withdrawal Request Submitted', 'sent', NOW())`,
      [userId, user.email]
    )

    // Notify admin in audit log
    await client.query(
      `INSERT INTO audit_logs 
       (action, entity_type, entity_id, details, created_at)
       VALUES ('withdrawal_requested', 'withdrawal', $1, $2, NOW())`,
      [withdrawal.id, `Withdrawal request: $${amount} from ${user.email} - AWAITING ADMIN APPROVAL`]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted. Admin approval required.',
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        withdrawalMethod,
        status: 'pending', // MUST WAIT FOR ADMIN
        createdAt: withdrawal.created_at,
        lockedFunds: amount,
        remainingBalance: wallet.available_balance - amount,
        note: 'Your withdrawal is pending admin approval. Funds are locked and cannot be used until approval or rejection.'
      }
    }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('[WITHDRAWAL REQUEST] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
