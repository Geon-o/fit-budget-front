import { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { logout } from '../../domains/auth'
import { useAuthContext } from '../../providers/AuthProvider'
import { useLedger } from '../../providers/LedgerProvider'

const ACCENT_COLORS = ['#d99b6c', '#6c9bd9', '#8fb96c', '#b06cd9', '#d96c8f', '#6cc2c2']
const MAX_NAME = 10

// ponytail: 가계부를 고르면 대시보드로 이동해야 하지만 대시보드 화면이 아직 없어 선택 표시만 한다.
export default function LedgerList() {
  const { refetch } = useAuthContext()
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>가계부 변경</Text>

      {ledgers.map((ledger, index) => {
        const accent = ledger.color ?? ACCENT_COLORS[index % ACCENT_COLORS.length]
        const isEditing = editingId === ledger.id
        const active = ledger.id === ledgerId
        return (
          <Pressable
            key={ledger.id}
            style={[styles.card, { borderLeftColor: accent }, active && styles.cardActive]}
            onPress={() => !editingId && setLedgerId(ledger.id)}
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
                  <Pressable onPress={submitEdit}><Text style={styles.action}>확인</Text></Pressable>
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
                    style={[styles.swatch, { backgroundColor: color }]}
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
            <Pressable onPress={submitNew}><Text style={styles.action}>추가</Text></Pressable>
            <Pressable onPress={() => { setIsAdding(false); setNewName('') }}><Text style={styles.action}>취소</Text></Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={[styles.card, styles.addCard]} onPress={() => setIsAdding(true)}>
          <Text style={styles.name}>+ 새 가계부</Text>
        </Pressable>
      )}

      <Pressable onPress={() => logout().then(refetch)}>
        <Text style={styles.logout}>로그아웃</Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 56, gap: 12 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 10, borderLeftWidth: 4, borderLeftColor: '#ddd' },
  cardActive: { borderWidth: 1, borderColor: '#222', borderLeftWidth: 4 },
  addCard: { alignItems: 'center', borderLeftWidth: 0, borderStyle: 'dashed', borderWidth: 1, borderColor: '#aaa' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monogram: { width: 32, height: 32, borderRadius: 16, textAlign: 'center', lineHeight: 32, color: '#fff', fontWeight: '600', overflow: 'hidden' },
  name: { fontSize: 16, flex: 1 },
  input: { flex: 1, fontSize: 16, borderBottomWidth: 1, borderColor: '#999', paddingVertical: 2 },
  badge: { fontSize: 12, color: '#555' },
  actions: { flexDirection: 'row', gap: 16 },
  action: { fontSize: 14, color: '#2563eb' },
  danger: { color: '#dc2626' },
  swatches: { flexDirection: 'row', gap: 10 },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  logout: { textAlign: 'center', color: '#666', marginTop: 16 },
})
