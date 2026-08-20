import type { MetadataRoute } from 'next'
import { caseStudies } from '@/content/work'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-akash-agrawal.vercel.app'
  const lastModified = new Date()

  return [
    { url: baseUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    {
      url: `${baseUrl}/work`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...caseStudies.map((study) => ({
      url: `${baseUrl}/work/${study.slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.8,
    })),
  ]
}
