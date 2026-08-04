import type { Expense } from '../types/expense.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await fetch(`${API_BASE_URL}/api/expenses`)
  if (!res.ok) throw new Error('지출 목록을 불러오지 못했습니다')
  return res.json()
}

export async function addExpense(input: Omit<Expense, 'id' | 'source'>): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('지출 등록에 실패했습니다')
  return res.json()
}

export async function updateExpense(
  id: string,
  input: Omit<Expense, 'id' | 'source'>,
): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('지출 수정에 실패했습니다')
  return res.json()
}

export async function deleteExpense(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/expenses/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('지출 삭제에 실패했습니다')
}
