import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Button, Text, View } from 'react-native'
import { loginWithGoogle, loginWithNaver } from '../domains/auth'
import { API_BASE_URL } from '../shared/api/client'
import { useAuthContext } from '../providers/AuthProvider'

// webClientId: 서버가 검증하는 id_token의 aud가 되는 "웹 애플리케이션" 클라이언트 ID.
// Android 클라이언트(패키지명+SHA-1)는 콘솔에 등록만 해두면 라이브러리가 알아서 쓴다.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
GoogleSignin.configure({ webClientId })

// 네이버 Callback URL은 http(s)만 허용돼서, 서버 콜백이 code/state를 fitbudget://naver-login으로 넘겨준다.
const naverClientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID
const naverRedirectUri = `${API_BASE_URL}/api/auth/login/naver/callback`

export default function Login() {
  const { refetch } = useAuthContext()
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setError(null)
    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()
      if (response.type !== 'success') return // 사용자가 계정 선택을 취소함
      const idToken = response.data.idToken
      if (!idToken) throw new Error('구글 인증 정보를 받지 못했습니다')
      // 로그인 성공 → 토큰 저장 → refetch로 user가 채워지면 라우트 가드가 홈으로 보낸다.
      await loginWithGoogle(idToken)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다')
    }
  }

  const signInWithNaver = async () => {
    setError(null)
    try {
      const state = Crypto.randomUUID() // CSRF 방지: 돌아온 state가 보낸 값과 같아야 한다
      const url =
        'https://nid.naver.com/oauth2.0/authorize?response_type=code' +
        `&client_id=${encodeURIComponent(naverClientId!)}` +
        `&redirect_uri=${encodeURIComponent(naverRedirectUri)}` +
        `&state=${state}`
      const result = await WebBrowser.openAuthSessionAsync(url, 'fitbudget://naver-login')
      if (result.type !== 'success') return // 사용자가 브라우저를 닫음
      const { code, state: returned } = Linking.parse(result.url).queryParams ?? {}
      if (returned !== state) throw new Error('잘못된 로그인 요청입니다')
      if (typeof code !== 'string') return // 동의 취소 등 (error 파라미터로 돌아옴)
      await loginWithNaver(code, state)
      await refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다')
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Fit Budget</Text>
      <Button title="Google로 로그인" disabled={!webClientId} onPress={signIn} />
      <Button title="네이버로 로그인" disabled={!naverClientId} onPress={signInWithNaver} />
      {!webClientId && <Text>EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID가 설정되지 않았어요</Text>}
      {!naverClientId && <Text>EXPO_PUBLIC_NAVER_CLIENT_ID가 설정되지 않았어요</Text>}
      {error && <Text style={{ color: 'crimson' }}>{error}</Text>}
    </View>
  )
}
