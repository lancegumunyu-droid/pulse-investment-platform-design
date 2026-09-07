import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  
  // Safely sanitize the 'next' redirect path to prevent open redirect vulnerabilities
  let next = searchParams.get('next') ?? '/app'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/app'
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Respect reverse-proxy headers (Vercel, Cloudflare, etc.) to construct the absolute origin
      const forwardedHost = request.headers.get('x-forwarded-host')
      const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
      
      const host = forwardedHost || request.headers.get('host') || request.nextUrl.host
      const origin = forwardedHost ? `${forwardedProto}://${host}` : request.nextUrl.origin

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Authentication handshake failed or code was missing/invalid
  return NextResponse.redirect(`${request.nextUrl.origin}/auth/error`)
}
