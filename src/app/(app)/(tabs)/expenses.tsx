import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ExpenseFormSheet, useExpenses } from '../../../domains/expense'
import type { Expense } from '../../../domains/expense'
import { useLedger } from '../../../providers/LedgerProvider'
import { useHideTabBarOnScroll } from '../../../providers/TabBarProvider'
import { MonthNav, useMonth } from '../../../shared/components/MonthNav'
import { getCategoryStyle } from '../../../shared/constants/categories'
import { colors, tabBar } from '../../../shared/theme'
import { formatCurrency } from '../../../shared/utils/dateUtils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Expenses() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <ExpensesContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

// ponytail: 웹의 월 마감·고정지출 자동 입력·예산 미설정 안내는 아직 미이식
function ExpensesContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const monthState = useMonth()
  const { month, yearMonth, isCurrentMonth } = monthState
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses(ledgerId, yearMonth)
  // null = 닫힘, 'new' = 추가, Expense = 수정
  const [sheet, setSheet] = useState<'new' | Expense | null>(null)

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
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
        contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + tabBar.space }]}
      >
        <Text style={styles.ledgerName}>{ledgerName}</Text>
        <Text style={styles.title}>지출 내역</Text>
        <MonthNav month={monthState} />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{isCurrentMonth ? '이번 달' : `${month}월`} 총 지출</Text>
          <Text style={styles.heroValue}>{formatCurrency(total)}</Text>
          <Text style={styles.heroSub}>{expenses.length}건</Text>
        </View>

        <Pressable style={styles.add} onPress={() => setSheet('new')} android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
          <Text style={styles.addText}>+ 지출 추가</Text>
        </Pressable>

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
                      onPress={() => setSheet(e)}
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

      {sheet && (
        <ExpenseFormSheet
          yearMonth={yearMonth}
          initial={sheet === 'new' ? undefined : sheet}
          onSubmit={(input) => (sheet === 'new' ? addExpense(input) : updateExpense(sheet.id, input))}
          onDelete={sheet === 'new' ? undefined : () => deleteExpense(sheet.id)}
          onClose={() => setSheet(null)}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  ledgerName: { fontSize: 15, color: colors.subtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  // 그림자 대신 1px 보더의 플랫 카드
  hero: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 4 },
  heroLabel: { fontSize: 14, fontWeight: '600', color: colors.subtle },
  heroValue: { fontSize: 40, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  heroSub: { fontSize: 14, color: colors.subtle },
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
