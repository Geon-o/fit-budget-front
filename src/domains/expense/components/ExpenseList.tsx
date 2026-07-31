import type { Expense } from '../types/expense.types'
import ExpenseItem from './ExpenseItem'
import './ExpenseList.css'

interface ExpenseListProps {
  expenses: Expense[]
}

function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="expense-page__empty">이번 달 지출 내역이 없습니다.</p>
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </ul>
  )
}

export default ExpenseList
