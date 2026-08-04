import { useCallback, useEffect, useState } from 'react'
import { closeMonth, fetchClosedMonths, reopenMonth } from '../api/monthClosureApi'

export function useClosedMonths() {
  const [closedMonths, setClosedMonths] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetchClosedMonths().then((data) => {
      if (!cancelled) setClosedMonths(data)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const isClosed = useCallback(
    (yearMonth: string) => closedMonths.includes(yearMonth),
    [closedMonths],
  )

  const toggleClosed = useCallback(
    async (yearMonth: string) => {
      if (closedMonths.includes(yearMonth)) {
        await reopenMonth(yearMonth)
        setClosedMonths((prev) => prev.filter((m) => m !== yearMonth))
      } else {
        await closeMonth(yearMonth)
        setClosedMonths((prev) => [...prev, yearMonth])
      }
    },
    [closedMonths],
  )

  return { isClosed, toggleClosed }
}
