import { useEffect, useRef, useState } from 'react'
import type { ComponentRef } from 'react'
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EXPENSE_CATEGORIES, getCategoryStyle } from '../../../shared/constants/categories'
import { colors } from '../../../shared/theme'
import type { Expense } from '../types/expense.types'

type ExpenseInput = Omit<Expense, 'id' | 'source'>

/** 시트가 이 버튼에서 커져 나오는 것처럼 보이게 할 때, 버튼의 화면상 위치·모양 */
export interface SheetOrigin {
  left: number
  right: number
  bottom: number
  height: number
  radius: number
  label: string
}

const SHEET_RADIUS = 20
// Material 3 emphasized: 처음엔 빠르게, 끝은 천천히 멈춘다
const EASE = Easing.bezier(0.2, 0, 0, 1)

interface Props {
  yearMonth: string // 날짜는 이 달 안에서만 고른다
  initial?: Expense // 있으면 수정, 없으면 추가
  prefill?: ExpenseInput // 추가할 때 미리 채울 값(결제 알림에서 뽑은 금액·가맹점 등)
  onSubmit: (input: ExpenseInput) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  origin?: SheetOrigin // 있으면 버튼이 시트로 커지는 모션, 없으면 아래에서 올라오는 기본 모션
}

function defaultDay(yearMonth: string) {
  const now = new Date()
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return yearMonth === current ? now.getDate() : 1
}

// ponytail: 날짜는 이 달 안에서 ‹ › 로만 고른다 — 달력형 날짜 선택이 필요해지면 그때 피커 도입
export function ExpenseFormSheet({ yearMonth, initial, prefill, onSubmit, onDelete, onClose, origin }: Props) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const base = initial ?? prefill
  const [day, setDay] = useState(base ? Number(base.expenseDate.slice(8, 10)) : defaultDay(yearMonth))
  const [amount, setAmount] = useState(base ? String(base.amount) : '')
  const [category, setCategory] = useState<string>(base?.category ?? EXPENSE_CATEGORIES[0])
  const [memo, setMemo] = useState(base?.memo ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // morph: 0 = 버튼, 1 = 시트. 시트 높이를 잰 뒤에 펼친다.
  const morph = useRef(new Animated.Value(origin ? 0 : 1)).current
  const [sheetHeight, setSheetHeight] = useState(0)
  const amountRef = useRef<ComponentRef<typeof TextInput>>(null)
  useEffect(() => {
    if (!origin || !sheetHeight) return
    Animated.timing(morph, { toValue: 1, duration: 420, easing: EASE, useNativeDriver: false }).start(() => {
      // 키보드는 펼침이 끝난 뒤에 올려 모션이 흔들리지 않게 한다
      if (!base) amountRef.current?.focus()
    })
  }, [origin, sheetHeight, morph, base])

  const close = () => {
    if (!origin) return onClose()
    Keyboard.dismiss()
    Animated.timing(morph, { toValue: 0, duration: 320, easing: EASE, useNativeDriver: false }).start(() => onClose())
  }

  const amountValue = Number(amount)
  const valid = Number.isInteger(amountValue) && amountValue > 0

  const run = async (action: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await action()
      close()
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

  const content = (
        <>
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
              ref={amountRef}
              autoFocus={!base && !origin}
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
        </>
  )

  if (!origin) {
    return (
      <Modal transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView behavior="padding" style={styles.flex}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>{content}</View>
        </KeyboardAvoidingView>
      </Modal>
    )
  }

  const lerp = (from: number, to: number) => morph.interpolate({ inputRange: [0, 1], outputRange: [from, to] })
  return (
    // 화면 전체 좌표를 쓰도록 상태바·내비게이션 바 영역까지 덮어, 버튼 위치와 정확히 겹치게 한다
    <Modal transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={styles.morphRoot}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.dim, { opacity: morph }]}>
          <Pressable style={styles.flex} onPress={close} />
        </Animated.View>
        <Animated.View
          style={{
            overflow: 'hidden',
            marginLeft: lerp(origin.left, 0),
            marginRight: lerp(origin.right, 0),
            marginBottom: lerp(origin.bottom, 0),
            height: sheetHeight ? lerp(origin.height, sheetHeight) : origin.height,
            borderTopLeftRadius: lerp(origin.radius, SHEET_RADIUS),
            borderTopRightRadius: lerp(origin.radius, SHEET_RADIUS),
            borderBottomLeftRadius: lerp(origin.radius, 0),
            borderBottomRightRadius: lerp(origin.radius, 0),
            backgroundColor: morph.interpolate({ inputRange: [0, 0.6], outputRange: [colors.accent, colors.surface], extrapolate: 'clamp' }),
          }}
        >
          {/* 내용은 최종 너비로 한 번만 배치해 높이를 재고, 펼쳐지는 동안 그대로 따라 움직인다 */}
          <Animated.View
            onLayout={(e) => !sheetHeight && setSheetHeight(e.nativeEvent.layout.height)}
            style={[
              styles.sheetContent,
              {
                width,
                left: lerp(-origin.left, 0),
                paddingBottom: insets.bottom + 16,
                opacity: morph.interpolate({ inputRange: [0.45, 1], outputRange: [0, 1], extrapolate: 'clamp' }),
              },
            ]}
          >
            {content}
          </Animated.View>
          <Animated.Text
            style={[styles.morphLabel, { opacity: morph.interpolate({ inputRange: [0, 0.25], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
          >
            {origin.label}
          </Animated.Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  morphRoot: { flex: 1, justifyContent: 'flex-end' },
  dim: { backgroundColor: 'rgba(0,0,0,0.35)' },
  sheetContent: { position: 'absolute', top: 0, paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  morphLabel: { position: 'absolute', top: 0, left: 0, right: 0, height: 52, lineHeight: 52, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#fff' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  amount: { flex: 1, textAlign: 'right', fontSize: 40, fontWeight: '800', color: colors.ink, padding: 0, fontVariant: ['tabular-nums'] },
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
