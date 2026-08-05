import type { Expense } from '../../expense'
import { formatCurrency } from '../../../shared/utils/dateUtils'
import { getCategoryStyle } from '../../../shared/constants/categories'
import './RecentExpenses.css'

interface RecentExpensesProps {
  expenses: Expense[]
}

function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recent = [...expenses].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)).slice(0, 6)

  if (recent.length === 0) {
    return <p className="recent-expenses__empty">이번 달 지출 내역이 없습니다.</p>
  }

  return (
    <ul className="recent-expenses">
      {recent.map((expense) => {
        const { icon, color, bg } = getCategoryStyle(expense.category)
        return (
          <li key={expense.id} className="recent-expenses__row">
            <span className="recent-expenses__icon" style={{ background: bg, color }}>
              {icon}
            </span>
            <span className="recent-expenses__info">
              <span className="recent-expenses__memo">{expense.memo || expense.category}</span>
              <span className="recent-expenses__meta">
                {expense.category} · {expense.expenseDate.slice(8, 10)}일
              </span>
            </span>
            <span className="recent-expenses__amount">{formatCurrency(expense.amount)}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default RecentExpenses
