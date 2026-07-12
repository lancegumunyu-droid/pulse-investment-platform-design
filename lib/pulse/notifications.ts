import 'server-only'
import { serviceClient } from './service'

export interface Notification {
  id: string
  user_id: string
  type: 'kyc_approved' | 'kyc_rejected' | 'withdrawal_approved' | 'withdrawal_rejected' | 'yield_disbursed' | 'admin_alert'
  title: string
  message: string
  read: boolean
  created_at: string
  action_url?: string
}

export async function createNotification(userId: string, notification: Omit<Notification, 'id' | 'created_at'>) {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('notifications')
      .insert({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        action_url: notification.action_url || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Error creating notification:', error)
      return null
    }

    return data as Notification
  } catch (err) {
    console.error('[v0] Exception in createNotification:', err)
    return null
  }
}

export async function getUserNotifications(userId: string, limit = 20) {
  try {
    const db = serviceClient()
    const { data, error } = await db
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[v0] Error fetching notifications:', error)
      return []
    }

    return (data || []) as Notification[]
  } catch (err) {
    console.error('[v0] Exception in getUserNotifications:', err)
    return []
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const db = serviceClient()
    const { error } = await db
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('[v0] Error marking notification as read:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('[v0] Exception in markNotificationAsRead:', err)
    return false
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const db = serviceClient()
    const { count, error } = await db
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('[v0] Error getting unread count:', error)
      return 0
    }

    return count || 0
  } catch (err) {
    console.error('[v0] Exception in getUnreadNotificationCount:', err)
    return 0
  }
}

export async function notifyKycApproved(userId: string) {
  return createNotification(userId, {
    type: 'kyc_approved',
    title: 'KYC Verified',
    message: 'Your KYC documentation has been approved. Your account is now fully activated.',
    read: false,
    action_url: '/app/dashboard',
  })
}

export async function notifyKycRejected(userId: string, reason: string) {
  return createNotification(userId, {
    type: 'kyc_rejected',
    title: 'KYC Rejected',
    message: `Your KYC documentation was rejected. Reason: ${reason}. Please resubmit with corrected documents.`,
    read: false,
    action_url: '/kyc',
  })
}

export async function notifyWithdrawalApproved(userId: string, amount: number) {
  return createNotification(userId, {
    type: 'withdrawal_approved',
    title: 'Withdrawal Processed',
    message: `Your withdrawal request of $${amount.toLocaleString()} has been approved and processed.`,
    read: false,
    action_url: '/app/transactions',
  })
}

export async function notifyWithdrawalRejected(userId: string, amount: number) {
  return createNotification(userId, {
    type: 'withdrawal_rejected',
    title: 'Withdrawal Rejected',
    message: `Your withdrawal request of $${amount.toLocaleString()} has been rejected. Funds have been refunded to your account.`,
    read: false,
    action_url: '/app/wallet',
  })
}

export async function notifyYieldDisbursed(userId: string, amount: number) {
  return createNotification(userId, {
    type: 'yield_disbursed',
    title: 'Yield Disbursed',
    message: `You have received $${amount.toLocaleString()} in yield disbursement. Check your wallet.`,
    read: false,
    action_url: '/app/wallet',
  })
}
