import * as SecureStore from 'expo-secure-store'

// 실기기에서는 .env의 EXPO_PUBLIC_API_URL을 서버 주소(Cloudflare 도메인 또는 PC의 LAN IP)로 지정한다.
// 기본값 10.0.2.2는 안드로이드 에뮬레이터에서 본 호스트 PC.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8089'

const TOKEN_KEY = 'authTokens'

export interface Tokens {
  accessToken: string
  refreshToken: string
}

let cached: Tokens | null | undefined

export async function getTokens(): Promise<Tokens | null> {
  if (cached === undefined) {
    const raw = await SecureStore.getItemAsync(TOKEN_KEY)
    cached = raw ? (JSON.parse(raw) as Tokens) : null
  }
  return cached
}

export async function setTokens(tokens: Tokens | null): Promise<void> {
  cached = tokens
  if (tokens) await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens))
  else await SecureStore.deleteItemAsync(TOKEN_KEY)
}

let refreshing: Promise<boolean> | null = null

// 동시에 여러 요청이 401을 받아도 refresh는 한 번만 보낸다.
function refresh(): Promise<boolean> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function doRefresh(): Promise<boolean> {
  const tokens = await getTokens()
  if (!tokens) return false
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  })
  if (!res.ok) {
    // refresh 토큰 자체가 거절된 경우에만 로그아웃 처리 (네트워크/서버 오류에서는 토큰 유지)
    if (res.status === 401) await setTokens(null)
    return false
  }
  await setTokens((await res.json()) as Tokens)
  return true
}

/** Bearer 토큰을 붙여 호출하고, 401이면 refresh 후 한 번 재시도한다. path는 `/api/...` */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = async () => {
    const tokens = await getTokens()
    const headers = new Headers(init.headers)
    if (tokens) headers.set('Authorization', `Bearer ${tokens.accessToken}`)
    return fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  }
  const res = await send()
  if (res.status !== 401 || !(await refresh())) return res
  return send()
}
