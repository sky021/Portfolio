import Reveal from '@/components/Reveal'

const principles = [
  {
    title: 'Start with the customer problem',
    detail:
      'I work backward from who needs the product, what is failing today, and what a useful outcome looks like.',
  },
  {
    title: 'Design for the failure case',
    detail:
      'Bounded retries, re-identification after occlusion, and refusing to decrypt before classifying all address what happens when something goes wrong.',
  },
  {
    title: 'Make quality continuous',
    detail:
      'RAGAS evaluation on the agent, validation inside the ETL pipeline, SonarQube in the merge path. Standards that run automatically are the ones that hold.',
  },
  {
    title: 'Reproducibility is infrastructure',
    detail:
      'Docker and Terraform removed config drift from a research pipeline whose conclusions depended on being re-runnable.',
  },
]

export default function About() {
  return (
    <section id="about" className="border-t border-ink-200 py-20 dark:border-ink-800 sm:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="label-mono">About</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-4xl">
              I build from customer problems backward
            </h2>

            <div className="prose-body mt-6">
              <p>
                I am a Software Engineer - AI at <strong>NewsGenie</strong>, where I build a
                real-time content protection service for publishers. Outside work, I am building
                <strong> Regalia Pass On</strong> to help students reuse graduation attire and
                rebuilding <strong>ReFocus.AI</strong>, my hackathon productivity prototype, for a
                public launch.
              </p>
              <p>
                Previously, at <strong>Arizona State University</strong>, I replaced a forty-hour
                research workflow with a serverless deep learning pipeline. At
                <strong> LTIMindtree</strong>, I built financial middleware for CITI Bank and worked
                on a ten-million-record master data migration for Avery Dennison.
              </p>
              <p>
                I earned my M.S. in Computer Science from Arizona State University in December 2025.
                My team also placed 239th out of 10,000 teams in ICPC 2019. I am based in Mesa,
                Arizona and open to relocation.
              </p>
            </div>
          </div>

          <div>
            <p className="label-mono mb-6">How I work</p>
            <ul className="space-y-5">
              {principles.map((principle, index) => (
                <li key={principle.title}>
                  <Reveal delay={index * 70}>
                    <div className="border-l-2 border-accent-500/40 pl-4">
                      <h3 className="text-[15px] font-semibold text-ink-900 dark:text-ink-50">
                        {principle.title}
                      </h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-600 dark:text-ink-400">
                        {principle.detail}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
