import { apiFetch } from '../../../shared/api/client'
export async function fetchClosedMonths(ledgerId: string): Promise<string[]> {
  const res = await apiFetch(`/api/ledgers/${ledgerId}/month-closures`)
  if (!res.ok) throw new Error('마감 상태를 불러오지 못했습니다')
  return res.json()
}

export async function closeMonth(ledgerId: string, yearMonth: string): Promise<void> {
  const res = await apiFetch(`/api/ledgers/${ledgerId}/month-closures/${yearMonth}`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error('마감 처리에 실패했습니다')
}

export async function reopenMonth(ledgerId: string, yearMonth: string): Promise<void> {
  const res = await apiFetch(`/api/ledgers/${ledgerId}/month-closures/${yearMonth}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('마감 취소에 실패했습니다')
}
