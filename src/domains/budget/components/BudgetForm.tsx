import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Budget } from '../types/budget.types'
import './BudgetForm.css'

interface BudgetFormProps {
  budget: Budget | null
  onSubmit: (input: Omit<Budget, 'id' | 'yearMonth'>) => void
}

function BudgetForm({ budget, onSubmit }: BudgetFormProps) {
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [paymentDate, setPaymentDate] = useState('')

  useEffect(() => {
    setMonthlyBudget(budget ? String(budget.monthlyBudget) : '')
    setSavingGoal(budget ? String(budget.savingGoal) : '')
    setPaymentDate(budget?.paymentDate ?? '')
  }, [budget])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedBudget = Number(monthlyBudget)
    const parsedGoal = Number(savingGoal)
    if (!parsedBudget || parsedBudget <= 0 || !paymentDate) return

    onSubmit({ monthlyBudget: parsedBudget, savingGoal: parsedGoal || 0, paymentDate })
  }

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
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
        <span className="budget-form__label">다음달 생활비 입금일</span>
        <input
          className="budget-form__input"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </label>

      <button className="budget-form__submit" type="submit">
        저장하기
      </button>
    </form>
  )
}

export default BudgetForm
