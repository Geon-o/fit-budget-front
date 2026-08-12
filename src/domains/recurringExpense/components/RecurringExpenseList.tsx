import { formatCurrency } from '../../../shared/utils/dateUtils'
import type { RecurringExpense } from '../types/recurringExpense.types'
import './RecurringExpenseList.css'

interface RecurringExpenseListProps {
  recurringExpenses: RecurringExpense[]
  onDelete: (id: string) => void
}

function RecurringExpenseList({ recurringExpenses, onDelete }: RecurringExpenseListProps) {
  if (recurringExpenses.length === 0) {
    return <p className="recurring-expense-list__empty">등록된 고정 지출이 없습니다.</p>
  }

  const sorted = [...recurringExpenses].sort((a, b) => a.dayOfMonth - b.dayOfMonth)

  return (
    <ul className="recurring-expense-list">
      {sorted.map((item) => (
        <li key={item.id} className="recurring-expense-list__row">
          <span className="recurring-expense-list__icon">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
              <path
                d="M4 10a6 6 0 0 1 10.5-4M16 10a6 6 0 0 1-10.5 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 3v3.5H10.5M6 17v-3.5H9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="recurring-expense-list__info">
            <span className="recurring-expense-list__memo">{item.memo}</span>
            <span className="recurring-expense-list__meta">매달 {item.dayOfMonth}일</span>
          </span>
          <span className="recurring-expense-list__amount">
            {item.amount !== null ? formatCurrency(item.amount) : '변동'}
          </span>
          <button
            type="button"
            className="recurring-expense-list__delete"
            aria-label="삭제"
            onClick={() => {
              if (window.confirm('이 고정 지출을 삭제할까요?')) onDelete(item.id)
            }}
          >
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
              <path
                d="M4 6H16M8 6V4.5C8 4 8.4 3.5 9 3.5H11C11.6 3.5 12 4 12 4.5V6M15 6L14.4 15.5C14.4 16.1 13.9 16.5 13.3 16.5H6.7C6.1 16.5 5.6 16.1 5.6 15.5L5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}

export default RecurringExpenseList
