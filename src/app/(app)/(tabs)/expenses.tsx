import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBudgets } from '../../../domains/budget'
import { ExpenseFormSheet, useClosedMonths, useExpenses, usePendingPayments } from '../../../domains/expense'
import type { Expense, PendingPayment } from '../../../domains/expense'
import { useLedger } from '../../../providers/LedgerProvider'
import { useHideTabBarOnScroll, useTabBarHidden } from '../../../providers/TabBarProvider'
import { MonthNav, useMonth } from '../../../shared/components/MonthNav'
import { getCategoryStyle } from '../../../shared/constants/categories'
import { colors, tabBar } from '../../../shared/theme'
import { formatCurrency } from '../../../shared/utils/dateUtils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const FAB_SPACE = 72 // 목록 끝이 플로팅 추가 버튼에 가려지지 않게 둘 여백

export default function Expenses() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <ExpensesContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

// ponytail: 웹의 고정지출 자동 입력·예산 미설정 안내는 아직 미이식
function ExpensesContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const tabBarHidden = useTabBarHidden()
  const monthState = useMonth()
  const { month, yearMonth, isCurrentMonth } = monthState
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses(ledgerId, yearMonth)
  const { budgets } = useBudgets(ledgerId)
  const { isClosed, toggleClosed } = useClosedMonths(ledgerId)
  const closed = isClosed(yearMonth)
  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const payments = usePendingPayments()
  // null = 닫힘, 'new' = 추가, Expense = 수정, PendingPayment = 결제 알림으로 추가
  const [sheet, setSheet] = useState<'new' | Expense | PendingPayment | null>(null)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const addButtonBottom = insets.bottom + tabBar.gap + tabBar.height + 12

  // 마감된 달은 지출을 바꿀 수 없고, 대신 목표 저축 대비 결과를 보여준다
  const toggleClose = () =>
    toggleClosed(yearMonth).catch((e) => Alert.alert('오류', e instanceof Error ? e.message : '처리하지 못했어요'))
  // 최신 날짜가 위로 오게 날짜별로 묶는다
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const e of [...expenses].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))) {
      map.set(e.expenseDate, [...(map.get(e.expenseDate) ?? []), e])
    }
    return [...map.entries()]
  }, [expenses])

  return (
    <>
      <ScrollView
        {...hideTabBarOnScroll}
        style={[styles.screen, { marginTop: insets.top }]}
        contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + tabBar.space + FAB_SPACE }]}
      >
        <Text style={styles.ledgerName}>{ledgerName}</Text>
        <Text style={styles.title}>지출 내역</Text>
        <MonthNav month={monthState} />

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>{isCurrentMonth ? '이번 달' : `${month}월`} 총 지출</Text>
            <Pressable onPress={toggleClose} hitSlop={8} style={[styles.closeChip, closed && styles.closeChipOn]}>
              <Text style={[styles.closeChipText, closed && { color: colors.surface }]}>{closed ? '마감됨 · 취소' : '마감하기'}</Text>
            </Pressable>
          </View>
          <Text style={styles.heroValue}>{formatCurrency(total)}</Text>
          <Text style={styles.heroSub}>{expenses.length}건</Text>
        </View>

        <PaymentNotificationsCard {...payments} onAdd={setSheet} />

        {closed && (
          <ClosedSummary monthlyBudget={budget?.monthlyBudget ?? 0} savingGoal={budget?.savingGoal ?? 0} total={total} />
        )}

        {isLoading ? (
          <ActivityIndicator color={colors.subtle} style={{ marginTop: 24 }} />
        ) : groups.length === 0 ? (
          <Text style={styles.empty}>이 달 지출 내역이 없어요</Text>
        ) : (
          groups.map(([date, items]) => {
            const d = new Date(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)))
            return (
              <View key={date} style={styles.card}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>
                    {d.getMonth() + 1}월 {d.getDate()}일 ({WEEKDAYS[d.getDay()]})
                  </Text>
                  <Text style={styles.dayTotal}>{formatCurrency(items.reduce((s, e) => s + e.amount, 0))}</Text>
                </View>
                {items.map((e) => {
                  const style = getCategoryStyle(e.category)
                  return (
                    <Pressable
                      key={e.id}
                      style={styles.row}
                      onPress={closed ? undefined : () => setSheet(e)}
                      android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                    >
                      <Text style={[styles.icon, { backgroundColor: style.bg }]}>{style.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>{e.memo || e.category}</Text>
                        <Text style={styles.itemMeta}>{e.category}</Text>
                      </View>
                      <Text style={styles.itemAmount}>{formatCurrency(e.amount)}</Text>
                    </Pressable>
                  )
                })}
              </View>
            )
          })
        )}
      </ScrollView>

      {/* 하단 추가 버튼(이전과 같은 전체 너비): 탭 바 바로 위에 두고, 스크롤로 탭 바가 숨으면 함께 내려간다.
          누르면 이 버튼이 그대로 커지며 입력 시트가 되므로, 시트가 열려 있는 동안은 숨긴다 */}
      {!closed && sheet !== 'new' && (
        <Animated.View
          style={[
            styles.fab,
            {
              bottom: addButtonBottom,
              transform: [{ translateY: tabBarHidden.interpolate({ inputRange: [0, 1], outputRange: [0, tabBar.height + 12] }) }],
            },
          ]}
        >
          <Pressable style={styles.add} onPress={() => setSheet('new')} android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
            <Text style={styles.addText}>+ 지출 추가</Text>
          </Pressable>
        </Animated.View>
      )}

      {sheet && sheet !== 'new' && 'postedAt' in sheet ? (
        // 결제 알림: 알림을 받은 달 기준으로 미리 채우고, 저장하면 확인 대기에서 뺀다
        <ExpenseFormSheet
          yearMonth={sheet.expenseDate.slice(0, 7)}
          prefill={{ expenseDate: sheet.expenseDate, amount: sheet.amount, category: '식비', memo: sheet.merchant }}
          onSubmit={async (input) => {
            await addExpense(input)
            payments.dismiss(sheet.id)
          }}
          onClose={() => setSheet(null)}
        />
      ) : (
        sheet && (
          <ExpenseFormSheet
            yearMonth={yearMonth}
            initial={sheet === 'new' ? undefined : sheet}
            origin={
              sheet === 'new'
                ? { left: 20, right: 20, bottom: addButtonBottom, height: 52, radius: 12, label: '+ 지출 추가' }
                : undefined
            }
            onSubmit={(input) => (sheet === 'new' ? addExpense(input) : updateExpense(sheet.id, input))}
            onDelete={sheet === 'new' ? undefined : () => deleteExpense(sheet.id)}
            onClose={() => setSheet(null)}
          />
        )
      )}
    </>
  )
}

