import { useCallback, useEffect, useState } from 'react'
import {
  addRecurringExpense as addApi,
  deleteRecurringExpense as deleteApi,
  fetchRecurringExpenses,
} from '../api/recurringExpenseApi'
import type { RecurringExpense } from '../types/recurringExpense.types'

export function useRecurringExpenses(ledgerId: string) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, [ledgerId])

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
