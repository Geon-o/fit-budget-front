import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBudgets } from '../../../domains/budget'
import { getDailyAllowances, getPaceMessage, getSpentByDay } from '../../../domains/dashboard'
import { useExpenses } from '../../../domains/expense'
import { useLedger } from '../../../providers/LedgerProvider'
import { useHideTabBarOnScroll } from '../../../providers/TabBarProvider'
import { MonthNav, useMonth } from '../../../shared/components/MonthNav'
import { colors, tabBar } from '../../../shared/theme'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const OK_BG = '#E7F5EF'
const OVER_BG = '#FDECEC'

export default function Calendar() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <CalendarContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

function CalendarContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const monthState = useMonth()
  const { year, month, yearMonth, isCurrentMonth } = monthState

  const { expenses, isLoading } = useExpenses(ledgerId, yearMonth)
  const { budgets } = useBudgets(ledgerId)
  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const monthlyBudget = budget?.monthlyBudget ?? 0
  const savingGoal = budget?.savingGoal ?? 0

  const spentByDay = useMemo(() => getSpentByDay(expenses), [expenses])
  const allowances = useMemo(
    () => getDailyAllowances(expenses, yearMonth, monthlyBudget, savingGoal),
    [expenses, yearMonth, monthlyBudget, savingGoal],
  )
  const pace = getPaceMessage(expenses, yearMonth, monthlyBudget, savingGoal)

  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const today = new Date().getDate()
  // 앞쪽 빈칸 + 날짜, 마지막 주도 7칸을 채워 격자가 어긋나지 않게 한다
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7) cells.push(null)

  return (
    <ScrollView
      {...hideTabBarOnScroll}
      style={[styles.screen, { marginTop: insets.top }]}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + tabBar.space }]}
    >
      <Text style={styles.ledgerName}>{ledgerName}</Text>
      <Text style={styles.title}>일일 권장액</Text>
      <MonthNav month={monthState} />

      {isLoading ? (
        <ActivityIndicator color={colors.subtle} style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.card}>
            {monthlyBudget > 0 ? (
              <View style={styles.legend}>
                <Legend color={colors.accent} label="권장액 이내" />
                <Legend color={colors.danger} label="권장액 초과" />
                <Text style={styles.legendHint}>칸 아래 회색 숫자가 그날 권장액이에요</Text>
              </View>
            ) : (
              <Text style={styles.legendHint}>예산을 설정하면 날짜별 권장액을 알려드려요</Text>
            )}
            {pace && <Text style={[styles.pace, pace.warning && { color: colors.danger }]}>{pace.text}</Text>}
          </View>

          <View style={styles.card}>
            <View style={styles.week}>
              {WEEKDAYS.map((d, i) => (
                <Text key={d} style={[styles.weekday, i === 0 && { color: colors.danger }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (day === null) return <View key={`empty-${index}`} style={styles.cell} />
                const spent = spentByDay.get(day) ?? 0
                const limit = allowances[day - 1]
                const over = limit !== null && spent > limit
                const isToday = isCurrentMonth && day === today
                return (
                  <View key={day} style={styles.cell}>
                    <View
                      style={[
                        styles.cellInner,
                        spent > 0 && { backgroundColor: over ? OVER_BG : OK_BG },
                        isToday && styles.today,
                      ]}
                    >
                      <Text style={[styles.day, isToday && { color: colors.accent }]}>{day}</Text>
                      {spent > 0 && (
                        <Text
                          style={[styles.spent, { color: over ? colors.danger : colors.accent }]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          {spent.toLocaleString('ko-KR')}
                        </Text>
                      )}
                      {limit !== null && (
                        <Text style={styles.limit} numberOfLines={1} adjustsFontSizeToFit>
                          {limit.toLocaleString('ko-KR')}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  ledgerName: { fontSize: 15, color: colors.subtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  // 그림자 대신 1px 보더의 플랫 카드
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 12, gap: 10 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 13, color: colors.ink },
  legendHint: { fontSize: 13, color: colors.subtle },
  pace: { fontSize: 14, fontWeight: '500', color: colors.accent },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.subtle },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // 100/7%를 그대로 쓰면 반올림 오차로 한 줄에 7칸이 안 들어가 6칸에서 줄이 바뀐다
  cell: { width: '14.28%', aspectRatio: 0.72, padding: 2 },
  cellInner: { flex: 1, borderRadius: 8, padding: 4, justifyContent: 'space-between' },
  today: { borderWidth: 1.5, borderColor: colors.accent },
  day: { fontSize: 13, fontWeight: '600', color: colors.ink },
  spent: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  limit: { fontSize: 10, color: colors.subtle, fontVariant: ['tabular-nums'] },
})
