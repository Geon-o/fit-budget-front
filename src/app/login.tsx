import { GoogleSignin } from '@react-native-google-signin/google-signin'
import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { loginWithGoogle, loginWithNaver } from '../domains/auth'
import { API_BASE_URL } from '../shared/api/client'
import { useAuthContext } from '../providers/AuthProvider'
import { colors } from '../shared/theme'

// webClientId: 서버가 검증하는 id_token의 aud가 되는 "웹 애플리케이션" 클라이언트 ID.
// Android 클라이언트(패키지명+SHA-1)는 콘솔에 등록만 해두면 라이브러리가 알아서 쓴다.
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
GoogleSignin.configure({ webClientId })

// 네이버 Callback URL은 http(s)만 허용돼서, 서버 콜백이 code/state를 fitbudget://naver-login으로 넘겨준다.
const naverClientId = process.env.EXPO_PUBLIC_NAVER_CLIENT_ID
const naverRedirectUri = `${API_BASE_URL}/api/auth/login/naver/callback`

export default function Login() {
  const { refetch } = useAuthContext()
  const insets = useSafeAreaInsets()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 로그인 성공 → 토큰 저장 → refetch로 user가 채워지면 라우트 가드가 홈으로 보낸다.
  // 진행 중에는 버튼을 막아 중복 요청을 막고, 취소/실패는 문구만 보여준다.
  const run = async (login: () => Promise<void>) => {
    setError(null)
    setBusy(true)
    try {
      await login()
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그인에 실패했습니다')
    } finally {
      setBusy(false)
    }
  }

  const signIn = () =>
    run(async () => {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()
      if (response.type !== 'success') return // 사용자가 계정 선택을 취소함
      const idToken = response.data.idToken
      if (!idToken) throw new Error('구글 인증 정보를 받지 못했습니다')
      await loginWithGoogle(idToken)
      await refetch()
    })

  const signInWithNaver = () =>
    run(async () => {
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
    })

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Text style={styles.wordmark}>Fit Budget</Text>
        <Text style={styles.headline}>
          오늘 쓸 수 있는 돈,{'\n'}
          <Text style={{ color: colors.accent }}>한눈에.</Text>
        </Text>
        <Text style={styles.sub}>예산을 정하면 하루에 쓸 금액을 알려드려요.</Text>
      </View>

      <View style={styles.actions}>
        {/* 버튼 색·로고는 네이버/구글 로그인 버튼 가이드를 따른다 */}
        <Pressable
          style={[styles.button, styles.naver, (busy || !naverClientId) && styles.disabled]}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          disabled={busy || !naverClientId}
          onPress={signInWithNaver}
        >
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path fill="#FFFFFF" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z" />
          </Svg>
          <Text style={[styles.label, { color: '#FFFFFF' }]}>네이버로 로그인</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.google, (busy || !webClientId) && styles.disabled]}
          android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
          disabled={busy || !webClientId}
          onPress={signIn}
        >
          <Svg width={18} height={18} viewBox="0 0 48 48">
            <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </Svg>
          <Text style={[styles.label, { color: '#1F1F1F' }]}>Google로 로그인</Text>
        </Pressable>

        {busy && <ActivityIndicator color={colors.subtle} />}
        {!naverClientId && <Text style={styles.note}>EXPO_PUBLIC_NAVER_CLIENT_ID가 설정되지 않았어요</Text>}
        {!webClientId && <Text style={styles.note}>EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID가 설정되지 않았어요</Text>}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, justifyContent: 'space-between' },
  hero: { flex: 1, justifyContent: 'center', gap: 16 },
  wordmark: { fontSize: 16, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  headline: { fontSize: 36, lineHeight: 46, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  sub: { fontSize: 15, color: colors.subtle },
  actions: { gap: 12 },
  button: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    overflow: 'hidden', // android_ripple이 둥근 모서리를 넘지 않게
  },
  naver: { backgroundColor: '#03C75A' },
  google: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#747775' },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '600' },
  note: { fontSize: 13, color: colors.subtle, textAlign: 'center' },
  error: { fontSize: 14, color: colors.danger, textAlign: 'center' },
})
