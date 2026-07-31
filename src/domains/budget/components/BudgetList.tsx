import { useState } from 'react'
import type { Budget } from '../types/budget.types'
import { formatCurrency, formatYearMonth, getDaysUntil } from '../../../shared/utils/dateUtils'
import './BudgetList.css'

interface BudgetListProps {
  budgets: Budget[]
}

function BudgetList({ budgets }: BudgetListProps) {
  const [openYearMonth, setOpenYearMonth] = useState<string | null>(
    budgets[0]?.yearMonth ?? null,
  )

  if (budgets.length === 0) {
    return <p className="budget-list__empty">아직 설정된 예산이 없습니다. 오른쪽에서 등록해 주세요.</p>
  }

  const sorted = [...budgets].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))

  return (
    <ul className="budget-list">
      {sorted.map((budget) => {
        const isOpen = openYearMonth === budget.yearMonth

        return (
          <li key={budget.id} className="budget-list__item">
            <button
              type="button"
              className="budget-list__header"
              onClick={() => setOpenYearMonth(isOpen ? null : budget.yearMonth)}
              aria-expanded={isOpen}
            >
              <span className="budget-list__month">{formatYearMonth(budget.yearMonth)}</span>
              <span className={isOpen ? 'budget-list__chevron is-open' : 'budget-list__chevron'}>
                ▾
              </span>
            </button>

            {isOpen && (
              <div className="budget-list__detail">
                <div className="budget-list__row">
                  <span className="budget-list__label">월 생활비 예산</span>
                  <span className="budget-list__value">
                    {formatCurrency(budget.monthlyBudget)}
                  </span>
                </div>
                <div className="budget-list__row">
                  <span className="budget-list__label">목표 저축액</span>
                  <span className="budget-list__value">{formatCurrency(budget.savingGoal)}</span>
                </div>
                <div className="budget-list__row">
                  <span className="budget-list__label">다음달 생활비 입금일</span>
                  <span className="budget-list__value">
                    {budget.paymentDate}
                    <span className="budget-list__dday"> · D-{getDaysUntil(budget.paymentDate)}</span>
                  </span>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default BudgetList
