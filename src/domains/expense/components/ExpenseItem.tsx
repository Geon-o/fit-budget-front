import { useState } from 'react'
import type { Expense } from '../types/expense.types'
import { formatCurrency } from '../../../shared/utils/dateUtils'
import { getCategoryStyle } from '../../../shared/constants/categories'
import ExpenseForm from './ExpenseForm'

interface ExpenseItemProps {
  expense: Expense
  onUpdate: (id: string, input: Omit<Expense, 'id' | 'source'>) => void
  onDelete: (id: string) => void
  readOnly?: boolean
}

function formatDay(dateStr: string): string {
  return dateStr.slice(8, 10) + '일'
}

function ExpenseItem({ expense, onUpdate, onDelete, readOnly }: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { icon, color, bg } = getCategoryStyle(expense.category)

  if (isEditing) {
    return (
      <li className="expense-item expense-item--editing">
        <ExpenseForm
          compact
          initialValue={expense}
          submitLabel="저장"
          onCancel={() => setIsEditing(false)}
          onSubmit={(input) => {
            onUpdate(expense.id, input)
            setIsEditing(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className="expense-item">
      <span className="expense-item__icon" style={{ background: bg, color }}>
        {icon}
      </span>
      <span className="expense-item__info">
        <span className="expense-item__memo">{expense.memo}</span>
        <span className="expense-item__meta">
          {expense.category} · {formatDay(expense.expenseDate)}
        </span>
      </span>
      <span className="expense-item__amount">{formatCurrency(expense.amount)}</span>
      {!readOnly && (
        <span className="expense-item__actions">
          <button
            className="expense-item__action"
            type="button"
            aria-label="수정"
            onClick={() => setIsEditing(true)}
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
          <button
            className="expense-item__action expense-item__action--danger"
            type="button"
            aria-label="삭제"
            onClick={() => {
              if (window.confirm('이 지출 내역을 삭제할까요?')) onDelete(expense.id)
            }}
          >
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
              <path
                d="M4 6H16M8 6V4.5C8 4 8.4 3.5 9 3.5H11C11.6 3.5 12 4 12 4.5V6M15 6L14.4 15.5C14.4 16.1 13.9 16.5 13.3 16.5H6.7C6.1 16.5 5.6 16.1 5.6 15.5L5 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </span>
      )}
    </li>
  )
}

export default ExpenseItem
