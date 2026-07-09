import { updateSession } from '@/lib/supabase/proxy'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
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
