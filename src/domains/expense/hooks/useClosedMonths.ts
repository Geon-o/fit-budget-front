import { useCallback, useEffect, useState } from 'react'
import { closeMonth, fetchClosedMonths, reopenMonth } from '../api/monthClosureApi'

export function useClosedMonths(ledgerId: string) {
  const [closedMonths, setClosedMonths] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    fetchClosedMonths(ledgerId).then((data) => {
      if (!cancelled) setClosedMonths(data)
    })
    return () => {
      cancelled = true
    }
  }, [ledgerId])

  const isClosed = useCallback(
    (yearMonth: string) => closedMonths.includes(yearMonth),
    [closedMonths],
  )

  const toggleClosed = useCallback(
    async (yearMonth: string) => {
      if (closedMonths.includes(yearMonth)) {
        await reopenMonth(ledgerId, yearMonth)
        setClosedMonths((prev) => prev.filter((m) => m !== yearMonth))
      } else {
        await closeMonth(ledgerId, yearMonth)
        setClosedMonths((prev) => [...prev, yearMonth])
      }
    },
    [ledgerId, closedMonths],
  )

  return { isClosed, toggleClosed }
}
