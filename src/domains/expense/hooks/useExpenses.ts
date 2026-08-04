import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addExpense as addExpenseApi,
  deleteExpense as deleteExpenseApi,
  fetchExpenses,
  updateExpense as updateExpenseApi,
} from '../api/expenseApi'
import type { Expense } from '../types/expense.types'
import { toYearMonth } from '../../../shared/utils/dateUtils'

export function useExpenses(yearMonth: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchExpenses().then((data) => {
      if (!cancelled) {
        setExpenses(data)
        setIsLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const addExpense = useCallback(async (input: Omit<Expense, 'id' | 'source'>) => {
    const created = await addExpenseApi(input)
    setExpenses((prev) => [...prev, created])
  }, [])

  const updateExpense = useCallback(
    async (id: string, input: Omit<Expense, 'id' | 'source'>) => {
      const updated = await updateExpenseApi(id, input)
      setExpenses((prev) => prev.map((expense) => (expense.id === id ? updated : expense)))
    },
    [],
  )

  const deleteExpense = useCallback(async (id: string) => {
    await deleteExpenseApi(id)
    setExpenses((prev) => prev.filter((expense) => expense.id !== id))
  }, [])

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => toYearMonth(expense.expenseDate) === yearMonth),
    [expenses, yearMonth],
  )

  return { expenses: filteredExpenses, isLoading, addExpense, updateExpense, deleteExpense }
}
