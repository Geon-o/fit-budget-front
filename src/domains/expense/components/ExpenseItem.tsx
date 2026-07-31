import type { Expense } from '../types/expense.types'
import { formatCurrency } from '../../../shared/utils/dateUtils'
import { getCategoryStyle } from '../../../shared/constants/categories'

interface ExpenseItemProps {
  expense: Expense
}

function formatDay(dateStr: string): string {
  return dateStr.slice(8, 10) + '일'
}

function ExpenseItem({ expense }: ExpenseItemProps) {
  const { icon, color, bg } = getCategoryStyle(expense.category)

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
    </li>
  )
}

export default ExpenseItem
