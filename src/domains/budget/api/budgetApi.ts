import type { Budget } from '../types/budget.types'

const mockBudgets: Budget[] = [
  {
    id: '1',
    yearMonth: '2026-07',
    monthlyBudget: 800000,
    savingGoal: 200000,
    paymentDate: '2026-08-25',
  },
]

export async function fetchBudget(yearMonth: string): Promise<Budget | null> {
  const found = mockBudgets.find((b) => b.yearMonth === yearMonth)
  return Promise.resolve(found ? { ...found } : null)
}

export async function saveBudget(input: Omit<Budget, 'id'>): Promise<Budget> {
  const existingIndex = mockBudgets.findIndex((b) => b.yearMonth === input.yearMonth)
  if (existingIndex >= 0) {
    const updated: Budget = { ...input, id: mockBudgets[existingIndex].id }
    mockBudgets[existingIndex] = updated
    return Promise.resolve({ ...updated })
  }
  const created: Budget = { ...input, id: crypto.randomUUID() }
  mockBudgets.push(created)
  return Promise.resolve({ ...created })
}
