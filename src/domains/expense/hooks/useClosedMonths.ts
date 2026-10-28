import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { closeMonth, fetchClosedMonths, reopenMonth } from '../api/monthClosureApi'

export function useClosedMonths(ledgerId: string) {
  const [closedMonths, setClosedMonths] = useState<string[]>([])

  // 지출 탭에서 마감하면 예산 탭에도 바로 잠기도록 화면에 들어올 때마다 다시 불러온다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      fetchClosedMonths(ledgerId).then((data) => {
        if (!cancelled) setClosedMonths(data)
      })
      return () => {
        cancelled = true
      }
    }, [ledgerId]),
  )

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
