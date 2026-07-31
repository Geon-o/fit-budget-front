import type { Budget } from '../types/budget.types'
import { formatCurrency, getDaysUntil } from '../../../shared/utils/dateUtils'
import './BudgetSummaryCard.css'

interface BudgetSummaryCardProps {
  budget: Budget | null
}

function formatDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-')
  return `${Number(month)}월 ${Number(day)}일`
}

function BudgetSummaryCard({ budget }: BudgetSummaryCardProps) {
  if (!budget) {
    return <p className="budget-summary__empty">아직 설정된 예산이 없습니다. 오른쪽에서 등록해 주세요.</p>
  }

  const daysUntil = getDaysUntil(budget.paymentDate)

  return (
    <div className="budget-summary">
      <div className="budget-summary__row">
        <span className="budget-summary__label">월 생활비 예산</span>
        <span className="budget-summary__value">{formatCurrency(budget.monthlyBudget)}</span>
      </div>
      <div className="budget-summary__row">
        <span className="budget-summary__label">목표 저축액</span>
        <span className="budget-summary__value">{formatCurrency(budget.savingGoal)}</span>
      </div>
      <div className="budget-summary__row">
        <span className="budget-summary__label">다음달 생활비 입금일</span>
        <span className="budget-summary__value">
          {formatDate(budget.paymentDate)}
          <span className="budget-summary__dday"> · D-{daysUntil}</span>
        </span>
      </div>
    </div>
  )
}

export default BudgetSummaryCard
