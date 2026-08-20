import type { Ledger } from '../types/ledger.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchLedgers(): Promise<Ledger[]> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers`)
  if (!res.ok) throw new Error('가계부 목록을 불러오지 못했습니다')
  return res.json()
}

export async function createLedger(name: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('가계부 생성에 실패했습니다')
  return res.json()
}

export async function updateLedger(id: string, name: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('가계부 이름 수정에 실패했습니다')
  return res.json()
}

export async function updateLedgerColor(id: string, color: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}/color`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color }),
  })
  if (!res.ok) throw new Error('가계부 색상 변경에 실패했습니다')
  return res.json()
}

export async function deleteLedger(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('가계부 삭제에 실패했습니다')
}
