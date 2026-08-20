import Image from 'next/image'
import Link from 'next/link'
import HeroBackdrop from '@/components/HeroBackdrop'
import { profile } from '@/content/work'
import {
  ArrowRightIcon,
  DownloadIcon,
  GitHubIcon,
  LinkedInIcon,
  MapPinIcon,
} from '@/components/icons'

/**
 * Server-rendered hero. Entrance animation is pure CSS so nothing here needs to
 * ship as a client component.
 */
export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Backdrop: output from the portfolio's simplified tracking simulation. */}
      <div
        className="pointer-events-none absolute -top-8 right-0 -z-10 hidden h-[380px] w-[40%] lg:block"
        aria-hidden="true"
      >
        <HeroBackdrop />
      </div>

      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
          <div>
            <p className="animate-fade-up label-mono flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Currently building at NewsGenie
            </p>

            <h1
              className="animate-fade-up mt-4 text-5xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-6xl lg:text-7xl"
              style={{ animationDelay: '80ms' }}
            >
              {profile.name}
            </h1>

            <p
              className="animate-fade-up mt-3 text-xl font-semibold text-accent-700 dark:text-accent-300 sm:text-2xl"
              style={{ animationDelay: '140ms' }}
            >
              {profile.headline}
            </p>

            <p
              className="animate-fade-up mt-5 max-w-2xl text-lg leading-relaxed text-ink-600 text-pretty dark:text-ink-400"
              style={{ animationDelay: '200ms' }}
            >
              {profile.subhead}
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '260ms' }}
            >
              <Link href="/#work" className="btn-primary">
                See the work
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={profile.links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost"
              >
                <DownloadIcon className="h-4 w-4" />
                Resume
              </a>
              <div className="flex items-center gap-1">
                <a
                  href={profile.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="rounded-lg p-2.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                >
                  <GitHubIcon className="h-5 w-5" />
                </a>
                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-lg p-2.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
                >
                  <LinkedInIcon className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Proof, immediately. */}
            <dl
              className="animate-fade-up mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3"
              style={{ animationDelay: '320ms' }}
            >
              {profile.proof.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-ink-200 bg-white px-4 py-3 dark:border-ink-800 dark:bg-ink-900"
                >
                  <dt className="font-mono text-2xl font-semibold tracking-tight text-ink-900 dark:text-ink-50">
                    {item.value}
                  </dt>
                  <dd className="mt-0.5 text-[13px] font-medium text-ink-700 dark:text-ink-300">
                    {item.label}
                  </dd>
                  {item.detail && (
                    <dd className="mt-0.5 text-[11.5px] text-ink-500 dark:text-ink-500">
                      {item.detail}
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>

          {/* Portrait + status card */}
          <div className="animate-fade-up mx-auto w-full max-w-[280px] lg:max-w-none" style={{ animationDelay: '180ms' }}>
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink-200 bg-ink-100 dark:border-ink-800 dark:bg-ink-900">
              <Image
                src="/images/Photo.jpeg"
                alt={profile.name}
                fill
                sizes="(min-width: 1024px) 320px, 280px"
                className="object-cover"
                priority
              />
            </div>

            <div className="surface mt-4 divide-y divide-ink-200 text-[13px] dark:divide-ink-800">
              <div className="flex items-center gap-2 px-4 py-2.5">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span className="text-ink-600 dark:text-ink-400">{profile.location}</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-ink-500 dark:text-ink-500">M.S. CS</span>
                <span className="font-mono text-ink-700 dark:text-ink-300">ASU, Dec 2025</span>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                <span className="text-ink-500 dark:text-ink-500">Focus</span>
                <span className="font-mono text-ink-700 dark:text-ink-300">AI, Backend, Cloud</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
