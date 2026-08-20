import type { Metadata } from 'next'
import Link from 'next/link'
import { caseStudies } from '@/content/work'
import { ArrowRightIcon, SparkIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'
import CurrentProjects from '@/components/CurrentProjects'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Products in active development and case studies covering applied AI, backend systems, cloud infrastructure, and data engineering.',
}

export default function WorkIndexPage() {
  return (
    <div className="container-page py-16 sm:py-24">
      <header className="max-w-3xl">
        <p className="label-mono">Work</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-5xl">
          Products and systems built around real needs
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600 dark:text-ink-400">
          Current products show where I am headed. Completed case studies show how I make
          engineering decisions under real constraints.
        </p>
      </header>

      <div className="mt-12">
        <CurrentProjects />
      </div>

      <section aria-labelledby="case-studies-heading" className="mt-16">
        <div className="max-w-2xl">
          <p className="label-mono">Case studies</p>
          <h2
            id="case-studies-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 sm:text-3xl"
          >
            Decisions, tradeoffs, and measurable outcomes
          </h2>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {caseStudies.map((study, index) => (
            <li key={study.slug}>
              <Reveal delay={index * 70} className="h-full">
                <Link
                  href={`/work/${study.slug}`}
                  className="group surface flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-accent-500/50 hover:shadow-lg sm:p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="label-mono">{study.context}</span>
                    <span className="text-ink-300 dark:text-ink-700">·</span>
                    <span className="label-mono">{study.period}</span>
                    {study.demo && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-700 dark:text-accent-300">
                        <SparkIcon className="h-3 w-3" />
                        demo
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-xl font-semibold text-ink-900 dark:text-ink-50">
                    {study.title}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-ink-600 dark:text-ink-400">
                    {study.tagline}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {study.outcomes.slice(0, 3).map((outcome) => (
                      <span key={outcome.label} className="chip">
                        <strong className="font-mono font-semibold text-ink-800 dark:text-ink-100">
                          {outcome.value}
                        </strong>
                        {outcome.label.toLowerCase()}
                      </span>
                    ))}
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 dark:text-accent-300">
                    Read the case study
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
