'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { caseStudies, navItems, profile } from '@/content/work'
import { useTheme } from './ThemeProvider'
import {
  ArrowRightIcon,
  CloseIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  MoonIcon,
  SearchIcon,
  SparkIcon,
  SunIcon,
} from '@/components/icons'

type Command = {
  id: string
  label: string
  hint?: string
  group: 'Case studies' | 'Navigate' | 'Links' | 'Preferences'
  icon: React.ComponentType<{ className?: string }>
  run: () => void
}

export default function CommandPalette() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActiveIndex(0)
  }, [])

  const commands = useMemo<Command[]>(() => {
    const openExternal = (href: string) => () => {
      window.open(href, '_blank', 'noopener,noreferrer')
    }

    return [
      ...caseStudies.map((study) => ({
        id: `case-${study.slug}`,
        label: study.title,
        hint: study.context,
        group: 'Case studies' as const,
        icon: SparkIcon,
        run: () => router.push(`/work/${study.slug}`),
      })),
      {
        id: 'nav-work-index',
        label: 'All case studies',
        group: 'Navigate' as const,
        icon: ArrowRightIcon,
        run: () => router.push('/work'),
      },
      ...navItems.map((item) => ({
        id: `nav-${item.href}`,
        label: item.label,
        hint: item.href,
        group: 'Navigate' as const,
        icon: ArrowRightIcon,
        run: () => router.push(item.href),
      })),
      {
        id: 'link-resume',
        label: 'Open resume (PDF)',
        group: 'Links' as const,
        icon: ArrowRightIcon,
        run: openExternal(profile.links.resume),
      },
      {
        id: 'link-github',
        label: 'GitHub',
        hint: 'github.com/sky021',
        group: 'Links' as const,
        icon: GitHubIcon,
        run: openExternal(profile.links.github),
      },
      {
        id: 'link-linkedin',
        label: 'LinkedIn',
        group: 'Links' as const,
        icon: LinkedInIcon,
        run: openExternal(profile.links.linkedin),
      },
      {
        id: 'link-email',
        label: 'Send an email',
        hint: profile.email,
        group: 'Links' as const,
        icon: MailIcon,
        run: () => {
          window.location.href = `mailto:${profile.email}`
        },
      },
      {
        id: 'pref-theme',
        label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        group: 'Preferences' as const,
        icon: theme === 'dark' ? SunIcon : MoonIcon,
        run: toggleTheme,
      },
    ]
  }, [router, theme, toggleTheme])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter((command) =>
      `${command.label} ${command.hint ?? ''} ${command.group}`.toLowerCase().includes(needle)
    )
  }, [commands, query])

  // Global shortcut.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
        return
      }
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [close])

  useEffect(() => {
    if (open) {
      // Defer so the input exists before focusing.
      const frame = requestAnimationFrame(() => inputRef.current?.focus())
      document.body.style.overflow = 'hidden'
      return () => {
        cancelAnimationFrame(frame)
        document.body.style.overflow = ''
      }
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  const runCommand = useCallback(
    (command: Command) => {
      close()
      command.run()
    },
    [close]
  )

  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const command = filtered[activeIndex]
      if (command) runCommand(command)
    }
  }

  let lastGroup = ''

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] text-ink-500 transition-colors hover:border-ink-300 hover:text-ink-700 dark:border-ink-800 dark:hover:border-ink-700 dark:hover:text-ink-300 sm:inline-flex"
        aria-label="Open command palette"
      >
        <SearchIcon className="h-3.5 w-3.5" />
        <span>Search</span>
        <kbd className="ml-1 rounded border border-ink-200 px-1 font-mono text-[10px] dark:border-ink-700">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <button
            type="button"
            aria-label="Close command palette"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink-950/50 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-2.5 border-b border-ink-200 px-4 dark:border-ink-800">
              <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onListKeyDown}
                placeholder="Search case studies, sections, links…"
                className="w-full bg-transparent py-3.5 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none dark:text-ink-100"
                aria-label="Search commands"
              />
              <button
                type="button"
                onClick={close}
                className="shrink-0 rounded p-1 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
                aria-label="Close"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <ul ref={listRef} className="scrollbar-slim max-h-80 overflow-y-auto p-2">
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-ink-500 dark:text-ink-400">
                  Nothing matches that.
                </li>
              )}
              {filtered.map((command, index) => {
                const showGroup = command.group !== lastGroup
                lastGroup = command.group
                const Icon = command.icon

                return (
                  <li key={command.id}>
                    {showGroup && (
                      <p className="label-mono px-2 pb-1 pt-3 first:pt-1">{command.group}</p>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runCommand(command)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors ${
                        index === activeIndex
                          ? 'bg-accent-500/10 text-ink-900 dark:text-ink-50'
                          : 'text-ink-600 dark:text-ink-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-ink-400" />
                      <span className="flex-1 truncate">{command.label}</span>
                      {command.hint && (
                        <span className="truncate font-mono text-[11px] text-ink-400 dark:text-ink-500">
                          {command.hint}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            <p className="border-t border-ink-200 px-4 py-2 font-mono text-[10px] text-ink-400 dark:border-ink-800 dark:text-ink-500">
              ↑↓ to navigate · ↵ to select · esc to close
            </p>
          </div>
        </div>
      )}
    </>
  )
}
