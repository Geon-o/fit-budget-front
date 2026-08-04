import type { Budget } from '../types/budget.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchBudgets(): Promise<Budget[]> {
  const res = await fetch(`${API_BASE_URL}/api/budgets`)
  if (!res.ok) throw new Error('예산 목록을 불러오지 못했습니다')
  return res.json()
}

export async function saveBudget(input: Omit<Budget, 'id'>): Promise<Budget> {
  const res = await fetch(`${API_BASE_URL}/api/budgets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('예산 저장에 실패했습니다')
  return res.json()
}
