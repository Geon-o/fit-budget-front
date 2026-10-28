import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

/** 화면에서 보고 있는 연·월. 기본은 이번 달. */
export function useMonth() {
  const now = new Date()
  const [{ year, month }, setDate] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  return {
    year,
    month,
    yearMonth: `${year}-${String(month).padStart(2, '0')}`,
    isCurrentMonth: now.getFullYear() === year && now.getMonth() + 1 === month,
    shift: (delta: number) =>
      setDate(({ year: y, month: m }) => {
        const d = new Date(y, m - 1 + delta, 1)
        return { year: d.getFullYear(), month: d.getMonth() + 1 }
      }),
    reset: () => setDate({ year: now.getFullYear(), month: now.getMonth() + 1 }),
  }
}

/** ‹ 2026년 10월 › [이번 달] */
export function MonthNav({ month }: { month: ReturnType<typeof useMonth> }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => month.shift(-1)} hitSlop={12}><Text style={styles.arrow}>‹</Text></Pressable>
      <Text style={styles.label}>{month.year}년 {month.month}월</Text>
      <Pressable onPress={() => month.shift(1)} hitSlop={12}><Text style={styles.arrow}>›</Text></Pressable>
      {!month.isCurrentMonth && (
        <Pressable onPress={month.reset} hitSlop={8}>
          <Text style={styles.today}>이번 달</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  arrow: { fontSize: 24, color: colors.ink, paddingHorizontal: 4 },
  label: { fontSize: 16, fontWeight: '600', color: colors.ink },
  today: { fontSize: 14, fontWeight: '600', color: colors.accent },
})
