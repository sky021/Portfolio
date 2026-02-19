import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Akash Agrawal - Software Engineer | ML Engineer | Data Scientist',
  description: 'Portfolio of Akash Agrawal - MS CS student at Arizona State University, experienced Software Engineer specializing in Machine Learning, Cloud Computing, and Full-Stack Development',
  keywords: ['Software Engineer', 'Machine Learning', 'Data Science', 'Full Stack Developer', 'ASU', 'Python', 'React', 'AWS'],
  authors: [{ name: 'Akash Agrawal' }],
  openGraph: {
    title: 'Akash Agrawal - Portfolio',
    description: 'Software Engineer | Machine Learning Engineer | Data Scientist',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
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
