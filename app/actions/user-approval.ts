'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function getUserApprovalStatus(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('approval_status, kyc_status, pulse_tokens_balance, email_confirmed')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function confirmUserEmail(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ email_confirmed: true, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  revalidateTag(`user-${userId}`)
  return data
}

export async function approveUser(userId: string, adminId: string) {
  const supabase = await createClient()
  
  // Update user approval status
  const { data: userData, error: updateError } = await supabase
    .from('profiles')
    .update({ 
      approval_status: 'approved', 
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single()

  if (updateError) throw updateError

  // Log approval action
  await supabase.from('admin_approvals').insert({
    user_id: userId,
    admin_id: adminId,
    action: 'approved',
    created_at: new Date().toISOString(),
  })

  revalidateTag(`user-${userId}`)
  revalidateTag('pending-approvals')
  return userData
}

export async function rejectUser(userId: string, adminId: string, reason?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      approval_status: 'rejected', 
      rejection_reason: reason,
      rejected_by: adminId,
      rejected_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error

  await supabase.from('admin_approvals').insert({
    user_id: userId,
    admin_id: adminId,
    action: 'rejected',
    reason: reason,
    created_at: new Date().toISOString(),
  })

  revalidateTag(`user-${userId}`)
  revalidateTag('pending-approvals')
  return data
}

export async function getPendingApprovals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, approval_status, email_confirmed, created_at, pulse_tokens_balance')
    .eq('approval_status', 'pending')
    .eq('email_confirmed', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
