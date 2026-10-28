import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBudgets } from '../../../domains/budget'
import { getDailyAllowances, getPaceMessage, getSpentByDay } from '../../../domains/dashboard'
import { useExpenses } from '../../../domains/expense'
import { useRecurringExpenses } from '../../../domains/recurringExpense'
import { useLedger } from '../../../providers/LedgerProvider'
import { useHideTabBarOnScroll } from '../../../providers/TabBarProvider'
import { MonthNav, useMonth } from '../../../shared/components/MonthNav'
import { getCategoryStyle } from '../../../shared/constants/categories'
import { colors, tabBar } from '../../../shared/theme'
import { formatCurrency } from '../../../shared/utils/dateUtils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const OK_BG = '#E7F5EF'
const OVER_BG = '#FDECEC'
const RECURRING = '#6C63D9' // 고정 지출 표시색(권장액 그린/초과 빨강과 겹치지 않게)
const COLLAPSED_CELL = 56 // 접힌 달력의 칸 높이
const WEEK_ROW = 28 // 요일 줄 높이
const CARD_PADDING = 8

export default function Calendar() {
  const { ledgerId, ledgers } = useLedger()
  if (!ledgerId) return null // 목록에서 가계부를 고르고 들어오므로 정상 흐름에선 항상 있다
  const ledger = ledgers.find((l) => l.id === ledgerId)
  return <CalendarContent ledgerId={ledgerId} ledgerName={ledger?.name ?? ''} />
}

/**
 * 삼성 캘린더처럼 달력을 위아래로 끌어 접고 편다.
 * - 펼침: 달력이 화면을 채우고 칸마다 쓴 돈·권장액을 크게 보여준다.
 * - 접힘: 칸이 작아지고, 아래에 선택한 날짜의 고정 지출과 지출 목록이 나온다.
 */
