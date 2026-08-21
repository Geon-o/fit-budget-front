import type { Expense } from '../types/expense.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchExpenses(ledgerId: string): Promise<Expense[]> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/expenses`, { credentials: 'include' })
  if (!res.ok) throw new Error('지출 목록을 불러오지 못했습니다')
  return res.json()
}

export async function addExpense(
  ledgerId: string,
  input: Omit<Expense, 'id' | 'source'>,
): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/expenses`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('지출 등록에 실패했습니다')
  return res.json()
}

export async function updateExpense(
  ledgerId: string,
  id: string,
  input: Omit<Expense, 'id' | 'source'>,
): Promise<Expense> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/expenses/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('지출 수정에 실패했습니다')
  return res.json()
}

export async function deleteExpense(ledgerId: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/expenses/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('지출 삭제에 실패했습니다')
}
