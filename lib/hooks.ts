'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Tracks the OS-level reduced-motion preference and keeps responding to changes
 * rather than reading it once on mount.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefers(query.matches)

    const onChange = (event: MediaQueryListEvent) => setPrefers(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return prefers
}

/**
 * Reports whether the element is currently on screen. Demos use this to stop
 * their animation loops while scrolled away instead of burning CPU in the
 * background.
 */
export function useOnScreen<T extends Element>(
  options?: IntersectionObserverInit
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [onScreen, setOnScreen] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.15, ...options }
    )

    observer.observe(node)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [ref, onScreen]
}

/**
 * Fires once when the element first scrolls into view. Used for reveal
 * animations that should not replay on every scroll pass.
 */
export function useRevealOnce<T extends Element>(
  margin = '-80px'
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || revealed) return

    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { rootMargin: margin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [revealed, margin])

  return [ref, revealed]
}

/**
 * requestAnimationFrame loop that pauses when inactive and hands the callback a
 * delta in milliseconds. Keeping the callback in a ref means the caller can pass
 * a fresh closure each render without restarting the loop.
 */
export function useAnimationLoop(
  callback: (deltaMs: number, elapsedMs: number) => void,
  active: boolean
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!active) return

    let frame = 0
    let last = performance.now()
    let elapsed = 0

    const tick = (now: number) => {
      // Clamp the delta so a backgrounded tab does not resume with a huge jump.
      const delta = Math.min(now - last, 64)
      last = now
      elapsed += delta
      callbackRef.current(delta, elapsed)
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active])
}

/** Counts from zero to `target` once `active` is true. */
export function useCountUp(target: number, active: boolean, durationMs = 1400) {
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!active) return

    if (reduced) {
      setValue(target)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      // Ease-out cubic so the number decelerates into its final value.
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active, durationMs, reduced])

  return value
}
