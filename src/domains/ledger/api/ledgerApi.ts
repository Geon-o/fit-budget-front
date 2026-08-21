import type { Ledger, LedgerMember } from '../types/ledger.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchLedgers(): Promise<Ledger[]> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers`, { credentials: 'include' })
  if (!res.ok) throw new Error('가계부 목록을 불러오지 못했습니다')
  return res.json()
}

export async function createLedger(name: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('가계부 생성에 실패했습니다')
  return res.json()
}

export async function updateLedger(id: string, name: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('가계부 이름 수정에 실패했습니다')
  return res.json()
}

export async function updateLedgerColor(id: string, color: string): Promise<Ledger> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}/color`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color }),
  })
  if (!res.ok) throw new Error('가계부 색상 변경에 실패했습니다')
  return res.json()
}

export async function deleteLedger(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${id}`, { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error('가계부 삭제에 실패했습니다')
}

export async function fetchLedgerMembers(ledgerId: string): Promise<LedgerMember[]> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/members`, { credentials: 'include' })
  if (!res.ok) throw new Error('공유 멤버 목록을 불러오지 못했습니다')
  return res.json()
}

export async function inviteLedgerMember(ledgerId: string, email: string): Promise<LedgerMember> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/members`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) {
    if (res.status === 404) throw new Error('먼저 구글 로그인을 한 이력이 있는 이메일만 초대할 수 있어요')
    if (res.status === 409) throw new Error('이미 초대된 사용자예요')
    throw new Error('멤버 초대에 실패했습니다')
  }
  return res.json()
}

export async function removeLedgerMember(ledgerId: string, memberId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/ledgers/${ledgerId}/members/${memberId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('멤버 삭제에 실패했습니다')
}
