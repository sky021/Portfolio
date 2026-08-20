import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-mono">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl">
        That page does not exist
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600 dark:text-ink-400">
        The link may be out of date. The case studies are the most useful place to land.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/work" className="btn-primary">
          Browse case studies
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link href="/" className="btn-ghost">
          Back home
        </Link>
      </div>
    </div>
  )
}
