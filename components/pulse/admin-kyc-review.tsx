'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Loader2, Check, X, AlertCircle, Download } from 'lucide-react'
import { getPendingKycSubmissions, approveKyc, rejectKyc } from '@/app/actions/kyc-submit'
import { Button } from '@/components/ui/button'

interface KycSubmission {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  date_of_birth: string
  id_type: string
  id_number: string
  government_id_url: string | null
  proof_of_address_url: string | null
  selfie_url: string | null
  status: string
  submitted_at: string
  profiles: { id: string; full_name: string; email: string; approval_status: string } | null
}

export function AdminKycReview({ adminId }: { adminId: string }) {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await getPendingKycSubmissions()
      setSubmissions(data as KycSubmission[])
    } catch (err) {
      console.error('[v0] Failed to load KYC submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submissionId: string) => {
    if (!adminId) {
      alert('Admin ID not found')
      return
    }

    try {
      setProcessing(submissionId)
      const result = await approveKyc(submissionId, adminId)
      if (result.error) {
        alert(`Error: ${result.error}`)
      } else {
        setSubmissions(submissions.filter(s => s.id !== submissionId))
      }
    } catch (err) {
      console.error('[v0] Approval error:', err)
      alert('Failed to approve KYC')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (submissionId: string) => {
    if (!adminId) {
      alert('Admin ID not found')
      return
    }

    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason')
      return
    }

    try {
      setProcessing(submissionId)
      const result = await rejectKyc(submissionId, adminId, rejectReason)
      if (result.error) {
        alert(`Error: ${result.error}`)
      } else {
        setSubmissions(submissions.filter(s => s.id !== submissionId))
        setSelectedId(null)
        setRejectReason('')
      }
    } catch (err) {
      console.error('[v0] Rejection error:', err)
      alert('Failed to reject KYC')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 text-gold animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading KYC submissions...</span>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-12 text-center">
        <p className="text-muted-foreground">No pending KYC submissions</p>
      </div>
    )
  }

  const selected = submissions.find(s => s.id === selectedId)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* List */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="font-semibold mb-4">Pending Submissions ({submissions.length})</h3>
        {submissions.map((submission) => (
          <button
            key={submission.id}
            onClick={() => setSelectedId(submission.id)}
            className={`w-full text-left rounded-lg border transition-all p-3 ${
              selectedId === submission.id
                ? 'border-gold bg-gold/10'
                : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]'
            }`}
          >
            <p className="font-medium text-sm truncate">{submission.first_name} {submission.last_name}</p>
            <p className="text-xs text-muted-foreground truncate">{submission.email}</p>
            <p className="text-xs text-gold mt-1">
              {new Date(submission.submitted_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>

      {/* Details */}
      {selected && (
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6 space-y-6">
            {/* Personal Info */}
            <div>
              <h4 className="font-semibold mb-4 text-gold">Personal Information</h4>
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selected.first_name} {selected.last_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{new Date(selected.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID Type</p>
                  <p className="font-medium capitalize">{selected.id_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ID Number</p>
                  <p className="font-medium">{selected.id_number}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="font-semibold mb-4 text-gold">Uploaded Documents</h4>
              <div className="space-y-4">
                {selected.government_id_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Government ID</p>
                    <img
                      src={selected.government_id_url}
                      alt="Government ID"
                      className="rounded-lg border border-white/[0.08] max-h-64 w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"%3E%3Crect fill="%23333" width="200" height="120"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}

                {selected.selfie_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selfie / Photo</p>
                    <img
                      src={selected.selfie_url}
                      alt="Selfie"
                      className="rounded-lg border border-white/[0.08] max-h-64 w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"%3E%3Crect fill="%23333" width="200" height="120"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}

                {selected.proof_of_address_url && (
                  <div>
                    <p className="text-sm font-medium mb-2">Proof of Address</p>
                    <img
                      src={selected.proof_of_address_url}
                      alt="Proof of Address"
                      className="rounded-lg border border-white/[0.08] max-h-64 w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120"%3E%3Crect fill="%23333" width="200" height="120"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason (if rejecting) */}
            {processing === selected.id && selectedId === 'reject-mode' && (
              <div>
                <label className="text-sm font-medium">Rejection Reason</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full mt-2 rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-sm outline-none focus:border-gold/50"
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => handleApprove(selected.id)}
                disabled={processing !== null}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processing === selected.id ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 size-4" />
                    Approve KYC
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  if (rejectReason) {
                    handleReject(selected.id)
                  } else {
                    setSelectedId('reject-mode')
                  }
                }}
                disabled={processing !== null}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                {processing === selected.id ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <X className="mr-2 size-4" />
                    Reject KYC
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
