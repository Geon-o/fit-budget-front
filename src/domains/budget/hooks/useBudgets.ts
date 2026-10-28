import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { fetchBudgets, saveBudget as saveBudgetApi } from '../api/budgetApi'
import type { Budget } from '../types/budget.types'

export function useBudgets(ledgerId: string) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 탭 화면은 마운트된 채로 남아서, 예산 탭에서 바꾼 값이 보이도록 화면에 들어올 때마다 다시 불러온다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      fetchBudgets(ledgerId).then((data) => {
        if (!cancelled) {
          setBudgets(data)
          setIsLoading(false)
        }
      })
      return () => {
        cancelled = true
      }
    }, [ledgerId]),
  )

  const saveBudget = useCallback(
    async (input: Omit<Budget, 'id'>) => {
      const saved = await saveBudgetApi(ledgerId, input)
      setBudgets((prev) => {
        const index = prev.findIndex((b) => b.yearMonth === saved.yearMonth)
        if (index >= 0) {
          const next = [...prev]
          next[index] = saved
          return next
        }
        return [...prev, saved]
      })
    },
    [ledgerId],
  )

  return { budgets, isLoading, saveBudget }
}
