'use client'

import Script from 'next/script'
import { useEffect } from 'react'

export interface PiAuthResult {
  accessToken: string
  user: {
    uid: string
    username: string
  }
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    Pi?: {
      init: (options: { version: string; sandbox: boolean }) => void
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound: (payment: unknown) => void
      ) => Promise<PiAuthResult>
    }
  }
}

export async function authenticatePi(): Promise<PiAuthResult> {
  if (typeof window === 'undefined' || !window.Pi || !window.Pi.authenticate) {
    throw new Error('Pi Browser environment and SDK are required for authentication.')
  }

  // Pi.authenticate expects: (scopes, onIncompletePaymentFound)
  return window.Pi.authenticate(
    ['username', 'payments', 'wallet_address'],
    (payment) => {
      console.warn('Incomplete Pi payment detected during handshake:', payment)
      // Optional: Send this data to your backend error/payment recovery tracking logs
    }
  )
}

export function GooglePiRuntime() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'pulse_page_view' })
  }, [])

  // Automatically enable sandbox mode when running outside of production
  const isSandbox = process.env.NODE_ENV !== 'production'

  return (
    <>
      <Script 
        src="https://www.googletagmanager.com/gtag/js?id=G-JGWQDH6RR7" 
        strategy="afterInteractive" 
      />
      <Script id="pulse-ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JGWQDH6RR7',{anonymize_ip:true});`}
      </Script>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.Pi) {
            window.Pi.init({ version: '2.0', sandbox: isSandbox })
          }
        }}
      />
    </>
  )
}
