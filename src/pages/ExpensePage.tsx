import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExpenseForm, ExpenseList, useClosedMonths, useExpenses } from '../domains/expense'
import { useBudgets } from '../domains/budget'
import { useRecurringExpenses } from '../domains/recurringExpense'
import { useLedger } from '../app/providers/LedgerProvider'
import { formatCurrency } from '../shared/utils/dateUtils'
import { useCountUp } from '../shared/hooks/useCountUp'
import './ExpensePage.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function ExpensePage() {
  const { ledgerId, ledgers, isLoading: isLedgerLoading } = useLedger()
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())

  if (!ledgerId) {
    return (
      <p className="expense-page__empty">
        {isLedgerLoading || ledgers.length > 0
          ? '불러오는 중...'
          : "가계부를 먼저 만들어주세요 (상단 '가계부 변경')"}
      </p>
    )
  }

  return <ExpensePageContent ledgerId={ledgerId} yearMonth={yearMonth} setYearMonth={setYearMonth} />
}

function ExpensePageContent({
  ledgerId,
  yearMonth,
  setYearMonth,
}: {
  ledgerId: string
  yearMonth: string
  setYearMonth: (yearMonth: string) => void
}) {
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses(ledgerId, yearMonth)
  const { isClosed, toggleClosed } = useClosedMonths(ledgerId)
  const monthClosed = isClosed(yearMonth)
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const { recurringExpenses } = useRecurringExpenses(ledgerId)
  const isCurrentMonth = yearMonth === getCurrentYearMonth()

  const unloggedVariable = isCurrentMonth
    ? recurringExpenses.filter(
        (r) => r.amount === null && !expenses.some((e) => e.memo === r.memo),
      )
    : []

  const [prefillMemo, setPrefillMemo] = useState<string | null>(null)
  const [prefillDate, setPrefillDate] = useState<string | null>(null)

  useEffect(() => {
    if (!isCurrentMonth || isLoading) return

    const today = new Date().getDate()
    const missingFixed = recurringExpenses.filter(
      (r) => r.amount !== null && r.dayOfMonth <= today && !expenses.some((e) => e.memo === r.memo),
    )

    for (const item of missingFixed) {
      addExpense({
        expenseDate: `${yearMonth}-${String(item.dayOfMonth).padStart(2, '0')}`,
        amount: item.amount as number,
        category: '기타',
        memo: item.memo,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentMonth, isLoading, recurringExpenses, expenses])

  const { budgets } = useBudgets(ledgerId)
  const budget = budgets.find((b) => b.yearMonth === yearMonth)
  const monthlyBudget = budget?.monthlyBudget ?? 0
  const savingGoal = budget?.savingGoal ?? 0
  const remainingBudget = monthlyBudget - total
  const savingGap = remainingBudget - savingGoal
  const savingAnalysis =
    savingGap > 0
      ? `목표보다 ${formatCurrency(savingGap)} 더 모았어요`
      : savingGap < 0
        ? `목표보다 ${formatCurrency(Math.abs(savingGap))} 덜 모았어요`
        : '목표한 금액만큼 정확히 모았어요'
  const savingAnalysisClass =
    savingGap > 0
      ? 'expense-page__closed-summary-headline is-positive'
      : savingGap < 0
        ? 'expense-page__closed-summary-headline is-negative'
        : 'expense-page__closed-summary-headline'

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
          <input
            className="expense-page__month-picker"
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="expense-page__close-button"
          onClick={() => toggleClosed(yearMonth)}
        >
          {monthClosed ? '마감취소' : '마감'}
        </button>
        <div
          className={
            monthClosed
              ? 'expense-page__summary-collapsible is-collapsed'
              : 'expense-page__summary-collapsible'
          }
        >
          <div className="expense-page__summary-collapsible-inner">
            <p className="expense-page__summary-label">이번 달 총 지출</p>
            <p className="expense-page__summary-amount">{formatCurrency(animatedSummaryTotal)}</p>
          </div>
        </div>
      </section>

      <div className="expense-page__layout">
        <p className="expense-page__section-title">지출 목록</p>

        <div className="expense-page__main">
          {isLoading ? (
            <p className="expense-page__empty">불러오는 중...</p>
          ) : (
            <ExpenseList
              expenses={expenses}
              onUpdate={updateExpense}
              onDelete={deleteExpense}
              readOnly={monthClosed}
            />
          )}
        </div>

        <aside className="expense-page__form-panel">
          <div className="expense-page__form-sticky">
            {monthClosed ? (
              <div className="expense-page__closed-summary">
                <div className="expense-page__closed-summary-inputs">
                  <div className="expense-page__closed-summary-row">
                    <span>예산</span>
                    <span>{formatCurrency(monthlyBudget)}</span>
                  </div>
                  <div className="expense-page__closed-summary-row">
                    <span>지출금액</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="expense-page__closed-summary-divider" />

                <div className="expense-page__closed-summary-compare">
                  <div className="expense-page__closed-summary-compare-item">
                    <span className="expense-page__closed-summary-compare-label">잔여 예산</span>
                    <span className="expense-page__closed-summary-compare-value">
                      {formatCurrency(remainingBudget)}
                    </span>
                  </div>
                  <div className="expense-page__closed-summary-compare-item">
                    <span className="expense-page__closed-summary-compare-label">목표 저축금액</span>
                    <span className="expense-page__closed-summary-compare-value">
                      {formatCurrency(savingGoal)}
                    </span>
                  </div>
                </div>

                <p className={savingAnalysisClass}>{savingAnalysis}</p>
              </div>
            ) : (
              <>
                {!budget && (
                  <div className="expense-page__budget-nudge">
                    <span>이 달 예산이 없어요</span>
                    <Link to="/budget" className="expense-page__budget-nudge-link">
                      예산 설정하기
                    </Link>
                  </div>
                )}
                {unloggedVariable.map((item) => (
                  <div key={item.id} className="expense-page__budget-nudge">
                    <span>이번 달 {item.memo} 아직 입력 안 했어요</span>
                    <button
                      type="button"
                      className="expense-page__budget-nudge-link"
                      onClick={() => {
                        setPrefillMemo(item.memo)
                        setPrefillDate(`${yearMonth}-${String(item.dayOfMonth).padStart(2, '0')}`)
                      }}
                    >
                      입력하기
                    </button>
                  </div>
                ))}
                <ExpenseForm
                  key={prefillMemo ?? 'default'}
                  onSubmit={(input) => {
                    addExpense(input)
                    setPrefillMemo(null)
                    setPrefillDate(null)
                  }}
                  prefillMemo={prefillMemo ?? undefined}
                  prefillDate={prefillDate ?? undefined}
                  prefillCategory={prefillMemo ? '공과금' : undefined}
                />
              </>
            )}

            {!monthClosed && (
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
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ExpensePage
