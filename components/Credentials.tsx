import { credentials } from '@/content/work'
import { ArrowUpRightIcon, AwardIcon, GraduationIcon, UsersIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'

const iconFor = {
  award: AwardIcon,
  education: GraduationIcon,
  community: UsersIcon,
}

export default function Credentials() {
  return (
    <section aria-label="Credentials" className="border-t border-ink-200 py-16 dark:border-ink-800">
      <div className="container-page">
        <p className="label-mono mb-8">Recognition</p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {credentials.map((item, index) => {
            const Icon = iconFor[item.kind]
            const card = (
              <div className="h-full rounded-xl border border-ink-200 p-4 transition-colors dark:border-ink-800">
                <Icon className="h-5 w-5 text-accent-600 dark:text-accent-400" />
                <h3 className="mt-3 text-[14px] font-semibold leading-snug text-ink-900 dark:text-ink-50">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
                  {item.detail}
                </p>
                {'href' in item && (
                  <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-accent-700 dark:text-accent-300">
                    {item.linkLabel}
                    <ArrowUpRightIcon className="h-3 w-3" />
                  </span>
                )}
              </div>
            )

            return (
              <li key={item.title}>
                <Reveal delay={index * 60} className="h-full">
                  {'href' in item ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full rounded-xl hover:bg-ink-50 dark:hover:bg-ink-900"
                    >
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </Reveal>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
