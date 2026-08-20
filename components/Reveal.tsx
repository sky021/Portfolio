'use client'

import type { ReactNode } from 'react'
import { useRevealOnce } from '@/lib/hooks'

/**
 * Fade-and-lift reveal on first scroll into view.
 *
 * Uses IntersectionObserver and a CSS transition rather than a motion library so
 * static sections stay lightweight; the transition is neutralised globally under
 * prefers-reduced-motion.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
