import Link from 'next/link'
import { roles } from '@/content/work'
import { ArrowUpRightIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'

export default function Experience() {
  return (
    <section id="experience" className="border-t border-ink-200 py-20 dark:border-ink-800 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-mono">Experience</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-4xl">
            Four engineering roles, from enterprise data to production AI
          </h2>
        </div>

        <ol className="mt-12 space-y-4">
          {roles.map((role, index) => (
            <li key={`${role.company}-${role.period}`}>
              <Reveal delay={index * 70}>
                <div className="surface p-5 sm:p-6">
                  <div className="grid gap-5 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-8">
                    <div>
                      <p className="font-mono text-sm font-semibold text-ink-900 dark:text-ink-100">
                        {role.period}
                      </p>
                      {role.current && (
                        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          current
                        </span>
                      )}
                      <p className="mt-2 text-[12px] text-ink-500 dark:text-ink-500">
                        {role.location}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">
                        {role.title}
                      </h3>
                      <p className="mt-0.5 text-[15px] font-medium text-accent-700 dark:text-accent-300">
                        {role.company}
                        {role.client && (
                          <span className="text-ink-500 dark:text-ink-400"> · Client: {role.client}</span>
                        )}
                      </p>

                      <p className="mt-3 text-[15px] leading-relaxed text-ink-600 dark:text-ink-400">
                        {role.summary}
                      </p>

                      <ul className="mt-4 space-y-2">
                        {role.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="relative pl-4 text-[14px] leading-relaxed text-ink-600 dark:text-ink-400"
                          >
                            <span className="absolute left-0 top-[9px] h-1 w-1 rounded-full bg-accent-500" />
                            {highlight}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-4 flex flex-wrap items-center gap-1.5">
                        {role.stack.map((item) => (
                          <span key={item} className="chip">
                            {item}
                          </span>
                        ))}
                      </div>

                      {role.caseStudy && (
                        <Link
                          href={`/work/${role.caseStudy}`}
                          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300"
                        >
                          Read the case study
                          <ArrowUpRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
