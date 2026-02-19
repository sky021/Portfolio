import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://portfolio-akash-agrawal.vercel.app/sitemap.xml', // Update with actual domain
  }
}
