import { useState } from 'react'
import type { ReactNode } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBudgets } from '../../../domains/budget'
import type { Budget } from '../../../domains/budget'
import { useClosedMonths } from '../../../domains/expense'
import { useRecurringExpenses } from '../../../domains/recurringExpense'
import type { RecurringExpense } from '../../../domains/recurringExpense'
import { useLedger } from '../../../providers/LedgerProvider'
import { useHideTabBarOnScroll } from '../../../providers/TabBarProvider'
import { MonthNav, useMonth } from '../../../shared/components/MonthNav'
import { colors, tabBar } from '../../../shared/theme'
import { formatCurrency, getDaysUntil } from '../../../shared/utils/dateUtils'

const digits = (t: string) => t.replace(/[^0-9]/g, '')
const withComma = (v: string) => (v ? Number(v).toLocaleString('ko-KR') : '')

export default function BudgetScreen() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <BudgetContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

// ponytail: 웹의 연도별 예산 목록은 미이식 — 위쪽 월 이동으로 달을 골라 그 달 예산을 등록/수정한다
function BudgetContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const monthState = useMonth()
  const { yearMonth } = monthState
  const { budgets, isLoading, saveBudget } = useBudgets(ledgerId)
  const recurring = useRecurringExpenses(ledgerId)
  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const { isClosed } = useClosedMonths(ledgerId)

  return (
    // edge-to-edge라 키보드가 올라와도 화면이 줄지 않아서, 아래쪽 입력칸이 키보드에 가려지지 않게 직접 줄인다
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <ScrollView
        {...hideTabBarOnScroll}
        keyboardShouldPersistTaps="handled"
        style={[styles.screen, { marginTop: insets.top }]}
        contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + tabBar.space }]}
      >
        <Text style={styles.ledgerName}>{ledgerName}</Text>
        <Text style={styles.title}>예산</Text>
        <MonthNav month={monthState} />

        {isLoading ? (
          <ActivityIndicator color={colors.subtle} style={{ marginTop: 24 }} />
        ) : (
          // 달이 바뀌거나 저장된 값이 바뀌면 폼을 새 값으로 다시 채운다
          <BudgetForm
            key={`${yearMonth}-${budget?.id ?? 'new'}`}
            yearMonth={yearMonth}
            budget={budget}
            closed={isClosed(yearMonth)}
            onSave={saveBudget}
          />
        )}

        <RecurringCard {...recurring} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function nextMonthOf(yearMonth: string) {
  const [y, m] = yearMonth.split('-').map(Number)
  const d = new Date(y, m, 1) // m은 1부터라 그대로 넣으면 다음 달
  return { year: d.getFullYear(), month: d.getMonth() + 1, days: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() }
}

