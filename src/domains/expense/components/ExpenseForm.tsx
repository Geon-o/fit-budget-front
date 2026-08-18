import { useState } from 'react'
import type { FormEvent } from 'react'
import Select from '../../../shared/components/Select'
import { EXPENSE_CATEGORIES } from '../../../shared/constants/categories'
import type { Expense } from '../types/expense.types'
import './ExpenseForm.css'

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))

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
  prefillDate?: string
}

function ExpenseForm({
  onSubmit,
  initialValue,
  submitLabel,
  onCancel,
  compact,
  prefillCategory,
  prefillMemo,
  prefillDate,
}: ExpenseFormProps) {
  const [expenseDate, setExpenseDate] = useState(initialValue?.expenseDate ?? prefillDate ?? getToday())
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
          className={
            prefillMemo
              ? 'expense-form__input expense-form__input--amount expense-form__input--highlight'
              : 'expense-form__input expense-form__input--amount'
          }
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amount ? Number(amount).toLocaleString('ko-KR') : ''}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
          autoFocus={!!prefillMemo}
          required
        />
      </label>

      <label className="expense-form__field">
        <span className="expense-form__label">카테고리</span>
        <Select options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
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
