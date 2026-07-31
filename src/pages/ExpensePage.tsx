import { useEffect, useRef, useState } from 'react'
import { ExpenseForm, ExpenseList, useExpenses } from '../domains/expense'
import { formatCurrency } from '../shared/utils/dateUtils'
import { useCountUp } from '../shared/hooks/useCountUp'
import './ExpensePage.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function ExpensePage() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())
  const { expenses, isLoading, addExpense } = useExpenses(yearMonth)
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const summaryRef = useRef<HTMLElement>(null)
  const [showFloatingTotal, setShowFloatingTotal] = useState(false)

  useEffect(() => {
    const target = summaryRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowFloatingTotal(!entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const animatedSummaryTotal = useCountUp(total, !showFloatingTotal)

  return (
    <div>
      <section className="expense-page__summary" ref={summaryRef}>
        <div className="expense-page__summary-header">
          <p className="expense-page__summary-label">이번 달 총 지출</p>
          <input
            className="expense-page__month-picker"
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>
        <p className="expense-page__summary-amount">{formatCurrency(animatedSummaryTotal)}</p>
      </section>

      <div className="expense-page__layout">
        <p className="expense-page__section-title">지출 목록</p>

        <div className="expense-page__main">
          {isLoading ? (
            <p className="expense-page__empty">불러오는 중...</p>
          ) : (
            <ExpenseList expenses={expenses} />
          )}
        </div>

        <aside className="expense-page__form-panel">
          <div className="expense-page__form-sticky">
            <ExpenseForm onSubmit={addExpense} />

            <div
              className={
                showFloatingTotal
                  ? 'expense-page__floating-total is-visible'
                  : 'expense-page__floating-total'
              }
            >
              <p className="expense-page__floating-total-label">이번 달 총 지출</p>
              <p className="expense-page__floating-total-amount">{formatCurrency(total)}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ExpensePage
