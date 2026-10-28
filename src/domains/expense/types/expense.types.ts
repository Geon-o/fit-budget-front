export interface Expense {
  id: string
  expenseDate: string // ISO date (YYYY-MM-DD)
  amount: number
  category: string
  memo: string
  source: 'manual'
}
