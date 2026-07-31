export interface Budget {
  id: string
  yearMonth: string // YYYY-MM
  monthlyBudget: number
  savingGoal: number
  paymentDate: string // ISO date (YYYY-MM-DD), 다음달 생활비 입금일
}
