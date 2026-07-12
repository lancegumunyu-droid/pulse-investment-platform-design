'use client'

import { useState, useEffect } from 'react'
import { Share2, Copy, CheckCircle2 } from 'lucide-react'

export function ReferralDisplay() {
  const [referralLink, setReferralLink] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Generate referral link on client side
    const generateLink = async () => {
      try {
        const response = await fetch('/api/referral/generate-link', {
          method: 'POST',
        })
        const data = await response.json()
        if (data.referralLink) {
          setReferralLink(data.referralLink)
        }
      } catch (error) {
        console.error('[v0] Error generating referral link:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateLink()
  }, [])

  const copyToClipboard = async () => {
    if (!referralLink) return
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Failed to copy link')
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 rounded-lg border border-gold/30 bg-gold/[0.08] p-4 animate-pulse">
        <p className="text-sm text-gold">Loading referral link...</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="rounded-lg border border-gold/30 bg-gold/[0.08] p-4">
        <div className="flex items-start gap-3">
          <Share2 className="size-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-gold text-sm">Earn $35 Per Referral</p>
            <p className="text-xs text-muted-foreground mt-1">
              Share your unique link and earn rewards when friends join Pulse
            </p>
          </div>
        </div>
      </div>

      {referralLink && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent text-xs text-muted-foreground truncate outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-1 px-2 py-1 rounded bg-gold/20 text-gold hover:bg-gold/30 transition-colors text-xs font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="size-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
