'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  mounted: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  mounted: false,
  toggleTheme: () => {},
})

/**
 * The class on <html> is set by a blocking script in the document head, so this
 * provider reads the already-applied theme rather than deciding it after mount.
 * That is what prevents the flash of the wrong theme on first paint.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const root = document.documentElement

    // Suppress transitions for the swap so every surface does not cross-fade.
    root.classList.add('theme-switching')
    root.classList.remove('light', 'dark')
    root.classList.add(next)
    root.style.colorScheme = next

    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private browsing modes can reject storage; the theme still applies.
    }

    window.setTimeout(() => root.classList.remove('theme-switching'), 120)
    setTheme(next)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, mounted, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

/**
 * Runs before first paint to apply the stored or system theme.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('theme');var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t}catch(e){document.documentElement.classList.add('light')}})();`
