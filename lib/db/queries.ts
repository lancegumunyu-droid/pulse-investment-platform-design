import 'server-only'
import { serviceClient } from '@/lib/pulse/service'

// Profiles
export async function getProfile(userId: string) {
  const db = serviceClient()
  const { data, error } = await db.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('profiles').update(updates).eq('id', userId).select().single()
  if (error) throw error
  return data
}

// Accounts
export async function getAccount(userId: string) {
  const db = serviceClient()
  const { data, error } = await db.from('accounts').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function createAccount(userId: string, initialData = {}) {
  const db = serviceClient()
  const { data, error } = await db.from('accounts').insert({ user_id: userId, ...initialData }).select().single()
  if (error) throw error
  return data
}

// Admin Float
export async function getAdminFloat(adminId: string) {
  const db = serviceClient()
  const { data, error } = await db.from('admin_float').select('*').eq('admin_id', adminId).maybeSingle()
  if (error) throw error
  return data
}

export async function updateAdminFloat(adminId: string, updates: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('admin_float').update(updates).eq('admin_id', adminId).select().single()
  if (error) throw error
  return data
}

// KYC Submissions
export async function getKycSubmissions(userId?: string) {
  const db = serviceClient()
  let query = db.from('kyc_submissions').select('*')
  if (userId) {
    query = query.eq('user_id', userId)
  }
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getPendingKycSubmissions() {
  const db = serviceClient()
  const { data, error } = await db
    .from('kyc_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateKycSubmission(id: string, updates: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('kyc_submissions').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// Transactions
export async function getTransactions(userId: string, limit = 50) {
  const db = serviceClient()
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function createTransaction(transaction: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('transactions').insert(transaction).select().single()
  if (error) throw error
  return data
}

// Notifications
export async function getNotifications(userId: string, unreadOnly = false) {
  const db = serviceClient()
  let query = db.from('notifications').select('*').eq('user_id', userId)
  if (unreadOnly) {
    query = query.eq('read', false)
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(50)
  if (error) throw error
  return data || []
}

export async function markNotificationAsRead(id: string) {
  const db = serviceClient()
  const { error } = await db.from('notifications').update({ read: true }).eq('id', id)
  if (error) throw error
}

export async function createNotification(notification: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('notifications').insert(notification).select().single()
  if (error) throw error
  return data
}

// Withdrawals
export async function getPendingWithdrawals() {
  const db = serviceClient()
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getUserWithdrawals(userId: string) {
  const db = serviceClient()
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'withdrawal')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Approvals
export async function getPendingApprovals() {
  const db = serviceClient()
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// Admin Actions (Audit Log)
export async function createAdminAction(action: Record<string, any>) {
  const db = serviceClient()
  const { data, error } = await db.from('admin_actions').insert(action).select().single()
  if (error) throw error
  return data
}

export async function getAdminAuditLog(adminId?: string, limit = 100) {
  const db = serviceClient()
  let query = db.from('admin_actions').select('*')
  if (adminId) {
    query = query.eq('admin_id', adminId)
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data || []
}
