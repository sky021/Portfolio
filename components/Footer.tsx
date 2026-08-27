import Link from 'next/link'
import { caseStudies, profile } from '@/content/work'
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons'

export default function Footer() {
  return (
    <footer className="border-t border-ink-200 py-12 dark:border-ink-800">
      <div className="container-page">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{profile.name}</p>
            <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
              {profile.headline} · {profile.location}
            </p>
            <div className="mt-4 flex items-center gap-1">
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
              >
                <GitHubIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
              >
                <LinkedInIcon className="h-[18px] w-[18px]" />
              </a>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
              >
                <MailIcon className="h-[18px] w-[18px]" />
              </a>
            </div>
          </div>

          <div>
            <p className="label-mono mb-3">Case studies</p>
            <ul className="space-y-2">
              {caseStudies.slice(0, 4).map((study) => (
                <li key={study.slug}>
                  <Link
                    href={`/work/${study.slug}`}
                    className="text-[13px] text-ink-500 transition-colors hover:text-accent-700 dark:text-ink-400 dark:hover:text-accent-300"
                  >
                    {study.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono mb-3">Elsewhere</p>
            <ul className="space-y-2">
              <li>
                <a
                  href={profile.links.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-ink-500 transition-colors hover:text-accent-700 dark:text-ink-400 dark:hover:text-accent-300"
                >
                  Resume (PDF)
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="text-[13px] text-ink-500 transition-colors hover:text-accent-700 dark:text-ink-400 dark:hover:text-accent-300"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <Link
                  href="/work"
                  className="text-[13px] text-ink-500 transition-colors hover:text-accent-700 dark:text-ink-400 dark:hover:text-accent-300"
                >
                  All work
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-ink-200 pt-6 text-[12px] text-ink-400 dark:border-ink-800 dark:text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
