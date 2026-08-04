import type { Expense } from '../types/expense.types'
import ExpenseItem from './ExpenseItem'
import './ExpenseList.css'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (id: string, input: Omit<Expense, 'id' | 'source'>) => void
  onDelete: (id: string) => void
  readOnly?: boolean
}

function ExpenseList({ expenses, onUpdate, onDelete, readOnly }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="expense-page__empty">이번 달 지출 내역이 없습니다.</p>
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onUpdate={onUpdate}
          onDelete={onDelete}
          readOnly={readOnly}
        />
      ))}
    </ul>
  )
}

export default ExpenseList
