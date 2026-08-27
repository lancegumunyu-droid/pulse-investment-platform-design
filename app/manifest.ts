import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pulse Invest',
    short_name: 'Pulse',
    description: 'Transparent investing in real African projects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/pulse-icon.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
