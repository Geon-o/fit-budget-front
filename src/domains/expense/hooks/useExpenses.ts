import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import {
  addExpense as addExpenseApi,
  deleteExpense as deleteExpenseApi,
  fetchExpenses,
  updateExpense as updateExpenseApi,
} from '../api/expenseApi'
import type { Expense } from '../types/expense.types'
import { toYearMonth } from '../../../shared/utils/dateUtils'

export function useExpenses(ledgerId: string, yearMonth: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 탭 화면은 마운트된 채로 남아서, 다른 탭에서 바꾼 지출이 보이도록 화면에 들어올 때마다 다시 불러온다.
  // 처음 이후로는 로딩 표시 없이 조용히 갱신한다.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false
      fetchExpenses(ledgerId).then((data) => {
        if (!cancelled) {
          setExpenses(data)
          setIsLoading(false)
        }
      })
      return () => {
        cancelled = true
      }
    }, [ledgerId]),
  )

  const addExpense = useCallback(
    async (input: Omit<Expense, 'id' | 'source'>) => {
      const created = await addExpenseApi(ledgerId, input)
      setExpenses((prev) => [...prev, created])
    },
    [ledgerId],
  )

  const updateExpense = useCallback(
    async (id: string, input: Omit<Expense, 'id' | 'source'>) => {
      const updated = await updateExpenseApi(ledgerId, id, input)
      setExpenses((prev) => prev.map((expense) => (expense.id === id ? updated : expense)))
    },
    [ledgerId],
  )

  const deleteExpense = useCallback(
    async (id: string) => {
      await deleteExpenseApi(ledgerId, id)
      setExpenses((prev) => prev.filter((expense) => expense.id !== id))
    },
    [ledgerId],
  )

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => toYearMonth(expense.expenseDate) === yearMonth),
    [expenses, yearMonth],
  )

  return { expenses: filteredExpenses, isLoading, addExpense, updateExpense, deleteExpense }
}
