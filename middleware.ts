import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  // Prevent caching of sensitive pages
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/app')
  ) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    // Only run middleware on the investor app and auth routes.
    // Public marketing pages (/, /about, /projects, /contact, /legal) do NOT need session refreshing.
    '/app/:path*',
    '/auth/:path*',
    '/api/nowpayments/:path*',
  ],
}
