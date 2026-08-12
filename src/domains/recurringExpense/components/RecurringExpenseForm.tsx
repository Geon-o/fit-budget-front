import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Select from '../../../shared/components/Select'
import type { RecurringExpense } from '../types/recurringExpense.types'
import './RecurringExpenseForm.css'

interface RecurringExpenseFormProps {
  onSubmit: (input: Omit<RecurringExpense, 'id'>) => void
  targetYearMonth: string
}

function RecurringExpenseForm({ onSubmit, targetYearMonth }: RecurringExpenseFormProps) {
  const [memo, setMemo] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [amountType, setAmountType] = useState<'fixed' | 'variable'>('fixed')
  const [amount, setAmount] = useState('')

  const [targetYear, targetMonth] = targetYearMonth.split('-').map(Number)
  const daysInTargetMonth = new Date(targetYear, targetMonth, 0).getDate()
  const dayOptions = useMemo(
    () =>
      Array.from({ length: daysInTargetMonth }, (_, i) => i + 1).map((d) => ({
        value: String(d),
        label: `${d}일`,
      })),
    [daysInTargetMonth],
  )

  useEffect(() => {
    if (Number(dayOfMonth) > daysInTargetMonth) {
      setDayOfMonth(String(daysInTargetMonth))
    }
  }, [daysInTargetMonth, dayOfMonth])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const day = Number(dayOfMonth)
    if (!memo || day < 1 || day > daysInTargetMonth) return
    if (amountType === 'fixed' && (!amount || Number(amount) <= 0)) return

    onSubmit({
      memo,
      dayOfMonth: day,
      amount: amountType === 'fixed' ? Number(amount) : null,
    })

    setMemo('')
    setAmount('')
  }

  return (
    <form className="recurring-expense-form" onSubmit={handleSubmit}>
      <label className="recurring-expense-form__field">
        <span className="recurring-expense-form__label">항목명</span>
        <input
          className="recurring-expense-form__input"
          type="text"
          placeholder="예: 월세, 전기세"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          required
        />
      </label>

      <div className="recurring-expense-form__field">
        <span className="recurring-expense-form__label">매달 며칠</span>
        <Select options={dayOptions} value={dayOfMonth} onChange={setDayOfMonth} />
      </div>

      <div className="recurring-expense-form__field">
        <span className="recurring-expense-form__label">금액 유형</span>
        <div className="recurring-expense-form__amount-type">
          <label className="recurring-expense-form__radio">
            <input
              type="radio"
              name="amountType"
              checked={amountType === 'fixed'}
              onChange={() => setAmountType('fixed')}
            />
            고정 (매달 동일)
          </label>
          <label className="recurring-expense-form__radio">
            <input
              type="radio"
              name="amountType"
              checked={amountType === 'variable'}
              onChange={() => setAmountType('variable')}
            />
            변동 (매달 다름)
          </label>
        </div>
      </div>

      {amountType === 'fixed' && (
        <label className="recurring-expense-form__field">
          <span className="recurring-expense-form__label">금액</span>
          <input
            className="recurring-expense-form__input"
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
      )}

      <button className="recurring-expense-form__submit" type="submit">
        등록하기
      </button>
    </form>
  )
}

export default RecurringExpenseForm
