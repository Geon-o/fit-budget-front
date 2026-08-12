import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Budget } from '../types/budget.types'
import { getDaysUntil } from '../../../shared/utils/dateUtils'
import Select from '../../../shared/components/Select'
import './BudgetForm.css'

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getNextYearMonth(yearMonth: string): { year: number; month: number } {
  const [year, month] = yearMonth.split('-').map(Number)
  const next = new Date(year, month, 1) // month is already next month's index (0-based) here
  return { year: next.getFullYear(), month: next.getMonth() + 1 }
}

interface BudgetFormProps {
  budgets: Budget[]
  onSubmit: (input: Omit<Budget, 'id'>) => void
  onYearMonthChange?: (yearMonth: string) => void
}

function BudgetForm({ budgets, onSubmit, onYearMonthChange }: BudgetFormProps) {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth())
  const [monthlyBudget, setMonthlyBudget] = useState('')
  const [savingGoal, setSavingGoal] = useState('')
  const [paymentDay, setPaymentDay] = useState('1')

  useEffect(() => {
    onYearMonthChange?.(yearMonth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearMonth])

  const alreadyRegistered = budgets.some((b) => b.yearMonth === yearMonth)

  const { year: nextYear, month: nextMonth } = getNextYearMonth(yearMonth)
  const daysInNextMonth = new Date(nextYear, nextMonth, 0).getDate()
  const dayOptions = useMemo(
    () => Array.from({ length: daysInNextMonth }, (_, i) => i + 1).map((d) => ({
      value: String(d),
      label: `${d}일`,
    })),
    [daysInNextMonth],
  )

  useEffect(() => {
    if (Number(paymentDay) > daysInNextMonth) {
      setPaymentDay(String(daysInNextMonth))
    }
  }, [daysInNextMonth, paymentDay])

  const paymentDate = paymentDay
    ? `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`
    : ''
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
    setPaymentDay('1')
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

      <div className="budget-form__field">
        <span className="budget-form__label-row">
          <span className="budget-form__label">다음달 생활비 입금일</span>
          {daysUntilPayment !== null && daysUntilPayment > 0 && (
            <span className="budget-form__dday">D-{daysUntilPayment}</span>
          )}
        </span>
        <Select options={dayOptions} value={paymentDay} onChange={setPaymentDay} />
      </div>

      <button className="budget-form__submit" type="submit" disabled={alreadyRegistered}>
        등록하기
      </button>
    </form>
  )
}

export default BudgetForm
