import { router } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { logout } from '../../domains/auth'
import { useAuthContext } from '../../providers/AuthProvider'
import { useLedger } from '../../providers/LedgerProvider'
import { colors } from '../../shared/theme'

const ACCENT_COLORS = ['#d99b6c', '#6c9bd9', '#8fb96c', '#b06cd9', '#d96c8f', '#6cc2c2']
const MAX_NAME = 10

export default function LedgerList() {
  const { user, refetch } = useAuthContext()
  const insets = useSafeAreaInsets()
  const { ledgerId, ledgers, setLedgerId, addLedger, renameLedger, setLedgerColor, deleteLedger } = useLedger()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [colorPickerId, setColorPickerId] = useState<string | null>(null)

  // 서버 호출이 실패해도 앱이 죽지 않고 알려주기만 한다.
  const run = async (action: () => Promise<void>) => {
    try {
      await action()
    } catch (e) {
      Alert.alert('오류', e instanceof Error ? e.message : '요청에 실패했어요')
    }
  }

  const submitNew = () =>
    run(async () => {
      const name = newName.trim()
      if (!name) return
      await addLedger(name)
      setNewName('')
      setIsAdding(false)
    })

  const submitEdit = () =>
    run(async () => {
      const name = editName.trim()
      if (name && editingId) await renameLedger(editingId, name)
      setEditingId(null)
    })

  const confirmDelete = (id: string, name: string) =>
    Alert.alert('가계부 삭제', `'${name}' 가계부를 삭제할까요? 안의 지출/예산/고정지출 기록이 모두 함께 삭제돼요.`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => run(() => deleteLedger(id)) },
    ])

  return (
    <ScrollView
      style={[styles.screen, { marginTop: insets.top }]}
      contentContainerStyle={[styles.container, { paddingTop: 24, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>Fit Budget</Text>
        <Text style={styles.headline}>
          <Text style={{ color: colors.accent }}>{user?.nickname}</Text>님의{'\n'}가계부
        </Text>
        <Text style={styles.sub}>{ledgers.length ? '사용할 가계부를 골라주세요.' : '첫 가계부를 만들어 시작해요.'}</Text>
      </View>

      {ledgers.map((ledger, index) => {
        const accent = ledger.color ?? ACCENT_COLORS[index % ACCENT_COLORS.length]
        const isEditing = editingId === ledger.id
        const active = ledger.id === ledgerId
        return (
          <Pressable
            key={ledger.id}
            style={[styles.card, active && styles.cardActive]}
            android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
            onPress={() => {
              if (editingId) return
              setLedgerId(ledger.id)
              router.push('/dashboard')
            }}
          >
            <View style={styles.row}>
              <Text style={[styles.monogram, { backgroundColor: accent }]}>{ledger.name.charAt(0)}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  autoFocus
                  maxLength={MAX_NAME}
                  value={editName}
                  onChangeText={setEditName}
                  onSubmitEditing={submitEdit}
                />
              ) : (
                <Text style={styles.name}>{ledger.name}</Text>
              )}
              {active && !isEditing && <Text style={styles.badge}>사용 중</Text>}
            </View>

            <View style={styles.actions}>
              {isEditing ? (
                <>
                  <Pressable onPress={submitEdit}><Text style={[styles.action, styles.primary]}>확인</Text></Pressable>
                  <Pressable onPress={() => setEditingId(null)}><Text style={styles.action}>취소</Text></Pressable>
                </>
              ) : (
                <>
                  <Pressable onPress={() => { setEditingId(ledger.id); setEditName(ledger.name) }}>
                    <Text style={styles.action}>이름</Text>
                  </Pressable>
                  <Pressable onPress={() => setColorPickerId((prev) => (prev === ledger.id ? null : ledger.id))}>
                    <Text style={styles.action}>색상</Text>
                  </Pressable>
                  <Pressable onPress={() => confirmDelete(ledger.id, ledger.name)}>
                    <Text style={[styles.action, styles.danger]}>삭제</Text>
                  </Pressable>
                </>
              )}
            </View>

            {colorPickerId === ledger.id && (
              <View style={styles.swatches}>
                {ACCENT_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    style={[styles.swatch, { backgroundColor: color }, color === accent && styles.swatchActive]}
                    onPress={() => run(async () => {
                      await setLedgerColor(ledger.id, color)
                      setColorPickerId(null)
                    })}
                  />
                ))}
              </View>
            )}
          </Pressable>
        )
      })}

      {isAdding ? (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            autoFocus
            maxLength={MAX_NAME}
            value={newName}
            placeholder="새 가계부 이름"
            onChangeText={setNewName}
            onSubmitEditing={submitNew}
          />
          <View style={styles.actions}>
            <Pressable onPress={submitNew}><Text style={[styles.action, styles.primary]}>추가</Text></Pressable>
            <Pressable onPress={() => { setIsAdding(false); setNewName('') }}><Text style={styles.action}>취소</Text></Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={[styles.card, styles.addCard]} android_ripple={{ color: 'rgba(0,0,0,0.05)' }} onPress={() => setIsAdding(true)}>
          <Text style={styles.addText}>+ 새 가계부</Text>
        </Pressable>
      )}

      <Pressable onPress={() => logout().then(refetch)}>
        <Text style={styles.logout}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 24, gap: 12 },
  header: { gap: 16, marginBottom: 20 },
  wordmark: { fontSize: 16, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  headline: { fontSize: 32, lineHeight: 42, fontWeight: '800', color: colors.ink, letterSpacing: -1 },
  sub: { fontSize: 15, color: colors.subtle },
  // 그림자 대신 1px 보더의 플랫 카드. android_ripple이 모서리를 넘지 않게 overflow hidden
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
  },
  cardActive: { borderColor: colors.accent, borderWidth: 1.5 },
  addCard: { alignItems: 'center', borderStyle: 'dashed', borderColor: '#C4C4C4', backgroundColor: 'transparent' },
  addText: { fontSize: 16, fontWeight: '600', color: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  monogram: { width: 36, height: 36, borderRadius: 8, textAlign: 'center', lineHeight: 36, color: '#fff', fontSize: 16, fontWeight: '700', overflow: 'hidden' },
  name: { fontSize: 17, fontWeight: '600', color: colors.ink, flex: 1 },
  input: { flex: 1, fontSize: 17, color: colors.ink, borderBottomWidth: 1.5, borderColor: colors.accent, paddingVertical: 4 },
  badge: { fontSize: 12, fontWeight: '600', color: colors.accent, backgroundColor: '#E7F5EF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: 20, paddingLeft: 48 },
  action: { fontSize: 14, fontWeight: '500', color: colors.subtle },
  primary: { color: colors.accent, fontWeight: '600' },
  danger: { color: colors.danger },
  swatches: { flexDirection: 'row', gap: 12, paddingLeft: 48 },
  swatch: { width: 28, height: 28, borderRadius: 8 },
  swatchActive: { borderWidth: 2, borderColor: colors.ink },
  logout: { textAlign: 'center', fontSize: 14, color: colors.subtle, marginTop: 24 },
})
