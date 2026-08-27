import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://pulse-invest-lancegumunyu-droids-projects.vercel.app/sitemap.xml',
  }
}
