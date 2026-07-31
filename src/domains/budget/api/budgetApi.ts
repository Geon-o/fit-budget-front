import type { Budget } from '../types/budget.types'

const mockBudgets: Budget[] = [
  {
    id: '1',
    yearMonth: '2026-06',
    monthlyBudget: 750000,
    savingGoal: 150000,
    paymentDate: '2026-07-25',
  },
  {
    id: '2',
    yearMonth: '2026-07',
    monthlyBudget: 800000,
    savingGoal: 200000,
    paymentDate: '2026-08-25',
  },
]

export async function fetchBudgets(): Promise<Budget[]> {
  return Promise.resolve([...mockBudgets])
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
