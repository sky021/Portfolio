'use client'

import { impactMetrics } from '@/content/work'
import { useCountUp, useRevealOnce } from '@/lib/hooks'

/**
 * Animated counters for the headline numbers.
 *
 * Values are stored as plain numbers in the content model and formatted here, so
 * the copy stays free of presentation details.
 */

function formatMetric(value: number, target: number): string {
  if (target >= 1000) return Math.round(value).toLocaleString('en-US')
  if (!Number.isInteger(target)) return value.toFixed(1)
  return String(Math.round(value))
}

function suffixFor(label: string): string {
  if (label.startsWith('Percent')) return '%'
  if (label.includes('Million')) return 'M'
  return ''
}

function cleanLabel(label: string): string {
  return label
    .replace(/^Percent\s+/, '')
    .replace(/^Million\s+/, '')
    .replace(/\bMillion\b/, '')
    .trim()
}

function MetricCard({
  value,
  label,
  detail,
  active,
}: {
  value: number
  label: string
  detail?: string
  active: boolean
}) {
  const animated = useCountUp(value, active)

  return (
    <div className="border-l border-ink-200 pl-4 dark:border-ink-800">
      <p className="font-mono text-3xl font-semibold tracking-tight text-ink-900 tabular-nums dark:text-ink-50 sm:text-4xl">
        {formatMetric(animated, value)}
        <span className="text-accent-600 dark:text-accent-400">{suffixFor(label)}</span>
      </p>
      <p className="mt-1.5 text-sm font-medium capitalize text-ink-800 dark:text-ink-200">
        {cleanLabel(label)}
      </p>
      {detail && <p className="mt-0.5 text-[12px] text-ink-500 dark:text-ink-400">{detail}</p>}
    </div>
  )
}

export default function ImpactMetrics() {
  const [ref, revealed] = useRevealOnce<HTMLDivElement>()

  return (
    <section aria-label="Impact metrics" className="border-y border-ink-200 dark:border-ink-800">
      <div ref={ref} className="container-page py-12 sm:py-16">
        <p className="label-mono mb-8">Measured outcomes</p>
        <div className="grid grid-cols-2 gap-y-8 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
          {impactMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              value={Number(metric.value)}
              label={metric.label}
              detail={metric.detail}
              active={revealed}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
