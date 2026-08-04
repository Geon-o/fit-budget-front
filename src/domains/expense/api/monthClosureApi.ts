const API_BASE_URL = 'http://localhost:8089'

export async function fetchClosedMonths(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/month-closures`)
  if (!res.ok) throw new Error('마감 상태를 불러오지 못했습니다')
  return res.json()
}

export async function closeMonth(yearMonth: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/month-closures/${yearMonth}`, { method: 'POST' })
  if (!res.ok) throw new Error('마감 처리에 실패했습니다')
}

export async function reopenMonth(yearMonth: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/month-closures/${yearMonth}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('마감 취소에 실패했습니다')
}
