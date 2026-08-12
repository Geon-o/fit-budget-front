import { useCallback, useEffect, useState } from 'react'
import {
  addRecurringExpense as addApi,
  deleteRecurringExpense as deleteApi,
  fetchRecurringExpenses,
} from '../api/recurringExpenseApi'
import type { RecurringExpense } from '../types/recurringExpense.types'

export function useRecurringExpenses() {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchRecurringExpenses().then((data) => {
      if (!cancelled) {
        setRecurringExpenses(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addRecurringExpense = useCallback(async (input: Omit<RecurringExpense, 'id'>) => {
    const created = await addApi(input)
    setRecurringExpenses((prev) => [...prev, created])
  }, [])

  const deleteRecurringExpense = useCallback(async (id: string) => {
    await deleteApi(id)
    setRecurringExpenses((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return { recurringExpenses, isLoading, addRecurringExpense, deleteRecurringExpense }
}
