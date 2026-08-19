/**
 * Demo-only auto-close calculation helper.
 * It is not connected to production persistence or wallet balances.
 * Production auto-close remains disabled until the Supabase maturity and ledger migration is installed.
 */

import type { Holding, Txn } from '@/components/pulse/store'
import type { Signal } from '@/lib/pulse-data'

export interface SignalWithClosingDate extends Signal {
  closingDate: number // Unix timestamp
  status: 'open' | 'closed_pending_approval' | 'closed_approved'
}

export interface AdminNotification {
  id: string
  type: 'signal_closed' | 'auto_credit_pending'
  signalId: string
  signalTitle: string
  affectedInvestors: number
  totalAmount: number
  timestamp: number
  read: boolean
}

export interface AutoCloseResult {
  closedSignals: SignalWithClosingDate[]
  creditsToApprove: Array<{ userId: string; amount: number; holdingId: string }>
  notifications: AdminNotification[]
}

/**
 * Check for signals that should be auto-closed
 */
export function checkAutoCloseSignals(
  signals: SignalWithClosingDate[],
  holdings: Holding[],
  now: number = Date.now()
): AutoCloseResult {
  const closedSignals: SignalWithClosingDate[] = []
  const creditsToApprove: Array<{ userId: string; amount: number; holdingId: string }> = []
  const notifications: AdminNotification[] = []

  for (const signal of signals) {
    // Check if signal should close (date reached AND still open)
    if (signal.closingDate <= now && signal.status === 'open') {
      // Mark as closed
      closedSignals.push({
        ...signal,
        status: 'closed_pending_approval',
      })

      // Find all holdings in this project
      const projectHoldings = holdings.filter((h) => h.projectId === signal.projectId)

      if (projectHoldings.length > 0) {
        // Calculate credits for each investor
        // Assume a 15% yield on average for demo purposes
        const yieldPercentage = 0.15
        let totalCreditAmount = 0

        for (const holding of projectHoldings) {
          const creditAmount = holding.amount * yieldPercentage
          creditsToApprove.push({
            userId: holding.id, // Using holding ID as userId reference
            amount: creditAmount,
            holdingId: holding.id,
          })
          totalCreditAmount += creditAmount
        }

        // Create notification for admin
        notifications.push({
          id: `notif-${Date.now()}-${signal.id}`,
          type: 'signal_closed',
          signalId: signal.id,
          signalTitle: signal.title,
          affectedInvestors: projectHoldings.length,
          totalAmount: totalCreditAmount,
          timestamp: now,
          read: false,
        })
      }
    }
  }

  return { closedSignals, creditsToApprove, notifications }
}

/**
 * Create transactions for auto-credited amounts
 */
export function createAutoCreditsTransactions(
  credits: Array<{ userId: string; amount: number; holdingId: string }>
): Txn[] {
  return credits.map((credit, idx) => ({
    id: `auto-credit-${Date.now()}-${idx}`,
    type: 'invest' as const,
    label: `Auto-credit from closed signal`,
    amount: credit.amount,
    currency: 'USDT' as const,
    status: 'pending' as const,
    date: Date.now(),
  }))
}

/**
 * Format notification for email/display
 */
export function formatAdminNotification(notification: AdminNotification): string {
  return `
Signal Closed: ${notification.signalTitle}

${notification.affectedInvestors} investor(s) need approval to receive $${notification.totalAmount.toFixed(2)} in credits.

Status: Pending Admin Approval
Action Required: Review and approve in Admin Dashboard

This is an automated notification from PULSE.
  `.trim()
}

/**
 * Check if a signal is past its closing date
 */
export function isSignalExpired(signal: SignalWithClosingDate, now: number = Date.now()): boolean {
  return signal.closingDate <= now && signal.status === 'open'
}

/**
 * Format closing date for display
 */
export function formatClosingDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) {
    return 'Closed'
  } else if (days === 0) {
    return 'Closes today'
  } else if (days === 1) {
    return 'Closes tomorrow'
  } else {
    return `Closes in ${days} days`
  }
}

/**
 * Get urgency level based on closing date
 */
export function getSignalUrgency(signal: SignalWithClosingDate, now: number = Date.now()): 'New' | 'Open' | 'Closing soon' {
  if (signal.closingDate <= now) {
    return 'Closing soon'
  }

  const daysLeft = Math.ceil((signal.closingDate - now) / (1000 * 60 * 60 * 24))

  if (daysLeft <= 3) {
    return 'Closing soon'
  }

  return 'Open'
}

/**
 * Sort signals by urgency and closing date
 */
export function sortSignalsByUrgency(signals: SignalWithClosingDate[]): SignalWithClosingDate[] {
  return [...signals].sort((a, b) => {
    // Closing soon signals first
    const aUrgency = getSignalUrgency(a)
    const bUrgency = getSignalUrgency(b)

    if (aUrgency === 'Closing soon' && bUrgency !== 'Closing soon') return -1
    if (aUrgency !== 'Closing soon' && bUrgency === 'Closing soon') return 1

    // Then by closing date
    return a.closingDate - b.closingDate
  })
}
