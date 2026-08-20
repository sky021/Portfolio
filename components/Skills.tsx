import { education, skillGroups } from '@/content/work'
import { GraduationIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'

export default function Skills() {
  return (
    <section id="skills" className="border-t border-ink-200 py-20 dark:border-ink-800 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="label-mono">Technical depth</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-4xl">
            Grouped by what I actually use them for
          </h2>
        </div>

        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, index) => (
            <Reveal key={group.group} delay={index * 60}>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-700 dark:text-accent-400">
                  {group.group}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-ink-200 px-2.5 py-1 text-[13px] text-ink-700 transition-colors hover:border-accent-500/50 hover:text-ink-900 dark:border-ink-800 dark:text-ink-300 dark:hover:text-ink-50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {education.map((entry, index) => (
            <Reveal key={entry.degree} delay={index * 70}>
              <div className="surface h-full p-5">
                <div className="flex items-start gap-3">
                  <GraduationIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-900 dark:text-ink-50">{entry.degree}</h3>
                    <p className="mt-0.5 text-[14px] text-ink-600 dark:text-ink-400">
                      {entry.school} · {entry.location}
                    </p>
                    <p className="mt-0.5 font-mono text-[12px] text-ink-500 dark:text-ink-500">
                      {entry.period}
                    </p>
                    <p className="mt-2.5 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
                      {entry.courses.join(' · ')}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
