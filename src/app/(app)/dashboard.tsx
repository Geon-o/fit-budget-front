import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBudgets } from '../../domains/budget'
import { getDailyAllowances, getPaceMessage, getSpentByDay } from '../../domains/dashboard'
import { useExpenses } from '../../domains/expense'
import { useLedger } from '../../providers/LedgerProvider'
import { getCategoryStyle } from '../../shared/constants/categories'
import { colors } from '../../shared/theme'
import { formatCurrency, getDaysUntil } from '../../shared/utils/dateUtils'

const RECENT_COUNT = 5

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

// ponytail: 웹의 일일 권장액 달력·예산 추이 차트는 아직 미이식 — 요약/카테고리/최근 지출만 보여준다.
export default function Dashboard() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <DashboardContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

function DashboardContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const now = new Date()
  const [{ year, month }, setDate] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const yearMonth = toYearMonth(year, month)
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month

  const { expenses, isLoading } = useExpenses(ledgerId, yearMonth)
  const { budgets } = useBudgets(ledgerId)
  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const monthlyBudget = budget?.monthlyBudget ?? 0
  const savingGoal = budget?.savingGoal ?? 0
  const hasBudget = monthlyBudget > 0

  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = monthlyBudget - total
  const usagePercent = hasBudget ? Math.round((total / monthlyBudget) * 100) : null
  const daysUntilPayment = budget?.paymentDate ? getDaysUntil(budget.paymentDate) : null

  const allowances = useMemo(
    () => getDailyAllowances(expenses, yearMonth, monthlyBudget, savingGoal),
    [expenses, yearMonth, monthlyBudget, savingGoal],
  )
  const todayLimit = isCurrentMonth ? allowances[now.getDate() - 1] : null
  const todaySpent = isCurrentMonth ? (getSpentByDay(expenses).get(now.getDate()) ?? 0) : 0
  const pace = getPaceMessage(expenses, yearMonth, monthlyBudget, savingGoal)

  const categories = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])
  const recent = useMemo(
    () => [...expenses].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)).slice(0, RECENT_COUNT),
    [expenses],
  )

  const shiftMonth = (delta: number) =>
    setDate(({ year: y, month: m }) => {
      const d = new Date(y, m - 1 + delta, 1)
      return { year: d.getFullYear(), month: d.getMonth() + 1 }
    })

  return (
    // 상단 여백을 ScrollView 바깥에 둬서 스크롤한 내용이 상태바 밑으로 겹치지 않게 한다
    <ScrollView
      style={[styles.screen, { marginTop: insets.top }]}
      contentContainerStyle={[styles.container, { paddingTop: 12, paddingBottom: insets.bottom + 24 }]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
        <Text style={styles.backText}>‹ 가계부 목록</Text>
      </Pressable>
      <Text style={styles.ledgerName}>{ledgerName}</Text>

      <View style={styles.monthNav}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={12}><Text style={styles.arrow}>‹</Text></Pressable>
        <Text style={styles.month}>{year}년 {month}월</Text>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={12}><Text style={styles.arrow}>›</Text></Pressable>
        {!isCurrentMonth && (
          <Pressable onPress={() => setDate({ year: now.getFullYear(), month: now.getMonth() + 1 })} hitSlop={8}>
            <Text style={styles.todayLink}>이번 달</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.subtle} style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* 히어로: 가장 중요한 숫자 하나를 크게 */}
          <View style={styles.hero}>
            {todayLimit !== null && todayLimit !== undefined ? (
              <>
                <Text style={styles.heroLabel}>오늘 쓸 수 있는 돈</Text>
                <Text style={[styles.heroValue, todaySpent > todayLimit && { color: colors.danger }]}>
                  {formatCurrency(Math.max(todayLimit - todaySpent, 0))}
                </Text>
                <Text style={styles.heroSub}>
                  {todaySpent > todayLimit
                    ? `오늘 한도를 ${formatCurrency(todaySpent - todayLimit)} 넘었어요`
                    : `오늘 한도 ${formatCurrency(todayLimit)} 중 ${formatCurrency(todaySpent)} 사용`}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.heroLabel}>{isCurrentMonth ? '이번 달 지출' : `${month}월 지출`}</Text>
                <Text style={styles.heroValue}>{formatCurrency(total)}</Text>
                {!hasBudget && <Text style={styles.heroSub}>예산을 설정하면 하루에 쓸 금액을 알려드려요</Text>}
              </>
            )}
            {pace && <Text style={[styles.pace, pace.warning && { color: colors.danger }]}>{pace.text}</Text>}
          </View>

          {/* 벤토 그리드: 2x2 요약 타일 */}
          <View style={styles.grid}>
            <Tile label={isCurrentMonth ? '이번 달 지출' : `${month}월 지출`} value={formatCurrency(total)} />
            <Tile
              label="남은 예산"
              value={hasBudget ? formatCurrency(remaining) : '-'}
              danger={hasBudget && remaining < 0}
            />
            <Tile label="예산 사용률" value={usagePercent === null ? '미설정' : `${usagePercent}%`} danger={(usagePercent ?? 0) > 100}>
              {usagePercent !== null && (
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.min(usagePercent, 100)}%` },
                      usagePercent > 100 && { backgroundColor: colors.danger },
                    ]}
                  />
                </View>
              )}
            </Tile>
            <Tile
              label="다음 입금일"
              value={daysUntilPayment === null ? '-' : daysUntilPayment > 0 ? `D-${daysUntilPayment}` : 'D-Day'}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>카테고리별 지출</Text>
            {categories.length === 0 && <Text style={styles.empty}>아직 지출이 없어요</Text>}
            {categories.map(([category, amount]) => {
              const style = getCategoryStyle(category)
              return (
                <View key={category} style={styles.catRow}>
                  <Text style={[styles.catIcon, { backgroundColor: style.bg }]}>{style.icon}</Text>
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.itemName}>{category}</Text>
                      <Text style={styles.itemAmount}>{formatCurrency(amount)}</Text>
                    </View>
                    <View style={styles.bar}>
                      <View style={[styles.barFill, { width: `${(amount / total) * 100}%`, backgroundColor: style.color }]} />
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>최근 지출</Text>
            {recent.length === 0 && <Text style={styles.empty}>아직 지출이 없어요</Text>}
            {recent.map((e) => {
              const style = getCategoryStyle(e.category)
              return (
                <View key={e.id} style={styles.catRow}>
                  <Text style={[styles.catIcon, { backgroundColor: style.bg }]}>{style.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{e.memo || e.category}</Text>
                    <Text style={styles.itemMeta}>
                      {Number(e.expenseDate.slice(5, 7))}월 {Number(e.expenseDate.slice(8, 10))}일 · {e.category}
                    </Text>
                  </View>
                  <Text style={styles.itemAmount}>{formatCurrency(e.amount)}</Text>
                </View>
              )
            })}
          </View>
        </>
      )}
    </ScrollView>
  )
}

function Tile({ label, value, danger, children }: { label: string; value: string; danger?: boolean; children?: ReactNode }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, danger && { color: colors.danger }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 20, gap: 12 },
  back: { alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { fontSize: 15, color: colors.subtle },
  ledgerName: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  arrow: { fontSize: 24, color: colors.ink, paddingHorizontal: 4 },
  month: { fontSize: 16, fontWeight: '600', color: colors.ink },
  todayLink: { fontSize: 14, fontWeight: '600', color: colors.accent },
  // 그림자 대신 1px 보더의 플랫 카드
  hero: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 20, gap: 6 },
  heroLabel: { fontSize: 14, fontWeight: '600', color: colors.subtle },
  heroValue: { fontSize: 44, fontWeight: '800', color: colors.ink, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  heroSub: { fontSize: 14, color: colors.subtle },
  pace: { fontSize: 14, fontWeight: '500', color: colors.accent, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 8,
  },
  tileLabel: { fontSize: 13, color: colors.subtle },
  tileValue: { fontSize: 20, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, backgroundColor: colors.accent },
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  empty: { fontSize: 14, color: colors.subtle },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 36, height: 36, borderRadius: 8, textAlign: 'center', lineHeight: 36, fontSize: 18, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  itemMeta: { fontSize: 13, color: colors.subtle, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
})
