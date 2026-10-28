import type { Expense } from '../expense'
import { formatCurrency } from '../../shared/utils/dateUtils'

/**
 * 날짜별 권장 지출 한도(웹 ExpenseCalendar 로직 그대로). 예산이 없으면 null.
 * 하루 기준선(균등 분배액)은 고정. 지난 날짜는 기준선보다 더 썼으면 다음 날 한도가 줄고,
 * 덜 썼으면 (기준선 + 남은 이월분)만큼 늘어난다. 미래 날짜는 오늘 시점 한도로 고정한다.
 */
export function getDailyAllowances(
  expenses: Expense[],
  yearMonth: string,
  monthlyBudget: number,
  savingGoal: number,
): (number | null)[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const spentByDay = getSpentByDay(expenses)
  const baseline = (monthlyBudget - savingGoal) / daysInMonth
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const result: (number | null)[] = []
  let carry = 0
  let frozenRaw: number | null = null
  for (let day = 1; day <= daysInMonth; day++) {
    const isFuture = new Date(year, month - 1, day) > todayDate
    let raw: number
    if (isFuture) {
      frozenRaw ??= baseline + carry
      raw = frozenRaw
    } else {
      raw = baseline + carry
      carry = raw - (spentByDay.get(day) ?? 0)
    }
    result.push(monthlyBudget > 0 ? Math.floor(Math.max(raw, 0)) : null)
  }
  return result
}

export function getSpentByDay(expenses: Expense[]): Map<number, number> {
  const map = new Map<number, number>()
  for (const expense of expenses) {
    const day = Number(expense.expenseDate.slice(8, 10))
    map.set(day, (map.get(day) ?? 0) + expense.amount)
  }
  return map
}

const SURPLUS_THRESHOLD = 1000

/** 이번 달 지출 속도로 본 저축 목표 달성 전망(웹 DashboardPage 로직 그대로). 이번 달이 아니면 null. */
export function getPaceMessage(
  expenses: Expense[],
  yearMonth: string,
  monthlyBudget: number,
  savingGoal: number,
): { text: string; warning: boolean } | null {
  const [year, month] = yearMonth.split('-').map(Number)
  const today = new Date()
  if (today.getFullYear() !== year || today.getMonth() + 1 !== month || monthlyBudget <= 0) return null

  const daysElapsed = today.getDate()
  const daysInMonth = new Date(year, month, 0).getDate()
  const spentSoFar = expenses
    .filter((expense) => Number(expense.expenseDate.slice(8, 10)) <= daysElapsed)
    .reduce((sum, expense) => sum + expense.amount, 0)
  const avgDailySpend = spentSoFar / daysElapsed
  if (avgDailySpend <= 0) return null

  const remainingSpendable = monthlyBudget - savingGoal - spentSoFar
  if (remainingSpendable <= 0) {
    const overspent = spentSoFar - (monthlyBudget - savingGoal)
    return { text: `이미 목표 저축액을 위한 지출 한도를 ${formatCurrency(overspent)}만큼 초과했어요.`, warning: true }
  }
  const projectedSurplus = remainingSpendable - avgDailySpend * (daysInMonth - daysElapsed)
  if (projectedSurplus > SURPLUS_THRESHOLD) {
    return { text: `이대로라면 목표 저축액을 충분히 모으고도 ${formatCurrency(projectedSurplus)}을 더 모을 수 있어요!`, warning: false }
  }
  if (projectedSurplus >= -SURPLUS_THRESHOLD) {
    return { text: '이대로라면 목표 저축액을 충분히 모을 수 있어요.', warning: false }
  }
  return { text: `이대로라면 목표 저축액보다 ${formatCurrency(-projectedSurplus)} 부족하게 모일 것 같아요.`, warning: true }
}
