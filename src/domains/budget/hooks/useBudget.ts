import { useCallback, useEffect, useState } from 'react'
import { fetchBudget, saveBudget } from '../api/budgetApi'
import type { Budget } from '../types/budget.types'

export function useBudget(yearMonth: string) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchBudget(yearMonth).then((data) => {
      if (!cancelled) {
        setBudget(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [yearMonth])

  const updateBudget = useCallback(async (input: Omit<Budget, 'id' | 'yearMonth'>) => {
    const saved = await saveBudget({ ...input, yearMonth })
    setBudget(saved)
  }, [yearMonth])

  return { budget, isLoading, updateBudget }
}
