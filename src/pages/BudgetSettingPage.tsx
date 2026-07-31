import { useState } from 'react'
import { BudgetForm, BudgetSummaryCard, useBudget } from '../domains/budget'
import './BudgetSettingPage.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function BudgetSettingPage() {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())
  const { budget, isLoading, updateBudget } = useBudget(yearMonth)

  return (
    <div>
      <div className="budget-page__header">
        <p className="budget-page__label">예산 설정</p>
        <input
          className="budget-page__month-picker"
          type="month"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
        />
      </div>

      <div className="budget-page__layout">
        <div className="budget-page__main">
          {isLoading ? (
            <p className="budget-page__empty">불러오는 중...</p>
          ) : (
            <BudgetSummaryCard budget={budget} />
          )}
        </div>

        <aside className="budget-page__form-panel">
          <BudgetForm budget={budget} onSubmit={updateBudget} />
        </aside>
      </div>
    </div>
  )
}

export default BudgetSettingPage
