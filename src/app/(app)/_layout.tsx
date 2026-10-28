import { Stack } from 'expo-router'
import { LedgerProvider } from '../../providers/LedgerProvider'
import { colors } from '../../shared/theme'

// 로그인한 뒤에만 마운트되므로 LedgerProvider의 가계부 조회가 인증 전에 나가지 않는다.
export default function AppLayout() {
  return (
    <LedgerProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
    </LedgerProvider>
  )
}