function CalendarContent({ ledgerId, ledgerName }: { ledgerId: string; ledgerName: string }) {
  const insets = useSafeAreaInsets()
  const hideTabBarOnScroll = useHideTabBarOnScroll()
  const monthState = useMonth()
  const { year, month, yearMonth, isCurrentMonth } = monthState

  const { expenses, isLoading } = useExpenses(ledgerId, yearMonth)
  const { budgets } = useBudgets(ledgerId)
  const { recurringExpenses } = useRecurringExpenses(ledgerId)
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
  const rows = cells.length / 7

  // 고정 지출을 날짜별로 묶는다. 31일처럼 이 달에 없는 날짜는 말일로 당긴다.
  const recurringByDay = useMemo(() => {
    const map = new Map<number, typeof recurringExpenses>()
    for (const r of recurringExpenses) {
      const day = Math.min(r.dayOfMonth, daysInMonth)
      map.set(day, [...(map.get(day) ?? []), r])
    }
    return map
  }, [recurringExpenses, daysInMonth])

  // 선택한 날짜: 달이 바뀌면 이번 달은 오늘, 다른 달은 1일로 돌아간다
  const [selected, setSelected] = useState({ yearMonth, day: isCurrentMonth ? today : 1 })
  const selectedDay = selected.yearMonth === yearMonth ? selected.day : isCurrentMonth ? today : 1
  const selectedExpenses = expenses.filter((e) => Number(e.expenseDate.slice(8, 10)) === selectedDay)

  // 펼쳤을 때 칸 높이 = (달력 영역 - 플로팅 탭 바 자리) / 줄 수
  const [areaHeight, setAreaHeight] = useState(0)
  const expandedCell = Math.max(
    COLLAPSED_CELL,
    (areaHeight - tabBar.space - insets.bottom - WEEK_ROW - CARD_PADDING * 2) / rows,
  )

  // progress: 0 = 접힘, 1 = 펼침. 끄는 동안 손가락을 따라가고, 놓으면 가까운 쪽으로 맞춘다.
  const progress = useRef(new Animated.Value(0)).current
  const progressNow = useRef(0)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    const id = progress.addListener(({ value }) => (progressNow.current = value))
    return () => progress.removeListener(id)
  }, [progress])

  // PanResponder는 한 번만 만들고, 바뀌는 값(끌 수 있는 거리)은 ref로 읽는다
  const travel = useRef(1)
  travel.current = Math.max(1, rows * (expandedCell - COLLAPSED_CELL))
  const pan = useMemo(() => {
    let start = 0
    const snap = (toValue: number) => {
      Animated.spring(progress, { toValue, useNativeDriver: false, bounciness: 0, speed: 16 }).start()
      setExpanded(toValue === 1)
    }
    return PanResponder.create({
      // 세로로 끌 때만 가로챈다 — 짧게 누르면 날짜 선택(Pressable)으로 간다
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        start = progressNow.current
      },
      onPanResponderMove: (_, g) => progress.setValue(Math.min(1, Math.max(0, start + g.dy / travel.current))),
      onPanResponderRelease: (_, g) => {
        if (g.vy > 0.3) snap(1)
        else if (g.vy < -0.3) snap(0)
        else snap(progressNow.current > 0.5 ? 1 : 0)
      },
      onPanResponderTerminate: () => snap(progressNow.current > 0.5 ? 1 : 0),
    })
  }, [progress])

  const cellHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_CELL, expandedCell] })
  const selectedDate = new Date(year, month - 1, selectedDay)
  const selectedLimit = allowances[selectedDay - 1]

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Text style={styles.ledgerName}>{ledgerName}</Text>
        <Text style={styles.title}>일일 권장액</Text>
        <MonthNav month={monthState} />
        {pace && <Text style={[styles.pace, pace.warning && { color: colors.danger }]}>{pace.text}</Text>}
      </View>

      <View style={styles.area} onLayout={(e) => setAreaHeight(e.nativeEvent.layout.height)}>
        {isLoading ? (
          <ActivityIndicator color={colors.subtle} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.card} {...pan.panHandlers}>
              <View style={styles.week}>
                {WEEKDAYS.map((d, i) => (
                  <Text key={d} style={[styles.weekday, i === 0 && { color: colors.danger }]}>{d}</Text>
                ))}
              </View>
              <View style={styles.grid}>
                {cells.map((day, index) => {
                  if (day === null) return <Animated.View key={`empty-${index}`} style={[styles.cell, { height: cellHeight }]} />
                  const spent = spentByDay.get(day) ?? 0
                  const limit = allowances[day - 1]
                  const over = limit !== null && spent > limit
                  const isToday = isCurrentMonth && day === today
                  const isSelected = day === selectedDay
                  const hasRecurring = recurringByDay.has(day)
                  return (
                    <Animated.View key={day} style={[styles.cell, { height: cellHeight }]}>
                      <Pressable
                        onPress={() => setSelected({ yearMonth, day })}
                        style={[styles.cellInner, spent > 0 && { backgroundColor: over ? OVER_BG : OK_BG }]}
                      >
                        <View style={styles.dayRow}>
                          <View style={[styles.dayBadge, isSelected && { backgroundColor: colors.accent }]}>
                            <Text style={[styles.day, isToday && { color: colors.accent }, isSelected && { color: '#fff' }]}>
                              {day}
                            </Text>
                          </View>
                          {hasRecurring && <View style={styles.recurringDot} />}
                        </View>
                        <View>
                          {spent > 0 && (
                            <Text
                              style={[expanded ? styles.spentLarge : styles.spent, { color: over ? colors.danger : colors.accent }]}
                              numberOfLines={1}
                              adjustsFontSizeToFit
                            >
                              {spent.toLocaleString('ko-KR')}
                            </Text>
                          )}
                          {limit !== null && (
                            <Text style={expanded ? styles.limitLarge : styles.limit} numberOfLines={1} adjustsFontSizeToFit>
                              {limit.toLocaleString('ko-KR')}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                  )
                })}
              </View>
              <View style={styles.grabber} />
            </View>

            {/* 달력이 펼쳐질수록 목록이 흐려지고, 다 펴지면 탭 바 아래로 비치지 않게 숨는다 */}
            <Animated.ScrollView
              {...hideTabBarOnScroll}
              style={[styles.list, { opacity: progress.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' }) }]}
              contentContainerStyle={{ paddingBottom: insets.bottom + tabBar.space }}
            >
              <View style={styles.listHeader}>
                <Text style={styles.listDate}>
                  {month}월 {selectedDay}일 ({WEEKDAYS[selectedDate.getDay()]})
                </Text>
                <Text style={styles.listSummary}>
                  {formatCurrency(spentByDay.get(selectedDay) ?? 0)}
                  {selectedLimit !== null && ` / 권장 ${formatCurrency(selectedLimit)}`}
                </Text>
              </View>
              {recurringByDay.has(selectedDay) && (
                <>
                  <Text style={styles.section}>고정 지출</Text>
                  {recurringByDay.get(selectedDay)!.map((r) => (
                    <View key={r.id} style={styles.row}>
                      <Text style={[styles.icon, styles.recurringIcon]}>↻</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName} numberOfLines={1}>{r.memo}</Text>
                        <Text style={styles.itemMeta}>매달 {r.dayOfMonth}일</Text>
                      </View>
                      <Text style={styles.itemAmount}>{r.amount === null ? '변동' : formatCurrency(r.amount)}</Text>
                    </View>
                  ))}
                  <Text style={styles.section}>지출 내역</Text>
                </>
              )}
              {selectedExpenses.length === 0 && <Text style={styles.empty}>이날 지출이 없어요</Text>}
              {selectedExpenses.map((e) => {
                const style = getCategoryStyle(e.category)
                return (
                  <View key={e.id} style={styles.row}>
                    <Text style={[styles.icon, { backgroundColor: style.bg }]}>{style.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName} numberOfLines={1}>{e.memo || e.category}</Text>
                      <Text style={styles.itemMeta}>{e.category}</Text>
                    </View>
                    <Text style={styles.itemAmount}>{formatCurrency(e.amount)}</Text>
                  </View>
                )
              })}
            </Animated.ScrollView>
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, gap: 12, marginBottom: 12 },
  ledgerName: { fontSize: 15, color: colors.subtle },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.8 },
  pace: { fontSize: 14, fontWeight: '500', color: colors.accent },
  area: { flex: 1, paddingHorizontal: 20, overflow: 'hidden' },
  // 그림자 대신 1px 보더의 플랫 카드
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: CARD_PADDING },
  week: { flexDirection: 'row', height: WEEK_ROW, alignItems: 'center' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.subtle },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  // 100/7%를 그대로 쓰면 반올림 오차로 한 줄에 7칸이 안 들어가 6칸에서 줄이 바뀐다
  cell: { width: '14.28%', padding: 2 },
  cellInner: { flex: 1, borderRadius: 8, padding: 3, justifyContent: 'space-between' },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recurringDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: RECURRING, marginRight: 2 },
  dayBadge: { alignSelf: 'flex-start', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  day: { fontSize: 12, fontWeight: '600', color: colors.ink },
  spent: { textAlign: 'right', fontSize: 9, fontWeight: '700', fontVariant: ['tabular-nums'] },
  limit: { textAlign: 'right', fontSize: 9, color: colors.subtle, fontVariant: ['tabular-nums'] },
  spentLarge: { textAlign: 'right', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  limitLarge: { textAlign: 'right', fontSize: 12, color: colors.subtle, fontVariant: ['tabular-nums'] },
  grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, marginTop: 6 },
  list: { flex: 1, marginTop: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  listDate: { fontSize: 16, fontWeight: '700', color: colors.ink },
  listSummary: { fontSize: 13, color: colors.subtle, fontVariant: ['tabular-nums'] },
  section: { fontSize: 13, fontWeight: '700', color: colors.subtle, marginTop: 8, marginBottom: 2 },
  recurringIcon: { backgroundColor: '#EDECFB', color: RECURRING, fontWeight: '700' },
  empty: { fontSize: 14, color: colors.subtle, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  icon: { width: 36, height: 36, borderRadius: 8, textAlign: 'center', lineHeight: 36, fontSize: 18, overflow: 'hidden' },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.ink },
  itemMeta: { fontSize: 13, color: colors.subtle, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: '600', color: colors.ink, fontVariant: ['tabular-nums'] },
})
