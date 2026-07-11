'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function getAdminFloat(adminId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_float')
    .select('id, admin_id, pulse_tokens_balance, usd_balance, updated_at')
    .eq('admin_id', adminId)
    .single()

  if (error && error.code === 'PGRST116') {
    // Not found - create initial float
    return createAdminFloat(adminId)
  }
  if (error) throw error
  return data
}

async function createAdminFloat(adminId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_float')
    .insert({
      admin_id: adminId,
      pulse_tokens_balance: 10000, // Starting PULSE tokens
      usd_balance: 10000, // Starting USD balance
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function depositToUserFromAdmin(
  adminId: string,
  userId: string,
  amount: number,
  currency: 'USD' | 'PULSE'
) {
  const supabase = await createClient()

  // Get admin float
  const adminFloat = await getAdminFloat(adminId)
  
  if (currency === 'USD' && adminFloat.usd_balance < amount) {
    throw new Error('Insufficient USD balance in admin float')
  }
  if (currency === 'PULSE' && adminFloat.pulse_tokens_balance < amount) {
    throw new Error('Insufficient PULSE tokens in admin float')
  }

  // Deduct from admin float
  const updateColumn = currency === 'USD' ? 'usd_balance' : 'pulse_tokens_balance'
  await supabase.rpc('decrement_admin_float', {
    admin_id: adminId,
    column: updateColumn,
    amount: amount,
  })

  // Add to user balance
  await supabase.rpc('increment_user_balance', {
    user_id: userId,
    column: currency === 'USD' ? 'usd_balance' : 'pulse_tokens_balance',
    amount: amount,
  })

  // Log transaction
  await supabase.from('deposit_requests').insert({
    user_id: userId,
    amount: amount,
    currency: currency,
    status: 'completed',
    processed_by: adminId,
    processed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  })

  revalidateTag(`user-${userId}`)
  revalidateTag(`admin-${adminId}`)
}

export async function topUpAdminFloat(
  adminId: string,
  usdAmount?: number,
  pulseAmount?: number,
  notes?: string
) {
  const supabase = await createClient()
  
  const updates: any = { updated_at: new Date().toISOString() }
  
  if (usdAmount) {
    updates.usd_balance = { increment: usdAmount }
  }
  if (pulseAmount) {
    updates.pulse_tokens_balance = { increment: pulseAmount }
  }

  const { data, error } = await supabase
    .from('admin_float')
    .update(updates)
    .eq('admin_id', adminId)
    .select()
    .single()

  if (error) throw error

  // Log topup
  await supabase.from('admin_approvals').insert({
    admin_id: adminId,
    action: 'float_topup',
    reason: `USD: +${usdAmount || 0}, PULSE: +${pulseAmount || 0}. Notes: ${notes || ''}`,
    created_at: new Date().toISOString(),
  })

  revalidateTag(`admin-${adminId}`)
  return data
}
