import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  addRecurringExpense as addApi,
  deleteRecurringExpense as deleteApi,
  fetchRecurringExpenses,
} from '../api/recurringExpenseApi'
import type { RecurringExpense } from '../types/recurringExpense.types'

export function useRecurringExpenses(ledgerId: string) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 탭 화면은 마운트된 채로 남아서, 예산 탭에서 바꾼 고정 지출이 달력에도 보이도록 들어올 때마다 다시 불러온다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      fetchRecurringExpenses(ledgerId).then((data) => {
        if (!cancelled) {
          setRecurringExpenses(data)
          setIsLoading(false)
        }
      })
      return () => {
        cancelled = true
      }
    }, [ledgerId]),
  )

  const addRecurringExpense = useCallback(
    async (input: Omit<RecurringExpense, 'id'>) => {
      const created = await addApi(ledgerId, input)
      setRecurringExpenses((prev) => [...prev, created])
    },
    [ledgerId],
  )

  const deleteRecurringExpense = useCallback(
    async (id: string) => {
      await deleteApi(ledgerId, id)
      setRecurringExpenses((prev) => prev.filter((r) => r.id !== id))
    },
    [ledgerId],
  )

  return { recurringExpenses, isLoading, addRecurringExpense, deleteRecurringExpense }
}
