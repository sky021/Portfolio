import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { caseStudies, getCaseStudy } from '@/content/work'
import ArchitectureDiagram from '@/components/ArchitectureDiagram'
import DemoLoader from '@/components/DemoLoader'
import Reveal from '@/components/Reveal'
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@/components/icons'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)

  if (!study) return { title: 'Not found' }

  return {
    title: study.title,
    description: study.tagline,
    openGraph: {
      title: `${study.title} | Akash Agrawal`,
      description: study.tagline,
    },
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
      {children}
    </h2>
  )
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params
  const study = getCaseStudy(slug)

  if (!study) notFound()

  const currentIndex = caseStudies.findIndex((item) => item.slug === study.slug)
  const next = caseStudies[(currentIndex + 1) % caseStudies.length]

  return (
    <article className="container-page py-16 sm:py-20">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm">
        <Link
          href="/work"
          className="text-ink-500 transition-colors hover:text-accent-700 dark:text-ink-400 dark:hover:text-accent-300"
        >
          Work
        </Link>
        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-300 dark:text-ink-700" />
        <span className="text-ink-700 dark:text-ink-300">{study.title}</span>
      </nav>

      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{study.context}</span>
          <span className="chip">{study.period}</span>
          <span className="chip">{study.role}</span>
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-5xl">
          {study.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-600 text-pretty dark:text-ink-400">
          {study.tagline}
        </p>
      </header>

      {/* Outcomes up front: the reason to keep reading. */}
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {study.outcomes.map((outcome, index) => (
          <Reveal key={outcome.label} delay={index * 60}>
            <div className="surface h-full p-4">
              <p className="font-mono text-2xl font-semibold tracking-tight text-accent-600 dark:text-accent-300">
                {outcome.value}
              </p>
              <p className="mt-1.5 text-sm font-medium text-ink-800 dark:text-ink-200">
                {outcome.label}
              </p>
              {outcome.detail && (
                <p className="mt-0.5 text-[12px] text-ink-500 dark:text-ink-400">
                  {outcome.detail}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      {study.demo && (
        <section className="mt-14" aria-label="Interactive demo">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <SectionTitle>See it work</SectionTitle>
          </div>
          <DemoLoader demo={study.demo} />
        </section>
      )}

      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-16">
        <div className="min-w-0">
          <section>
            <SectionTitle>The problem</SectionTitle>
            <div className="prose-body">
              <p>{study.problem}</p>
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle>Approach</SectionTitle>
            <div className="prose-body">
              {study.approach.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <SectionTitle>Architecture</SectionTitle>
            <ArchitectureDiagram diagram={study.diagram} />
          </section>

          <section className="mt-12">
            <SectionTitle>Decisions and tradeoffs</SectionTitle>
            <ul className="space-y-4">
              {study.decisions.map((decision, index) => (
                <li key={decision.title}>
                  <Reveal delay={index * 60}>
                    <div className="surface p-5">
                      <h3 className="text-base font-semibold text-ink-900 dark:text-ink-50">
                        {decision.title}
                      </h3>
                      <p className="mt-2 font-mono text-[12.5px] text-accent-700 dark:text-accent-300">
                        {decision.choice}
                      </p>
                      <dl className="mt-3 space-y-2.5 text-[14px] leading-relaxed">
                        <div>
                          <dt className="label-mono">Why</dt>
                          <dd className="mt-1 text-ink-600 dark:text-ink-300">
                            {decision.rationale}
                          </dd>
                        </div>
                        <div>
                          <dt className="label-mono">What it cost</dt>
                          <dd className="mt-1 text-ink-600 dark:text-ink-300">
                            {decision.tradeoff}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <div>
            <p className="label-mono mb-3">Constraints</p>
            <ul className="space-y-2.5">
              {study.constraints.map((constraint) => (
                <li key={constraint} className="flex gap-2.5 text-[13.5px] leading-relaxed">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
                  <span className="text-ink-600 dark:text-ink-400">{constraint}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono mb-3">Stack</p>
            <div className="space-y-3">
              {study.stack.map((group) => (
                <div key={group.group}>
                  <p className="text-[12px] font-semibold text-ink-700 dark:text-ink-300">
                    {group.group}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <span key={item} className="chip">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {study.links && study.links.length > 0 && (
            <div>
              <p className="label-mono mb-3">Links</p>
              <ul className="space-y-2">
                {study.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:text-accent-600 dark:text-accent-300"
                    >
                      {link.label}
                      <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      <nav className="mt-16 border-t border-ink-200 pt-8 dark:border-ink-800">
        <Link
          href={`/work/${next.slug}`}
          className="group surface flex items-center justify-between gap-4 p-5 transition-colors hover:border-accent-500/50"
        >
          <span>
            <span className="label-mono">Next case study</span>
            <span className="mt-1 block text-lg font-semibold text-ink-900 dark:text-ink-50">
              {next.title}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-accent-600 transition-transform group-hover:translate-x-1 dark:text-accent-400" />
        </Link>
      </nav>
    </article>
  )
}
