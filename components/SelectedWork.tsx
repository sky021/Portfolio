import Link from 'next/link'
import { caseStudies, featuredCaseStudies } from '@/content/work'
import { ArrowRightIcon, SparkIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'
import WorkPreview from '@/components/WorkPreview'
import CurrentProjects from '@/components/CurrentProjects'

export default function SelectedWork() {
  const remaining = caseStudies.length - featuredCaseStudies.length

  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-mono">Selected work</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-4xl">
            Work that starts with the problem
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-600 dark:text-ink-400">
            I start with what people need, then build the smallest reliable system that solves it.
          </p>
        </div>

        <div className="mt-12">
          <CurrentProjects />
        </div>

        <div className="mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="label-mono">Case studies</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-3xl">
              Four systems you can run in your browser
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink-600 dark:text-ink-400">
              Working demos with the architecture, decisions, and tradeoffs behind each system.
            </p>
          </div>
          <Link
            href="/work"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300"
          >
            All {caseStudies.length} case studies
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {featuredCaseStudies.map((study, index) => (
            <li key={study.slug}>
              <Reveal delay={index * 80} className="h-full">
                <Link
                  href={`/work/${study.slug}`}
                  className="group surface flex h-full flex-col p-5 transition-all hover:-translate-y-1 hover:border-accent-500/50 hover:shadow-xl sm:p-6"
                >
                  {study.demo && <WorkPreview demo={study.demo} />}

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="label-mono">{study.context}</span>
                    <span className="text-ink-300 dark:text-ink-700">·</span>
                    <span className="label-mono">{study.period}</span>
                    {study.demo && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-700 dark:text-accent-300">
                        <SparkIcon className="h-3 w-3" />
                        interactive
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

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 dark:text-accent-300">
                    Open case study
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <p className="mt-6 text-sm text-ink-500 dark:text-ink-400">
            Plus {remaining} more covering financial-systems middleware at CITI Bank and a
            ten-million-record master data pipeline at Avery Dennison.{' '}
            <Link
              href="/work"
              className="font-semibold text-accent-700 hover:underline dark:text-accent-300"
            >
              Browse all work
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  )
}
