import { useEffect, useState } from 'react'
import { fetchExpenses } from '../api/expenseApi'
import { toYearMonth } from '../../../shared/utils/dateUtils'

export function useMonthlyTotals() {
  const [totals, setTotals] = useState<Map<string, number>>(new Map())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchExpenses().then((data) => {
      if (cancelled) return
      const map = new Map<string, number>()
      for (const expense of data) {
        const ym = toYearMonth(expense.expenseDate)
        map.set(ym, (map.get(ym) ?? 0) + expense.amount)
      }
      setTotals(map)
      setIsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { totals, isLoading }
}
