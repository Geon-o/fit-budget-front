import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../../shared/theme'

// ponytail: 웹의 BudgetSettingPage(예산 설정) 화면 이식 전까지 탭 자리만 잡아둔다.
export default function Budget() {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>예산</Text>
      <Text style={styles.sub}>준비 중이에요.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, gap: 8, backgroundColor: colors.bg },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  sub: { fontSize: 15, color: colors.subtle },
})
