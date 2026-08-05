import { useMemo } from 'react'
import type { Expense } from '../../expense'
import { getCategoryStyle } from '../../../shared/constants/categories'
import { formatCurrency } from '../../../shared/utils/dateUtils'
import './CategoryBreakdown.css'

interface CategoryBreakdownProps {
  expenses: Expense[]
}

function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const rows = useMemo(() => {
    const totals = new Map<string, number>()
    for (const expense of expenses) {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount)
    }
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount, ratio: total > 0 ? amount / total : 0 }))
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])

  if (rows.length === 0) {
    return <p className="category-breakdown__empty">이번 달 지출 내역이 없습니다.</p>
  }

  return (
    <ul className="category-breakdown">
      {rows.map(({ category, amount, ratio }) => {
        const { icon, color, bg } = getCategoryStyle(category)
        return (
          <li key={category} className="category-breakdown__row">
            <span className="category-breakdown__icon" style={{ background: bg, color }}>
              {icon}
            </span>
            <div className="category-breakdown__info">
              <div className="category-breakdown__top">
                <span className="category-breakdown__name">{category}</span>
                <span className="category-breakdown__amount">{formatCurrency(amount)}</span>
              </div>
              <div className="category-breakdown__bar">
                <div
                  className="category-breakdown__bar-fill"
                  style={{ width: `${Math.round(ratio * 100)}%`, background: color }}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default CategoryBreakdown
