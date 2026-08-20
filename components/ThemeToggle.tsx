'use client'

import { useTheme } from './ThemeProvider'
import { MoonIcon, SunIcon } from '@/components/icons'

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme` : 'Toggle theme'}
      className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-ink-800 dark:hover:text-ink-100"
    >
      {/* Until mounted the applied theme is unknown to React, so render a
          neutral placeholder to avoid a hydration mismatch. */}
      {!mounted ? (
        <span className="block h-5 w-5" />
      ) : theme === 'dark' ? (
        <SunIcon className="h-5 w-5" />
      ) : (
        <MoonIcon className="h-5 w-5" />
      )}
    </button>
  )
}
