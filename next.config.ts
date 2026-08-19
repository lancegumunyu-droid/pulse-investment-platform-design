import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', 'gsap'],
  webpack: (config) => {
    config.externals.push({ canvas: 'commonjs canvas' })
    return config
  },
}

export default nextConfig
