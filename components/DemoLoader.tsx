'use client'

import dynamic from 'next/dynamic'
import type { DemoKey } from '@/content/work'

/**
 * Demos are heavy and interactive, so they are code-split and mounted on the
 * client only. Each case study pulls in just its own demo.
 */

function Skeleton() {
  return (
    <div className="surface animate-pulse p-6">
      <div className="h-5 w-56 rounded bg-ink-200 dark:bg-ink-800" />
      <div className="mt-3 h-3 w-full max-w-md rounded bg-ink-100 dark:bg-ink-800/70" />
      <div className="mt-6 h-52 rounded-lg bg-ink-100 dark:bg-ink-800/50" />
    </div>
  )
}

// next/dynamic options have to be inline object literals; the SWC transform
// reads them statically and rejects a shared const.
const NL2SQLPlayground = dynamic(() => import('./demos/NL2SQLPlayground'), {
  ssr: false,
  loading: Skeleton,
})
const LambdaLensPipeline = dynamic(() => import('./demos/LambdaLensPipeline'), {
  ssr: false,
  loading: Skeleton,
})
const TrackingDemo = dynamic(() => import('./demos/TrackingDemo'), {
  ssr: false,
  loading: Skeleton,
})
const RevocationDemo = dynamic(() => import('./demos/RevocationDemo'), {
  ssr: false,
  loading: Skeleton,
})

export default function DemoLoader({ demo }: { demo: DemoKey }) {
  switch (demo) {
    case 'nl2sql':
      return <NL2SQLPlayground />
    case 'lambdalens':
      return <LambdaLensPipeline />
    case 'tracking':
      return <TrackingDemo />
    case 'revocation':
      return <RevocationDemo />
    default:
      return null
  }
}
