'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { navItems, profile } from '@/content/work'
import ThemeToggle from './ThemeToggle'
import CommandPalette from './CommandPalette'
import { CloseIcon, DownloadIcon, MenuIcon } from '@/components/icons'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink-200 bg-white/85 backdrop-blur-md dark:border-ink-800 dark:bg-ink-950/85'
          : 'border-b border-transparent'
      }`}
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center" aria-label="Home">
            <span className="text-sm font-semibold text-ink-900 dark:text-ink-50">
              {profile.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-[14px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <CommandPalette />
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-500 sm:inline-flex"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Resume
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 md:hidden"
            >
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="border-t border-ink-200 bg-white px-5 pb-6 pt-2 dark:border-ink-800 dark:bg-ink-950 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/work"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                All case studies
              </Link>
            </li>
            <li className="pt-2">
              <a
                href={profile.links.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full"
              >
                <DownloadIcon className="h-4 w-4" />
                Resume
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
