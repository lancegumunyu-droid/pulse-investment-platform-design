'use server'

import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'chief_admin' | 'approval_manager' | 'kyc_reviewer'

export const adminRolePermissions: Record<AdminRole, {
  canApproveUsers: boolean
  canApproveKyc: boolean
  canManageFloat: boolean
  canManageAdmins: boolean
  canManageAgents: boolean
  floatLimitUsd: number
  floatLimitPulse: number
}> = {
  chief_admin: {
    canApproveUsers: true,
    canApproveKyc: true,
    canManageFloat: true,
    canManageAdmins: true,
    canManageAgents: true,
    floatLimitUsd: 1000000,
    floatLimitPulse: 2000000,
  },
  approval_manager: {
    canApproveUsers: true,
    canApproveKyc: false,
    canManageFloat: true,
    canManageAdmins: false,
    canManageAgents: false,
    floatLimitUsd: 500000,
    floatLimitPulse: 1000000,
  },
  kyc_reviewer: {
    canApproveUsers: false,
    canApproveKyc: true,
    canManageFloat: false,
    canManageAdmins: false,
    canManageAgents: false,
    floatLimitUsd: 0,
    floatLimitPulse: 0,
  },
}

export async function getUserRole(userId: string): Promise<AdminRole | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return (data.role as AdminRole) || null
}

export async function checkPermission(userId: string, permission: keyof typeof adminRolePermissions['chief_admin']): Promise<boolean> {
  const role = await getUserRole(userId)
  if (!role) return false

  return adminRolePermissions[role][permission] as boolean
}

export async function allocateFloatToAgent(
  chiefAdminId: string,
  agentId: string,
  amountUsd: number,
  amountPulse: number,
  notes?: string
) {
  const supabase = await createClient()

  // Verify Chief Admin
  const isChiefAdmin = await checkPermission(chiefAdminId, 'canManageAgents')
  if (!isChiefAdmin) {
    throw new Error('Only Chief Admin can allocate float')
  }

  // Create allocation record
  const { data, error } = await supabase
    .from('float_allocation_history')
    .insert({
      from_admin_id: chiefAdminId,
      to_agent_id: agentId,
      amount_usd: amountUsd,
      amount_pulse: amountPulse,
      transaction_type: 'allocation',
      status: 'completed',
      notes,
    })

  if (error) throw error

  // Update agent available float
  await supabase
    .from('float_agents')
    .update({
      usd_available: supabase.rpc('increment_float', { agent_id: agentId, amount: amountUsd, type: 'usd' }),
      pulse_available: supabase.rpc('increment_float', { agent_id: agentId, amount: amountPulse, type: 'pulse' }),
    })
    .eq('id', agentId)

  return data
}

export async function approveP2PTransaction(
  chiefAdminId: string,
  transactionId: string,
  approved: boolean,
  rejectionReason?: string
) {
  const supabase = await createClient()

  // Verify Chief Admin
  const isChiefAdmin = await checkPermission(chiefAdminId, 'canManageAdmins')
  if (!isChiefAdmin) {
    throw new Error('Only Chief Admin can approve P2P transactions')
  }

  const { data, error } = await supabase
    .from('p2p_transactions')
    .update({
      status: approved ? 'approved' : 'rejected',
      approval_by: chiefAdminId,
      approved_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
    })
    .eq('id', transactionId)

  if (error) throw error
  return data
}
