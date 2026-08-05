import { useMemo, useState } from 'react'
import { useExpenses, useMonthlyTotals } from '../domains/expense'
import { useBudgets } from '../domains/budget'
import {
  BudgetTrendChart,
  CategoryBreakdown,
  ExpenseCalendar,
  RecentExpenses,
  SummaryCards,
} from '../domains/dashboard'
import WheelPicker from '../shared/components/WheelPicker'
import { formatCurrency } from '../shared/utils/dateUtils'
import './DashboardPage.css'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

function getCurrentDate() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function DashboardPage() {
  const [{ year, month }, setDate] = useState(getCurrentDate)
  const yearMonth = toYearMonth(year, month)

  const { expenses, isLoading } = useExpenses(yearMonth)
  const { budgets } = useBudgets()
  const { totals: monthlyTotals } = useMonthlyTotals()

  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const monthlyBudget = budget?.monthlyBudget ?? 0
  const savingGoal = budget?.savingGoal ?? 0
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const daysElapsed = isCurrentMonth ? today.getDate() : 0
  const daysInMonth = new Date(year, month, 0).getDate()

  const spentSoFar = isCurrentMonth
    ? expenses
        .filter((expense) => Number(expense.expenseDate.slice(8, 10)) <= daysElapsed)
        .reduce((sum, expense) => sum + expense.amount, 0)
    : 0
  const avgDailySpend = daysElapsed > 0 ? spentSoFar / daysElapsed : 0
  const remainingSpendable = monthlyBudget - savingGoal - spentSoFar

  let paceMessage: string | null = null
  let paceIsWarning = false

  const SURPLUS_THRESHOLD = 1000

  if (isCurrentMonth && monthlyBudget > 0 && avgDailySpend > 0) {
    if (remainingSpendable <= 0) {
      const overspent = spentSoFar - (monthlyBudget - savingGoal)
      paceMessage = `이미 목표 저축액을 위한 지출 한도를 ${formatCurrency(overspent)}만큼 초과했어요.`
      paceIsWarning = true
    } else {
      const remainingDaysInMonth = daysInMonth - daysElapsed
      const projectedRemainingSpend = avgDailySpend * remainingDaysInMonth
      const projectedSurplus = remainingSpendable - projectedRemainingSpend

      if (projectedSurplus > SURPLUS_THRESHOLD) {
        paceMessage = `이대로라면 목표 저축액을 충분히 모으고도 ${formatCurrency(projectedSurplus)}을 더 모을 수 있어요!`
        paceIsWarning = false
      } else if (projectedSurplus >= -SURPLUS_THRESHOLD) {
        paceMessage = '이대로라면 목표 저축액을 충분히 모을 수 있어요.'
        paceIsWarning = false
      } else {
        paceMessage = `이대로라면 목표 저축액보다 ${formatCurrency(-projectedSurplus)} 부족하게 모일 것 같아요.`
        paceIsWarning = true
      }
    }
  }

  const years = useMemo(() => {
    const currentYear = getCurrentDate().year
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)
  }, [])

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <div className="dashboard-page__date-wheels">
          <WheelPicker
            value={year}
            options={years}
            onChange={(nextYear) => setDate((prev) => ({ ...prev, year: nextYear }))}
            formatLabel={(y) => `${y}년`}
          />
          <WheelPicker
            value={month}
            options={MONTHS}
            onChange={(nextMonth) => setDate((prev) => ({ ...prev, month: nextMonth }))}
            formatLabel={(m) => `${m}월`}
            wrap
          />
          <button
            type="button"
            className="dashboard-page__today-button"
            onClick={() => setDate(getCurrentDate())}
            title="이번 달로 이동"
          >
            Today
          </button>
        </div>
      </div>

      <SummaryCards total={total} monthlyBudget={monthlyBudget} paymentDate={budget?.paymentDate} />

      {isLoading ? (
        <p className="dashboard-page__empty">불러오는 중...</p>
      ) : (
        <>
          <div className="dashboard-page__layout">
            <div className="dashboard-page__calendar">
              <ExpenseCalendar
                yearMonth={yearMonth}
                expenses={expenses}
                monthlyBudget={monthlyBudget}
                savingGoal={savingGoal}
                paceMessage={paceMessage}
                paceIsWarning={paceIsWarning}
              />
            </div>
          </div>

          <div className="dashboard-page__trend">
            <p className="dashboard-page__section-title">예산 대비 지출 추이</p>
            <BudgetTrendChart yearMonth={yearMonth} budgets={budgets} monthlyTotals={monthlyTotals} />
          </div>

          <div className="dashboard-page__insights">
            <div className="dashboard-page__insight-card">
              <p className="dashboard-page__section-title">카테고리별 지출</p>
              <CategoryBreakdown expenses={expenses} />
            </div>
            <div className="dashboard-page__insight-card">
              <p className="dashboard-page__section-title">최근 지출 내역</p>
              <RecentExpenses expenses={expenses} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardPage
