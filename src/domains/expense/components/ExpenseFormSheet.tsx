import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EXPENSE_CATEGORIES, getCategoryStyle } from '../../../shared/constants/categories'
import { colors } from '../../../shared/theme'
import type { Expense } from '../types/expense.types'

type ExpenseInput = Omit<Expense, 'id' | 'source'>

interface Props {
  yearMonth: string // 날짜는 이 달 안에서만 고른다
  initial?: Expense // 있으면 수정, 없으면 추가
  onSubmit: (input: ExpenseInput) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

function defaultDay(yearMonth: string) {
  const now = new Date()
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return yearMonth === current ? now.getDate() : 1
}

// ponytail: 날짜는 이 달 안에서 ‹ › 로만 고른다 — 달력형 날짜 선택이 필요해지면 그때 피커 도입
export function ExpenseFormSheet({ yearMonth, initial, onSubmit, onDelete, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const [day, setDay] = useState(initial ? Number(initial.expenseDate.slice(8, 10)) : defaultDay(yearMonth))
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState<string>(initial?.category ?? EXPENSE_CATEGORIES[0])
  const [memo, setMemo] = useState(initial?.memo ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountValue = Number(amount)
  const valid = Number.isInteger(amountValue) && amountValue > 0

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했어요')
      setBusy(false)
    }
  }

  const submit = () =>
    run(() =>
      onSubmit({
        expenseDate: `${yearMonth}-${String(day).padStart(2, '0')}`,
        amount: amountValue,
        category,
        memo: memo.trim(),
      }),
    )

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{initial ? '지출 수정' : '지출 추가'}</Text>

          <View style={styles.amountRow}>
            <TextInput
              style={styles.amount}
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.line}
              autoFocus={!initial}
              maxLength={10}
            />
            <Text style={styles.won}>원</Text>
          </View>

          <View style={styles.chips}>
            {EXPENSE_CATEGORIES.map((c) => {
              const style = getCategoryStyle(c)
              const active = c === category
              return (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.chip, active && { backgroundColor: style.bg, borderColor: style.color }]}
                >
                  <Text style={[styles.chipText, active && { color: style.color, fontWeight: '700' }]}>
                    {style.icon} {c}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.fieldLabel}>날짜</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => setDay((d) => Math.max(1, d - 1))} hitSlop={10}>
                <Text style={styles.arrow}>‹</Text>
              </Pressable>
              <Text style={styles.dateText}>{month}월 {day}일</Text>
              <Pressable onPress={() => setDay((d) => Math.min(daysInMonth, d + 1))} hitSlop={10}>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            </View>
          </View>

          <TextInput
            style={styles.memo}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (예: 점심, 교통카드 충전)"
            placeholderTextColor={colors.subtle}
            maxLength={50}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.primary, (!valid || busy) && styles.disabled]}
            disabled={!valid || busy}
            onPress={submit}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.primaryText}>{initial ? '저장' : '추가'}</Text>
          </Pressable>
          {onDelete && (
            <Pressable style={styles.secondary} disabled={busy} onPress={() =>
                Alert.alert('지출 삭제', '이 지출을 삭제할까요?', [
                  { text: '취소', style: 'cancel' },
                  { text: '삭제', style: 'destructive', onPress: () => run(onDelete) },
                ])
              }>
              <Text style={styles.deleteText}>삭제</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  amount: { flex: 1, fontSize: 40, fontWeight: '800', color: colors.ink, padding: 0, fontVariant: ['tabular-nums'] },
  won: { fontSize: 22, fontWeight: '700', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  chipText: { fontSize: 14, color: colors.ink },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 15, color: colors.subtle },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  arrow: { fontSize: 24, color: colors.ink, paddingHorizontal: 4 },
  dateText: { fontSize: 16, fontWeight: '600', color: colors.ink, minWidth: 72, textAlign: 'center' },
  memo: { fontSize: 16, color: colors.ink, borderBottomWidth: 1.5, borderColor: colors.line, paddingVertical: 6 },
  error: { fontSize: 14, color: colors.danger },
  primary: { height: 52, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.4 },
  secondary: { alignItems: 'center', paddingVertical: 4 },
  deleteText: { fontSize: 15, fontWeight: '600', color: colors.danger },
})
