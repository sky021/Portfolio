import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

const siteUrl = 'https://portfolio-akash-agrawal.vercel.app' // Update with actual domain

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Akash Agrawal - Software Engineer | ML Engineer | Data Scientist',
    template: '%s | Akash Agrawal'
  },
  description: 'Portfolio of Akash Agrawal - MS CS student at Arizona State University, experienced Software Engineer specializing in Machine Learning, Cloud Computing, and Full-Stack Development. Seeking Summer 2025 internship opportunities.',
  keywords: [
    'Software Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
    'Full Stack Developer',
    'Arizona State University',
    'ASU',
    'Python',
    'React',
    'AWS',
    'LTIMindtree',
    'Computer Vision',
    'AI',
    'Cloud Computing',
    'PostgreSQL',
    'Next.js',
    'TypeScript'
  ],
  authors: [{ name: 'Akash Agrawal', url: siteUrl }],
  creator: 'Akash Agrawal',
  publisher: 'Akash Agrawal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Akash Agrawal - Software Engineer | ML Engineer | Data Scientist',
    description: 'MS CS student at Arizona State University, experienced Software Engineer specializing in Machine Learning and Cloud Computing.',
    siteName: 'Akash Agrawal Portfolio',
    images: [
      {
        url: `${siteUrl}/images/Photo.jpeg`,
        width: 1200,
        height: 630,
        alt: 'Akash Agrawal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Akash Agrawal - Software Engineer | ML Engineer | Data Scientist',
    description: 'MS CS student at Arizona State University, experienced Software Engineer specializing in Machine Learning and Cloud Computing.',
    images: [`${siteUrl}/images/Photo.jpeg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/symbol.png',
    apple: '/images/symbol.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Akash Agrawal',
    url: siteUrl,
    image: `${siteUrl}/images/Photo.jpeg`,
    sameAs: [
      'https://linkedin.com/in/akashagrawal021',
      'https://github.com/sky021',
    ],
    jobTitle: 'Software Engineer | Machine Learning Engineer | Data Scientist',
    worksFor: {
      '@type': 'EducationalOrganization',
      name: 'Arizona State University',
    },
    alumniOf: [
      {
        '@type': 'EducationalOrganization',
        name: 'Arizona State University',
      },
      {
        '@type': 'EducationalOrganization',
        name: 'Ramdeobaba University',
      },
    ],
    email: 'agrawal.akash@asu.edu',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1831 E Apache Blvd',
      addressLocality: 'Tempe',
      addressRegion: 'AZ',
      postalCode: '85281',
      addressCountry: 'US',
    },
    telephone: '+1-480-589-7445',
    knowsAbout: [
      'Software Engineering',
      'Machine Learning',
      'Data Science',
      'Cloud Computing',
      'Python',
      'React',
      'AWS',
      'Computer Vision',
      'Artificial Intelligence',
    ],
  }

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
