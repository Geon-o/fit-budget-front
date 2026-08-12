import { useState } from 'react'
import type { FormEvent } from 'react'
import { EXPENSE_CATEGORIES } from '../../../shared/constants/categories'
import type { Expense } from '../types/expense.types'
import './ExpenseForm.css'

function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

interface ExpenseFormProps {
  onSubmit: (input: Omit<Expense, 'id' | 'source'>) => void
  initialValue?: Omit<Expense, 'id' | 'source'>
  submitLabel?: string
  onCancel?: () => void
  compact?: boolean
  prefillCategory?: string
  prefillMemo?: string
}

function ExpenseForm({
  onSubmit,
  initialValue,
  submitLabel,
  onCancel,
  compact,
  prefillCategory,
  prefillMemo,
}: ExpenseFormProps) {
  const [expenseDate, setExpenseDate] = useState(initialValue?.expenseDate ?? getToday())
  const [amount, setAmount] = useState(initialValue ? String(initialValue.amount) : '')
  const [category, setCategory] = useState<string>(
    initialValue?.category ?? prefillCategory ?? EXPENSE_CATEGORIES[0],
  )
  const [memo, setMemo] = useState(initialValue?.memo ?? prefillMemo ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) return

    onSubmit({ expenseDate, amount: parsedAmount, category, memo })

    if (!initialValue) {
      setAmount('')
      setMemo('')
    }
  }

  return (
    <form className={compact ? 'expense-form expense-form--compact' : 'expense-form'} onSubmit={handleSubmit}>
      <label className="expense-form__field">
        <span className="expense-form__label">날짜</span>
        <input
          className="expense-form__input"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
      </label>

      <label className="expense-form__field">
        <span className="expense-form__label">금액</span>
        <input
          className="expense-form__input"
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>

      <label className="expense-form__field">
        <span className="expense-form__label">카테고리</span>
        <select
          className="expense-form__input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="expense-form__field">
        <span className="expense-form__label">메모</span>
        <input
          className="expense-form__input"
          type="text"
          placeholder="가맹점명 등"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </label>

      <div className="expense-form__actions">
        {onCancel && (
          <button className="expense-form__cancel" type="button" onClick={onCancel}>
            취소
          </button>
        )}
        <button className="expense-form__submit" type="submit">
          {submitLabel ?? '추가하기'}
        </button>
      </div>
    </form>
  )
}

export default ExpenseForm
