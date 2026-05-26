import { useState, useRef, useCallback } from "react"

/**
 * Hook to manage PIN input masking behavior:
 * - When a digit is typed, show it briefly as plaintext for `durationMs`
 * - When focus moves to next box, immediately mask the previous one
 * - All boxes revert to password type automatically
 */
export function usePinMasking(durationMs = 500) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  /** Show digit at index as plaintext for durationMs, then mask */
  const showDigit = useCallback(
    (index: number) => {
      // Clear any existing timer for this index
      const existing = timers.current.get(index)
      if (existing) {
        clearTimeout(existing)
        timers.current.delete(index)
      }

      setVisibleIndices((prev) => new Set([...prev, index]))

      const timer = setTimeout(() => {
        setVisibleIndices((prev) => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
        timers.current.delete(index)
      }, durationMs)

      timers.current.set(index, timer)
    },
    [durationMs]
  )

  /** Immediately mask digit at index (cancel any pending timer) */
  const hideDigit = useCallback((index: number) => {
    const existing = timers.current.get(index)
    if (existing) {
      clearTimeout(existing)
      timers.current.delete(index)
    }
    setVisibleIndices((prev) => {
      const next = new Set(prev)
      next.delete(index)
      return next
    })
  }, [])

  /** Immediately mask all digits */
  const hideAll = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current.clear()
    setVisibleIndices(new Set())
  }, [])

  /** Whether a given index is currently showing plaintext */
  const isVisible = useCallback(
    (index: number) => visibleIndices.has(index),
    [visibleIndices]
  )

  return { showDigit, hideDigit, hideAll, isVisible }
}
