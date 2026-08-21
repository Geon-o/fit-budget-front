import type { User } from '../types/auth.types'

const API_BASE_URL = 'http://localhost:8089'

export async function fetchMe(): Promise<User | null> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다')
  return res.json()
}

export function getLoginUrl(provider: 'google' | 'naver'): string {
  return `${API_BASE_URL}/oauth2/authorization/${provider}`
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include' })
  if (!res.ok) throw new Error('로그아웃에 실패했습니다')
}
