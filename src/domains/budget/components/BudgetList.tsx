import { useState } from 'react'
import type { Budget } from '../types/budget.types'
import { formatCurrency, formatYearMonth, getDaysUntil } from '../../../shared/utils/dateUtils'
import './BudgetList.css'

interface BudgetListProps {
  budgets: Budget[]
  onSave: (input: Omit<Budget, 'id'>) => void
  openYearMonth: string | null
  onToggle: (yearMonth: string | null) => void
  isClosed: (yearMonth: string) => boolean
}

function BudgetList({ budgets, onSave, openYearMonth, onToggle, isClosed }: BudgetListProps) {
  const [editingYearMonth, setEditingYearMonth] = useState<string | null>(null)
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [paymentDate, setPaymentDate] = useState('')

  if (budgets.length === 0) {
    return <p className="budget-list__empty">아직 설정된 예산이 없습니다. 오른쪽에서 등록해 주세요.</p>
  }

  const sorted = [...budgets].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))

  function startEdit(budget: Budget) {
    onToggle(budget.yearMonth)
    setEditingYearMonth(budget.yearMonth)
    setMonthlyBudget(String(budget.monthlyBudget))
    setSavingGoal(String(budget.savingGoal))
    setPaymentDate(budget.paymentDate)
  }

  function cancelEdit() {
    setEditingYearMonth(null)
  }

  function saveEdit(budget: Budget) {
    const parsedBudget = Number(monthlyBudget)
    const parsedGoal = Number(savingGoal) || 0
    if (!parsedBudget || parsedBudget <= 0 || !paymentDate) return

    const hasChanged =
      parsedBudget !== budget.monthlyBudget ||
      parsedGoal !== budget.savingGoal ||
      paymentDate !== budget.paymentDate

    if (hasChanged) {
      onSave({ yearMonth: budget.yearMonth, monthlyBudget: parsedBudget, savingGoal: parsedGoal, paymentDate })
    }
    setEditingYearMonth(null)
  }

  return (
    <ul className="budget-list">
      {sorted.map((budget) => {
        const isOpen = openYearMonth === budget.yearMonth
        const isEditing = editingYearMonth === budget.yearMonth
        const daysUntilPayment = getDaysUntil(budget.paymentDate)
        const closed = isClosed(budget.yearMonth)

        return (
          <li key={budget.id} className="budget-list__item">
            <div className="budget-list__header">
              <button
                type="button"
                className="budget-list__toggle"
                onClick={() => onToggle(isOpen ? null : budget.yearMonth)}
                aria-expanded={isOpen}
              >
                <span className="budget-list__month-group">
                  <span className="budget-list__month">{formatYearMonth(budget.yearMonth)}</span>
                  <span
                    className={
                      closed
                        ? 'budget-list__status budget-list__status--closed'
                        : 'budget-list__status budget-list__status--progress'
                    }
                  >
                    {closed ? '마감' : '진행중'}
                  </span>
                </span>
                <span className={isOpen ? 'budget-list__chevron is-open' : 'budget-list__chevron'}>
                  ▾
                </span>
              </button>
              <button
                type="button"
                className="budget-list__edit"
                aria-label="수정"
                disabled={closed}
                onClick={() => startEdit(budget)}
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                  <path
                    d="M13.5 3.5 16.5 6.5 7 16H4V13L13.5 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {isOpen && (
              <div className="budget-list__detail">
                <div className="budget-list__row">
                  <span className="budget-list__label">월 생활비 예산</span>
                  {isEditing ? (
                    <input
                      className="budget-list__edit-input"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                    />
                  ) : (
                    <span className="budget-list__value">
                      {formatCurrency(budget.monthlyBudget)}
                    </span>
                  )}
                </div>
                <div className="budget-list__row">
                  <span className="budget-list__label">목표 저축액</span>
                  {isEditing ? (
                    <input
                      className="budget-list__edit-input"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={savingGoal}
                      onChange={(e) => setSavingGoal(e.target.value)}
                    />
                  ) : (
                    <span className="budget-list__value">{formatCurrency(budget.savingGoal)}</span>
                  )}
                </div>
                <div className="budget-list__row">
                  <span className="budget-list__label">다음달 생활비 입금일</span>
                  {isEditing ? (
                    <input
                      className="budget-list__edit-input"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  ) : (
                    <span className="budget-list__value">
                      {daysUntilPayment > 0 && (
                        <span className="budget-list__dday">D-{daysUntilPayment} · </span>
                      )}
                      {budget.paymentDate}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <div className="budget-list__edit-actions">
                    <button type="button" className="budget-list__cancel" onClick={cancelEdit}>
                      취소
                    </button>
                    <button
                      type="button"
                      className="budget-list__save"
                      onClick={() => saveEdit(budget)}
                    >
                      저장
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default BudgetList
