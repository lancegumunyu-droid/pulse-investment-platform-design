'use client'

import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    Pi?: { init: (options: { version: string; sandbox: boolean }) => void }
  }
}

export async function authenticatePi() {
  if (!window.Pi || !('authenticate' in window.Pi)) throw new Error('Pi Browser is required')
  return (window.Pi as Window['Pi'] & { authenticate: (scopes: string[]) => Promise<unknown> }).authenticate(['username', 'payments', 'wallet_address'])
}

export function GooglePiRuntime() {
  useEffect(() => {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'pulse_page_view' })
  }, [])

  return (
    <>
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-JGWQDH6RR7" strategy="afterInteractive" />
      <Script id="pulse-ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-JGWQDH6RR7',{anonymize_ip:true});`}
      </Script>
      <Script
        src="https://sdk.minepi.com/pi-sdk.js"
        strategy="afterInteractive"
        onLoad={() => window.Pi?.init({ version: '2.0', sandbox: false })}
      />
    </>
  )
}
