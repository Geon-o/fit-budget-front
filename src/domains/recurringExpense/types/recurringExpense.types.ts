export interface RecurringExpense {
  id: string
  memo: string
  dayOfMonth: number // 1-31
  amount: number | null // null이면 매달 금액이 달라지는 변동형
}