function BudgetForm({
  yearMonth,
  budget,
  closed,
  onSave,
}: {
  yearMonth: string
  budget?: Budget
  closed: boolean // 마감된 달은 지출 탭에서 마감을 풀기 전까지 수정할 수 없다
  onSave: (input: Omit<Budget, 'id'>) => Promise<void>
}) {
  const next = nextMonthOf(yearMonth)
  const [monthlyBudget, setMonthlyBudget] = useState(budget ? String(budget.monthlyBudget) : '')
  const [savingGoal, setSavingGoal] = useState(budget ? String(budget.savingGoal) : '')
  const [payDay, setPayDay] = useState(budget ? Number(budget.paymentDate.slice(8, 10)) : 1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)

  const day = Math.min(payDay, next.days)
  const paymentDate = `${next.year}-${String(next.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dDay = getDaysUntil(paymentDate)
  const budgetValue = Number(monthlyBudget)
  const goalValue = Number(savingGoal || 0)
  const valid = budgetValue > 0 && goalValue <= budgetValue
  const spendable = budgetValue - goalValue

  const submit = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await onSave({ yearMonth, monthlyBudget: budgetValue, savingGoal: goalValue, paymentDate })
      setMessage({ text: '저장했어요', error: false })
    } catch (e) {
      setMessage({ text: e instanceof Error ? e.message : '저장하지 못했어요', error: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{budget ? '이 달 예산' : '이 달 예산 등록'}</Text>

      <Field label="월 생활비 예산">
        <AmountInput value={monthlyBudget} onChange={setMonthlyBudget} editable={!closed} />
      </Field>
      <Field label="목표 저축액">
        <AmountInput value={savingGoal} onChange={setSavingGoal} editable={!closed} />
      </Field>
      {budgetValue > 0 && (
        <Text style={[styles.hint, goalValue > budgetValue && { color: colors.danger }]}>
          {goalValue > budgetValue
            ? '목표 저축액이 예산보다 커요'
            : `저축하고 쓸 수 있는 돈 ${formatCurrency(spendable)} · 하루 약 ${formatCurrency(spendable / new Date(Number(yearMonth.slice(0, 4)), Number(yearMonth.slice(5, 7)), 0).getDate())}`}
        </Text>
      )}

      <View style={styles.dayRow}>
        <View>
          <Text style={styles.fieldLabel}>다음 달 생활비 입금일</Text>
          {dDay > 0 && <Text style={styles.dday}>D-{dDay}</Text>}
        </View>
        <View style={styles.stepper}>
          <Pressable disabled={closed} onPress={() => setPayDay(Math.max(1, day - 1))} hitSlop={10}><Text style={styles.arrow}>‹</Text></Pressable>
          <Text style={styles.dayText}>{next.month}월 {day}일</Text>
          <Pressable disabled={closed} onPress={() => setPayDay(Math.min(next.days, day + 1))} hitSlop={10}><Text style={styles.arrow}>›</Text></Pressable>
        </View>
      </View>

      {closed && <Text style={styles.hint}>마감된 달이라 수정할 수 없어요. 지출 탭에서 마감을 취소하면 다시 고칠 수 있어요.</Text>}
      {message && <Text style={[styles.hint, { color: message.error ? colors.danger : colors.accent }]}>{message.text}</Text>}
      <Pressable
        style={[styles.primary, (!valid || busy || closed) && styles.disabled]}
        disabled={!valid || busy || closed}
        onPress={submit}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <Text style={styles.primaryText}>{budget ? '수정하기' : '등록하기'}</Text>
      </Pressable>
    </View>
  )
}

function RecurringCard({
  recurringExpenses,
  isLoading,
  addRecurringExpense,
  deleteRecurringExpense,
}: ReturnType<typeof useRecurringExpenses>) {
  const [memo, setMemo] = useState('')
  const [day, setDay] = useState(1)
  const [amount, setAmount] = useState('')
  const [busy, setBusy] = useState(false)

  const add = async () => {
    setBusy(true)
    try {
      await addRecurringExpense({ memo: memo.trim(), dayOfMonth: day, amount: amount ? Number(amount) : null })
      setMemo('')
      setAmount('')
      setDay(1)
    } catch (e) {
      Alert.alert('오류', e instanceof Error ? e.message : '등록하지 못했어요')
    } finally {
      setBusy(false)
    }
  }

  const confirmDelete = (r: RecurringExpense) =>
    Alert.alert('고정 지출 삭제', `'${r.memo}'을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteRecurringExpense(r.id).catch(() => Alert.alert('오류', '삭제하지 못했어요')),
      },
    ])

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>고정 지출</Text>
      <Text style={styles.hint}>월세·구독료처럼 매달 나가는 돈이에요. 금액을 비워두면 매달 금액이 달라지는 항목으로 저장돼요.</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.subtle} />
      ) : (
        [...recurringExpenses]
          .sort((a, b) => a.dayOfMonth - b.dayOfMonth)
          .map((r) => (
            <View key={r.id} style={styles.recurringRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recurringName}>{r.memo}</Text>
                <Text style={styles.recurringMeta}>매달 {r.dayOfMonth}일</Text>
              </View>
              <Text style={styles.recurringAmount}>{r.amount === null ? '변동' : formatCurrency(r.amount)}</Text>
              <Pressable onPress={() => confirmDelete(r)} hitSlop={8}>
                <Text style={styles.delete}>삭제</Text>
              </Pressable>
            </View>
          ))
      )}

      <View style={styles.divider} />
      <TextInput
        style={styles.textInput}
        value={memo}
        onChangeText={setMemo}
        placeholder="이름 (예: 월세, 넷플릭스)"
        placeholderTextColor={colors.subtle}
        maxLength={30}
      />
      <View style={styles.dayRow}>
        <Text style={styles.fieldLabel}>매달</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setDay((d) => Math.max(1, d - 1))} hitSlop={10}><Text style={styles.arrow}>‹</Text></Pressable>
          <Text style={styles.dayText}>{day}일</Text>
          <Pressable onPress={() => setDay((d) => Math.min(31, d + 1))} hitSlop={10}><Text style={styles.arrow}>›</Text></Pressable>
        </View>
      </View>
      <AmountInput value={amount} onChange={setAmount} placeholder="금액 (비우면 변동)" />
      <Pressable
        style={[styles.secondaryButton, (!memo.trim() || busy) && styles.disabled]}
        disabled={!memo.trim() || busy}
        onPress={add}
      >
        <Text style={styles.secondaryText}>+ 고정 지출 추가</Text>
      </Pressable>
    </View>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  )
}

function AmountInput({
  value,
  onChange,
  placeholder = '0',
  editable = true,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  editable?: boolean
}) {
  return (
    <View style={styles.amountRow}>
      <TextInput
        style={styles.amount}
        value={withComma(value)}
        onChangeText={(t) => onChange(digits(t))}
        keyboardType="number-pad"
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={colors.subtle}
        maxLength={13}
      />
      <Text style={styles.won}>원</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  ledgerName: { fontSize: 15, color: colors.subtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  // 그림자 대신 1px 보더의 플랫 카드
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  fieldLabel: { fontSize: 14, color: colors.subtle },
  hint: { fontSize: 13, color: colors.subtle, lineHeight: 19 },
  amountRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1.5, borderColor: colors.line, gap: 6 },
  amount: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.ink, paddingVertical: 6, fontVariant: ['tabular-nums'] },
  won: { fontSize: 18, fontWeight: '600', color: colors.ink },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dday: { fontSize: 13, fontWeight: '600', color: colors.accent, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  arrow: { fontSize: 24, color: colors.ink, paddingHorizontal: 4 },
  dayText: { fontSize: 16, fontWeight: '600', color: colors.ink, minWidth: 64, textAlign: 'center' },
  primary: { height: 52, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  disabled: { opacity: 0.4 },
  recurringRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recurringName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  recurringMeta: { fontSize: 13, color: colors.subtle, marginTop: 2 },
  recurringAmount: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  delete: { fontSize: 14, fontWeight: '600', color: colors.danger },
  divider: { height: 1, backgroundColor: colors.line },
  textInput: { fontSize: 16, color: colors.ink, borderBottomWidth: 1.5, borderColor: colors.line, paddingVertical: 6 },
  secondaryButton: { height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '700', color: colors.accent },
})
