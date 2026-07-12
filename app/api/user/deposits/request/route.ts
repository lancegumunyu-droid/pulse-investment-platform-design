import { NextRequest, NextResponse } from 'next/server'
import { Client } from 'pg'

interface DepositRequestBody {
  userId: string
  amount: number
  paymentMethod: 'card' | 'bank' | 'crypto'
  currency?: string
}

export async function POST(request: NextRequest) {
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL })
  
  try {
    await client.connect()

    const body: DepositRequestBody = await request.json()
    const { userId, amount, paymentMethod, currency } = body

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit request - amount must be greater than 0' },
        { status: 400 }
      )
    }

    if (amount > 100000) {
      return NextResponse.json(
        { error: 'Deposit amount exceeds maximum limit of $100,000' },
        { status: 400 }
      )
    }

    // Verify user exists
    const userResult = await client.query(
      'SELECT id, email, full_name, kyc_status FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    // Check KYC status - must be verified
    if (user.kyc_status !== 'verified') {
      return NextResponse.json(
        { error: 'KYC verification required before depositing' },
        { status: 403 }
      )
    }

    // Create deposit request (requires admin approval)
    const depositResult = await client.query(
      `INSERT INTO deposits 
       (user_id, amount, payment_method, currency, approval_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
       RETURNING id, amount, approval_status, created_at`,
      [userId, amount, paymentMethod, currency || 'USD']
    )

    const deposit = depositResult.rows[0]

    // Log request
    await client.query(
      `INSERT INTO email_logs 
       (user_id, email, email_type, subject, status, sent_at)
       VALUES ($1, $2, 'deposit_requested', 'Deposit Request Received', 'sent', NOW())`,
      [userId, user.email]
    )

    // Notify admin in audit log
    await client.query(
      `INSERT INTO audit_logs 
       (action, entity_type, entity_id, details, created_at)
       VALUES ('deposit_requested', 'deposit', $1, $2, NOW())`,
      [deposit.id, `Deposit request: $${amount} from ${user.email} - AWAITING ADMIN APPROVAL`]
    )

    return NextResponse.json({
      success: true,
      message: 'Deposit request submitted. Admin approval required.',
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        currency: currency || 'USD',
        paymentMethod,
        status: 'pending', // MUST WAIT FOR ADMIN
        createdAt: deposit.created_at,
        note: 'Your deposit is pending admin approval. No funds are accessible until approved.'
      }
    }, { status: 201 })
  } catch (error) {
    console.error('[DEPOSIT REQUEST] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.end()
  }
}
