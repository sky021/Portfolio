import type { Metadata, Viewport } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider, themeInitScript } from '@/components/ThemeProvider'
import { profile } from '@/content/work'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://akashagrawal.dev'

const description =
  'Akash Agrawal is a Software Engineer - AI who works backward from customer problems to build reliable AI products, backend services, and cloud systems.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Akash Agrawal | Software Engineer - AI',
    template: '%s | Akash Agrawal',
  },
  description,
  keywords: [
    'Software Engineer',
    'AI Engineer',
    'Machine Learning Engineer',
    'Backend Engineer',
    'LangChain',
    'RAG',
    'FastAPI',
    'AWS Lambda',
    'Next.js',
    'TypeScript',
    'Python',
    'Arizona State University',
    'Akash Agrawal',
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  alternates: { canonical: '/' },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Akash Agrawal | Software Engineer - AI',
    description,
    siteName: `${profile.name} · Portfolio`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akash Agrawal | Software Engineer - AI',
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/images/symbol.png',
    apple: '/images/symbol.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#080b0f' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: siteUrl,
    image: `${siteUrl}/images/Photo.jpeg`,
    jobTitle: 'Software Engineer - AI',
    description: profile.bio,
    email: profile.email,
    sameAs: [profile.links.linkedin, profile.links.github],
    worksFor: { '@type': 'Organization', name: 'NewsGenie, Inc.' },
    alumniOf: [
      { '@type': 'EducationalOrganization', name: 'Arizona State University' },
      { '@type': 'EducationalOrganization', name: 'Nagpur University' },
    ],
    // Locality only: a street address does not belong on a public portfolio.
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mesa',
      addressRegion: 'AZ',
      addressCountry: 'US',
    },
    knowsAbout: [
      'Software Engineering',
      'Applied AI',
      'Large Language Models',
      'Retrieval Augmented Generation',
      'Cloud Architecture',
      'Computer Vision',
      'Data Engineering',
    ],
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Applies the theme before first paint to avoid a flash of the wrong one. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-accent-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
