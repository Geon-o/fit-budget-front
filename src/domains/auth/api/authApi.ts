import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { apiFetch, API_BASE_URL, setTokens } from '../../../shared/api/client'
import type { Tokens } from '../../../shared/api/client'
import type { User } from '../types/auth.types'

export async function fetchMe(): Promise<User | null> {
  const res = await apiFetch('/api/auth/me')
  if (res.status === 401) return null
  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다')
  return res.json()
}

/** 구글 id_token을 서버가 검증해 자체 JWT로 교환하고 저장한다. */
export async function loginWithGoogle(idToken: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error('로그인에 실패했습니다')
  await setTokens((await res.json()) as Tokens)
}

/** 네이버 authorization code를 서버가 client secret으로 교환해 자체 JWT를 발급한다. */
export async function loginWithNaver(code: string, state: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login/naver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
  })
  if (!res.ok) throw new Error('로그인에 실패했습니다')
  await setTokens((await res.json()) as Tokens)
}

export async function logout(): Promise<void> {
  await setTokens(null)
  // 구글 세션도 끊어야 다음 로그인 때 계정 선택 창이 다시 뜬다.
  await GoogleSignin.signOut().catch(() => {})
}
