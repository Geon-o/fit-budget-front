import { useCallback, useEffect, useState } from 'react'
import { fetchBudgets, saveBudget as saveBudgetApi } from '../api/budgetApi'
import type { Budget } from '../types/budget.types'

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchBudgets().then((data) => {
      if (!cancelled) {
        setBudgets(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const saveBudget = useCallback(async (input: Omit<Budget, 'id'>) => {
    const saved = await saveBudgetApi(input)
    setBudgets((prev) => {
      const index = prev.findIndex((b) => b.yearMonth === saved.yearMonth)
      if (index >= 0) {
        const next = [...prev]
        next[index] = saved
        return next
      }
      return [...prev, saved]
    })
  }, [])

  return { budgets, isLoading, saveBudget }
}
