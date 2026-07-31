import { useState } from 'react'
import { ExpenseForm, ExpenseList, useExpenses } from '../domains/expense'
import { formatCurrency } from '../shared/utils/dateUtils'
import './ExpensePage.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function ExpensePage() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())
  const { expenses, isLoading, addExpense } = useExpenses(yearMonth)
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div>
      <header className="expense-page__header">
        <h1 className="expense-page__title">지출 내역</h1>
        <input
          className="expense-page__month-picker"
          type="month"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
        />
      </header>

      <section className="expense-page__summary">
        <p className="expense-page__summary-label">이번 달 총 지출</p>
        <p className="expense-page__summary-amount">{formatCurrency(total)}</p>
      </section>

      <div className="expense-page__layout">
        <div className="expense-page__main">
          <p className="expense-page__section-title">지출 목록</p>
          {isLoading ? (
            <p className="expense-page__empty">불러오는 중...</p>
          ) : (
            <ExpenseList expenses={expenses} />
          )}
        </div>

        <aside className="expense-page__form-panel">
          <ExpenseForm onSubmit={addExpense} />
        </aside>
      </div>
    </div>
  )
}

export default ExpensePage
