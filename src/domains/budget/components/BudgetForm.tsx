import { useState } from 'react'
import type { FormEvent } from 'react'
import type { Budget } from '../types/budget.types'
import { getDaysUntil } from '../../../shared/utils/dateUtils'
import './BudgetForm.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

interface BudgetFormProps {
  budgets: Budget[]
  onSubmit: (input: Omit<Budget, 'id'>) => void
}

function BudgetForm({ budgets, onSubmit }: BudgetFormProps) {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [paymentDate, setPaymentDate] = useState('')

  const alreadyRegistered = budgets.some((b) => b.yearMonth === yearMonth)
  const daysUntilPayment = paymentDate ? getDaysUntil(paymentDate) : null

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedBudget = Number(monthlyBudget)
    const parsedGoal = Number(savingGoal)
    if (!parsedBudget || parsedBudget <= 0 || !paymentDate || alreadyRegistered) return

    onSubmit({ yearMonth, monthlyBudget: parsedBudget, savingGoal: parsedGoal || 0, paymentDate })

    setYearMonth(getCurrentYearMonth())
    setMonthlyBudget('')
    setSavingGoal('')
    setPaymentDate('')
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <label className="budget-form__field">
        <span className="budget-form__label">대상 월</span>
        <input
          className="budget-form__input"
          type="month"
          value={yearMonth}
          onChange={(e) => setYearMonth(e.target.value)}
          required
        />
        {alreadyRegistered && (
          <span className="budget-form__hint">이미 등록된 달이에요. 목록에서 수정해주세요.</span>
        )}
      </label>

      <label className="budget-form__field">
        <span className="budget-form__label">월 생활비 예산</span>
        <input
          className="budget-form__input"
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="0"
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(e.target.value)}
          required
        />
      </label>

      <label className="budget-form__field">
        <span className="budget-form__label">목표 저축액</span>
        <input
          className="budget-form__input"
          type="number"
          inputMode="numeric"
          min="0"
          placeholder="0"
          value={savingGoal}
          onChange={(e) => setSavingGoal(e.target.value)}
        />
      </label>

      <label className="budget-form__field">
        <span className="budget-form__label-row">
          <span className="budget-form__label">다음달 생활비 입금일</span>
          {daysUntilPayment !== null && daysUntilPayment > 0 && (
            <span className="budget-form__dday">D-{daysUntilPayment}</span>
          )}
        </span>
        <input
          className="budget-form__input"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </label>

      <button className="budget-form__submit" type="submit" disabled={alreadyRegistered}>
        등록하기
      </button>
    </form>
  )
}

export default BudgetForm
