'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function reviewKycSubmission(
  kycId: string,
  status: 'approved' | 'rejected',
  notes?: string
) {
  const supabase = createServerComponentClient({ cookies })

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update KYC submission with staff review
  const { error } = await supabase
    .from('kyc_submissions')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq('id', kycId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/kyc')
  return { success: true }
}

export async function processTransaction(
  transactionId: string,
  status: 'completed' | 'failed',
  notes?: string
) {
  const supabase = createServerComponentClient({ cookies })

  // Get current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Update transaction with staff processing
  const { error } = await supabase
    .from('transactions')
    .update({
      status,
      processed_by: user.id,
      processed_at: new Date().toISOString(),
      notes: notes || null,
    })
    .eq('id', transactionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/transactions')
  return { success: true }
}
