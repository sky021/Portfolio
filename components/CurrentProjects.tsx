import { currentProjects } from '@/content/work'
import { ArrowUpRightIcon } from '@/components/icons'
import Reveal from '@/components/Reveal'

export default function CurrentProjects() {
  return (
    <section aria-labelledby="current-projects-heading">
      <div className="max-w-2xl">
        <p className="label-mono">Building now</p>
        <h2
          id="current-projects-heading"
          className="mt-3 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 sm:text-3xl"
        >
          Products in active development
        </h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ink-600 dark:text-ink-400">
          Two products I am taking from real user problems to public launch.
        </p>
      </div>

      <ul className="mt-7 grid gap-5 lg:grid-cols-2">
        {currentProjects.map((project, index) => (
          <li key={project.title}>
            <Reveal delay={index * 70} className="h-full">
              <article className="surface flex h-full flex-col p-5 sm:p-6">
                <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  {project.status}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-ink-900 dark:text-ink-50">
                  {project.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600 dark:text-ink-400">
                  {project.summary}
                </p>
                <div className="mt-5 flex-1 border-l-2 border-accent-500/40 pl-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-ink-500">
                    Customer problem
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-600 dark:text-ink-400">
                    {project.problem}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300"
                    >
                      {link.label}
                      <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
