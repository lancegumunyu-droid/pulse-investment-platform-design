'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings, Users, FileCheck, TrendingUp, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react'
import { getAdminSnapshot, reviewKyc, reviewWithdrawal, disburseYield } from '@/app/actions/admin'
import type { AdminSnapshot } from '@/lib/pulse/types'
import { Button } from '@/components/ui/button'

export default function AdminPanel() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'kyc' | 'withdrawals'>('overview')
  const [selectedKyc, setSelectedKyc] = useState<string | null>(null)
  const [kycImages, setKycImages] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadSnapshot()
  }, [])

  async function loadSnapshot() {
    try {
      setLoading(true)
      const result = await getAdminSnapshot()
      if (!result.ok) {
        console.error('[v0] Admin snapshot error:', result.error)
        router.push('/admin/login')
        return
      }
      setSnapshot(result.snapshot)
    } catch (err) {
      console.error('[v0] Failed to load admin snapshot:', err)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleKycDecision(kycId: string, decision: 'approved' | 'rejected') {
    try {
      const result = await reviewKyc(kycId, decision)
      if (result.ok) {
        setSnapshot(result.snapshot)
        setSelectedKyc(null)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      alert('Failed to process KYC')
    }
  }

  async function handleWithdrawalDecision(txnId: string, decision: 'approved' | 'rejected') {
    try {
      const result = await reviewWithdrawal(txnId, decision)
      if (result.ok) {
        setSnapshot(result.snapshot)
      } else {
        alert('Error: ' + result.error)
      }
    } catch (err) {
      alert('Failed to process withdrawal')
    }
  }

  function logout() {
    localStorage.removeItem('adminSession')
    router.push('/admin/login')
  }

  if (loading || !snapshot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">PULSE Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Control Center</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold mt-2">{snapshot.userCount}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Pending KYC</p>
            <p className="text-2xl font-bold text-gold mt-2">{snapshot.pendingKyc}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Withdrawals Pending</p>
            <p className="text-2xl font-bold text-orange-500 mt-2">{snapshot.pendingWithdrawals}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total Deposited</p>
            <p className="text-2xl font-bold text-blue-400 mt-2">${snapshot.totalDeposits.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-gold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'kyc'
                ? 'border-gold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            KYC Reviews {snapshot.pendingKyc > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
              activeTab === 'withdrawals'
                ? 'border-gold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Withdrawals {snapshot.pendingWithdrawals > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-gold text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold mt-2">${snapshot.totalInvested.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
                <p className="text-sm text-muted-foreground">Total Staked</p>
                <p className="text-2xl font-bold mt-2">${snapshot.totalStaked.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <Users className="w-8 h-8 text-purple-400 mb-4" />
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold mt-2">{snapshot.users.filter(u => u.kycStatus === 'verified').length}</p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {snapshot.recentTxns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No recent transactions</p>
                ) : (
                  snapshot.recentTxns.map((txn) => (
                    <div key={txn.id} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{txn.type.toUpperCase()}</p>
                        <p className="text-xs text-muted-foreground">{txn.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{txn.currency} {txn.amount.toLocaleString('en', { maximumFractionDigits: 2 })}</p>
                        <p className={`text-xs ${txn.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>{txn.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kyc' && (
          <div className="space-y-4">
            {snapshot.kycQueue.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">All KYC submissions reviewed</p>
              </div>
            ) : (
              snapshot.kycQueue.map((kyc) => (
                <div
                  key={kyc.id}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 cursor-pointer hover:border-gold/50 transition-colors"
                  onClick={() => setSelectedKyc(selectedKyc === kyc.id ? null : kyc.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold">{kyc.fullName}</p>
                      <p className="text-sm text-muted-foreground">{kyc.email}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>ID: {kyc.idNumber}</span>
                        <span>Country: {kyc.country}</span>
                        <span>DOB: {kyc.dateOfBirth}</span>
                      </div>
                    </div>
                    <FileCheck className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {selectedKyc === kyc.id && (
                    <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-4">
                      <p className="text-sm text-muted-foreground">Submitted {new Date(kyc.createdAt).toLocaleDateString()}</p>
                      <div className="flex gap-3">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleKycDecision(kyc.id, 'approved')
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve KYC
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleKycDecision(kyc.id, 'rejected')
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {snapshot.withdrawalQueue.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">All withdrawals processed</p>
              </div>
            ) : (
              snapshot.withdrawalQueue.map((txn) => (
                <div key={txn.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-bold">{txn.email}</p>
                      <p className="text-2xl font-bold text-gold mt-2">
                        {txn.currency} {txn.amount.toLocaleString('en', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">Ref: {txn.reference}</p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleWithdrawalDecision(txn.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleWithdrawalDecision(txn.id, 'rejected')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {snapshot.users.map((user) => (
                <div key={user.id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <p className="font-bold text-sm">{user.fullName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <div className="mt-3 space-y-1 text-xs">
                    <p>Cash: ${user.cash.toLocaleString('en', { maximumFractionDigits: 2 })}</p>
                    <p>Invested: ${user.invested.toLocaleString('en', { maximumFractionDigits: 2 })}</p>
                    <p>
                      KYC:{' '}
                      <span
                        className={
                          user.kycStatus === 'verified'
                            ? 'text-green-400'
                            : user.kycStatus === 'rejected'
                              ? 'text-red-400'
                              : 'text-yellow-400'
                        }
                      >
                        {user.kycStatus}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