function PaymentNotificationsCard({
  supported,
  enabled,
  pending,
  openSettings,
  dismiss,
  onAdd,
}: ReturnType<typeof usePendingPayments> & { onAdd: (p: PendingPayment) => void }) {
  if (!supported) return null
  if (!enabled) {
    return (
      <Pressable style={styles.notice} onPress={openSettings}>
        <View style={{ flex: 1 }}>
          <Text style={styles.noticeTitle}>결제 알림으로 지출 추가</Text>
          <Text style={styles.noticeSub}>카드·은행 결제 알림을 모아 두었다가 확인하면 지출에 넣어드려요</Text>
        </View>
        <Text style={styles.noticeAction}>켜기</Text>
      </Pressable>
    )
  }
  if (pending.length === 0) return null
  return (
    <View style={styles.card}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayLabel}>결제 알림 확인 대기 {pending.length}건</Text>
      </View>
      {pending.map((p) => {
        const d = new Date(p.postedAt)
        return (
          <View key={p.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={1}>{p.merchant}</Text>
              <Text style={styles.itemMeta} numberOfLines={1}>
                {d.getMonth() + 1}월 {d.getDate()}일 {String(d.getHours()).padStart(2, '0')}:{String(d.getMinutes()).padStart(2, '0')} · {p.title}
              </Text>
            </View>
            <Text style={styles.itemAmount}>{formatCurrency(p.amount)}</Text>
            <Pressable onPress={() => onAdd(p)} hitSlop={6}>
              <Text style={styles.pendingAdd}>추가</Text>
            </Pressable>
            <Pressable onPress={() => dismiss(p.id)} hitSlop={6}>
              <Text style={styles.pendingDismiss}>무시</Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}

function ClosedSummary({ monthlyBudget, savingGoal, total }: { monthlyBudget: number; savingGoal: number; total: number }) {
  const remaining = monthlyBudget - total
  const gap = remaining - savingGoal
  const result =
    gap > 0 ? `목표보다 ${formatCurrency(gap)} 더 모았어요` : gap < 0 ? `목표보다 ${formatCurrency(-gap)} 덜 모았어요` : '목표한 금액만큼 정확히 모았어요'
  return (
    <View style={styles.summary}>
      <SummaryRow label="예산" value={formatCurrency(monthlyBudget)} />
      <SummaryRow label="지출" value={formatCurrency(total)} />
      <View style={styles.summaryDivider} />
      <SummaryRow label="잔여 예산" value={formatCurrency(remaining)} />
      <SummaryRow label="목표 저축액" value={formatCurrency(savingGoal)} />
      <Text style={[styles.summaryResult, { color: gap < 0 ? colors.danger : colors.accent }]}>{result}</Text>
    </View>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  ledgerName: { fontSize: 15, color: colors.subtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  // 그림자 대신 1px 보더의 플랫 카드
  hero: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 4 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: colors.ink },
  noticeSub: { fontSize: 13, color: colors.subtle, marginTop: 2 },
  noticeAction: { fontSize: 15, fontWeight: '700', color: colors.accent },
  pendingAdd: { fontSize: 14, fontWeight: '700', color: colors.accent },
  pendingDismiss: { fontSize: 14, color: colors.subtle },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeChip: { borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  closeChipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  closeChipText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  summary: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: colors.subtle },
  summaryValue: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
  summaryDivider: { height: 1, backgroundColor: colors.line },
  summaryResult: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  heroLabel: { fontSize: 14, fontWeight: '600', color: colors.subtle },
  heroValue: { textAlign: 'right', fontSize: 40, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  heroSub: { fontSize: 14, color: colors.subtle },
  fab: { position: 'absolute', left: 20, right: 20 },
  add: { height: 52, borderRadius: 12, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  addText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  empty: { fontSize: 15, color: colors.subtle, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingVertical: 8, overflow: 'hidden' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 6 },
  dayLabel: { fontSize: 14, fontWeight: '600', color: colors.subtle },
  dayTotal: { fontSize: 14, fontWeight: '600', color: colors.subtle, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  icon: { width: 36, height: 36, borderRadius: 8, textAlign: 'center', lineHeight: 36, fontSize: 18, overflow: 'hidden' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  itemMeta: { fontSize: 13, color: colors.subtle, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
})
