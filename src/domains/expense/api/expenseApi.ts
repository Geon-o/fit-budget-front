import type { Expense } from '../types/expense.types'

const mockExpenses: Expense[] = [
  { id: '1', expenseDate: '2026-07-02', amount: 8500, category: '식비', memo: '김밥천국', source: 'manual' },
  { id: '2', expenseDate: '2026-07-05', amount: 45000, category: '쇼핑', memo: '옷 구매', source: 'manual' },
  { id: '3', expenseDate: '2026-07-10', amount: 12000, category: '교통', memo: '택시', source: 'manual' },
  { id: '4', expenseDate: '2026-07-15', amount: 65000, category: '주거/통신', memo: '통신비', source: 'manual' },
  { id: '5', expenseDate: '2026-07-20', amount: 32000, category: '문화/여가', memo: '영화관', source: 'manual' },
  { id: '6', expenseDate: '2026-07-25', amount: 9000, category: '식비', memo: '편의점', source: 'manual' },
]

export async function fetchExpenses(): Promise<Expense[]> {
  return Promise.resolve([...mockExpenses])
}

export async function addExpense(input: Omit<Expense, 'id' | 'source'>): Promise<Expense> {
  const expense: Expense = { ...input, id: crypto.randomUUID(), source: 'manual' }
  mockExpenses.push(expense)
  return Promise.resolve(expense)
}
