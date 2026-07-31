import { useEffect, useRef, useState } from 'react'

/**
 * Animates from 0 to `target` only when `isActive` flips false -> true.
 * While `isActive` stays true, subsequent `target` changes are reflected immediately without animating.
 */
export function useCountUp(target: number, isActive: boolean, duration = 600): number {
  const [value, setValue] = useState(target)
  const wasActiveRef = useRef(isActive)
  const rafRef = useRef(0)

  useEffect(() => {
    const justBecameActive = isActive && !wasActiveRef.current
    wasActiveRef.current = isActive

    if (!justBecameActive) {
      setValue(target)
      return
    }

    const start = performance.now()

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive, target, duration])

  return value
}
