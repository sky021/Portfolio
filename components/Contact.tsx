'use client'

import { useActionState, useEffect, useRef } from 'react'
import {
  initialContactState,
  submitContactForm,
  type ContactFormState,
} from '@/app/actions/contact'
import { profile } from '@/content/work'
import {
  ArrowRightIcon,
  CheckIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
} from '@/components/icons'

const fieldClass =
  'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-accent-500 focus:outline-none dark:border-ink-800 dark:bg-ink-900/60 dark:text-ink-100 dark:placeholder:text-ink-600'

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null
  return (
    <p className="mt-1.5 text-[13px] text-rose-600 dark:text-rose-400">{messages[0]}</p>
  )
}

export default function Contact() {
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    initialContactState
  )
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <section id="contact" className="border-t border-ink-200 py-20 dark:border-ink-800 sm:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="label-mono">Contact</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink-900 text-balance dark:text-ink-50 sm:text-4xl">
              Hiring, or want to dig into one of these systems?
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-ink-600 dark:text-ink-400">
              Happy to walk through any of the architecture decisions in detail, including the ones
              that did not work out. Fastest way to reach me is email.
            </p>

            <ul className="mt-8 space-y-3">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex items-center gap-3 text-[15px] text-ink-700 transition-colors hover:text-accent-700 dark:text-ink-300 dark:hover:text-accent-300"
                >
                  <MailIcon className="h-4 w-4 text-ink-400" />
                  {profile.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-[15px] text-ink-700 dark:text-ink-300">
                <MapPinIcon className="h-4 w-4 text-ink-400" />
                {profile.location}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={profile.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !px-4 !py-2.5 !text-[13px]"
              >
                <GitHubIcon className="h-4 w-4" />
                GitHub
              </a>
              <a
                href={profile.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !px-4 !py-2.5 !text-[13px]"
              >
                <LinkedInIcon className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href={profile.links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !px-4 !py-2.5 !text-[13px]"
              >
                Resume
              </a>
            </div>
          </div>

          <form ref={formRef} action={formAction} className="space-y-4">
            <div>
              <label htmlFor="name" className="label-mono mb-1.5 block">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name"
                className={fieldClass}
                aria-invalid={Boolean(state.errors?.name)}
              />
              <FieldError messages={state.errors?.name} />
            </div>

            <div>
              <label htmlFor="email" className="label-mono mb-1.5 block">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                className={fieldClass}
                aria-invalid={Boolean(state.errors?.email)}
              />
              <FieldError messages={state.errors?.email} />
            </div>

            <div>
              <label htmlFor="message" className="label-mono mb-1.5 block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                placeholder="What would you like to talk about?"
                className={`${fieldClass} resize-y`}
                aria-invalid={Boolean(state.errors?.message)}
              />
              <FieldError messages={state.errors?.message} />
            </div>

            {/* Honeypot: positioned off-screen rather than display:none so that
                bots which skip hidden inputs still fill it. */}
            <div className="absolute left-[-9999px]" aria-hidden="true">
              <label htmlFor="company_website">Company website</label>
              <input id="company_website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full">
              {isPending ? 'Sending…' : 'Send message'}
              {!isPending && <ArrowRightIcon className="h-4 w-4" />}
            </button>

            {state.message && (
              <p
                role="status"
                className={`flex items-start gap-2 rounded-xl border p-3.5 text-[14px] ${
                  state.success
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                }`}
              >
                {state.success && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />}
                {state.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
