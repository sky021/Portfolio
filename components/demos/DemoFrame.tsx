import type { ReactNode } from 'react'
import { AlertIcon, SparkIcon } from '@/components/icons'

/**
 * Shared chrome for the interactive demos.
 *
 * Every demo states plainly whether it is executing real logic or illustrating
 * a system, so nothing on the page overstates what the visitor is looking at.
 */
export default function DemoFrame({
  title,
  subtitle,
  kind,
  note,
  controls,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  kind: 'live' | 'simulation' | 'abstracted'
  note?: string
  controls?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const badge = {
    live: { label: 'Runs real logic', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
    simulation: { label: 'Simulation', className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300' },
    abstracted: { label: 'Abstracted', className: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  }[kind]

  return (
    <section className="surface overflow-hidden">
      <header className="flex flex-col gap-4 border-b border-ink-200 p-5 dark:border-ink-800 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badge.className}`}
            >
              {kind === 'live' && <SparkIcon className="h-3 w-3" />}
              {badge.label}
            </span>
          </div>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm text-ink-600 dark:text-ink-400">{subtitle}</p>
          )}
        </div>
        {controls && <div className="flex shrink-0 flex-wrap items-center gap-2">{controls}</div>}
      </header>

      {note && (
        <p className="flex gap-2.5 border-b border-ink-200 bg-ink-50/70 px-5 py-3 text-[13px] leading-relaxed text-ink-600 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-400 sm:px-6">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
          <span>{note}</span>
        </p>
      )}

      <div className="p-5 sm:p-6">{children}</div>

      {footer && (
        <div className="border-t border-ink-200 px-5 py-4 dark:border-ink-800 sm:px-6">{footer}</div>
      )}
    </section>
  )
}
