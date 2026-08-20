import type { RecurringExpense } from '../types/recurringExpense.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchRecurringExpenses(ledgerId: string): Promise<RecurringExpense[]> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/recurring-expenses`)
  if (!res.ok) throw new Error('고정 지출 목록을 불러오지 못했습니다')
  return res.json()
}

export async function addRecurringExpense(
  ledgerId: string,
  input: Omit<RecurringExpense, 'id'>,
): Promise<RecurringExpense> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/recurring-expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error('고정 지출 등록에 실패했습니다')
  return res.json()
}

export async function deleteRecurringExpense(ledgerId: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/recurring-expenses/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('고정 지출 삭제에 실패했습니다')
}
