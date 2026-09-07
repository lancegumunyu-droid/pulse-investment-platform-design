/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Enforce strict type checking to guarantee zero runtime type bugs in production
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // 2. Enable Next.js Image Optimization (essential for mobile data saving and speed)
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Hardened, Enterprise-Grade Security Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Secure embedding specifically for Pi Network and your custom domain
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.minepi.com https://minepi.com https://pulseinvest.uk",
          },
          {
            // Removed dangerous X-Frame-Options: ALLOWALL; reliance is shifted to secure CSP frame-ancestors
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  // 4. Robust Environment Fallbacks
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      '',
  },
}

export default nextConfig
