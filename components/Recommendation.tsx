import { ArrowUpRightIcon, LinkedInIcon } from '@/components/icons'
import { profile } from '@/content/work'
import Reveal from '@/components/Reveal'

const recommendation = {
  author: 'Sarthak Mohanty',
  relationship: 'Managed Akash directly at LTIMindtree',
  date: 'Aug 31, 2025',
  role:
    'AI Evangelist @ ITM | Agentic AI, Generative AI, AI Data Platforms & Analytics | Delivering AI-infused solutions with a strong focus on Responsible AI',
  paragraphs: [
    'I worked with Akash for 2 years at LTIMindtree, and he stood out from day one. He ramped up quickly on a complex Customer Data Management project, mastered Oracle SQL and Fusion CDM architecture, and delivered solutions that reduced client operational costs by 20%, which led to follow-on business.',
    'Akash is not just technically sharp, he takes full ownership, asks thoughtful questions, and mentors teammates effectively. He is reliable, adaptable, and thrives under pressure. I recommend Akash without hesitation. He is the kind of engineer who raises the bar.',
  ],
} as const

export default function Recommendation() {
  return (
    <section
      id="recommendation"
      aria-labelledby="recommendation-title"
      className="border-t border-ink-200 py-20 dark:border-ink-800"
    >
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <p className="label-mono">Recommendation</p>
            <h2
              id="recommendation-title"
              className="mt-3 text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50 sm:text-4xl"
            >
              What it is like to work with me
            </h2>

            <figure className="mt-8 border-l-2 border-accent-500 pl-6 sm:pl-8">
              <blockquote className="space-y-4 text-lg leading-8 text-ink-700 dark:text-ink-300">
                {recommendation.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </blockquote>

              <figcaption className="mt-7 flex flex-col gap-4 border-t border-ink-200 pt-5 dark:border-ink-800 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-semibold text-ink-900 dark:text-ink-50">
                    {recommendation.author}
                  </p>
                  <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-500 dark:text-ink-400">
                    {recommendation.role}
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-ink-500 dark:text-ink-500">
                    {recommendation.relationship} | {recommendation.date}
                  </p>
                </div>

                <a
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent-700 hover:text-accent-600 dark:text-accent-300 dark:hover:text-accent-200"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  View on LinkedIn
                  <ArrowUpRightIcon className="h-3.5 w-3.5" />
                </a>
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
