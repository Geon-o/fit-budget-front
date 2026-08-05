import { formatCurrency, getDaysUntil } from '../../../shared/utils/dateUtils'
import './SummaryCards.css'

interface SummaryCardsProps {
  total: number
  monthlyBudget: number
  paymentDate?: string
}

function SummaryCards({ total, monthlyBudget, paymentDate }: SummaryCardsProps) {
  const hasBudget = monthlyBudget > 0
  const usageRatio = hasBudget ? Math.min(total / monthlyBudget, 1) : 0
  const usagePercent = hasBudget ? Math.round((total / monthlyBudget) * 100) : null
  const remaining = hasBudget ? monthlyBudget - total : null
  const isOver = hasBudget && total > monthlyBudget
  const daysUntilPayment = paymentDate ? getDaysUntil(paymentDate) : null

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <span className="summary-card__label">이번 달 지출</span>
        <span className="summary-card__value">{formatCurrency(total)}</span>
      </div>

      <div className="summary-card">
        <span className="summary-card__label">예산 대비 사용률</span>
        {hasBudget ? (
          <>
            <span
              className={
                isOver ? 'summary-card__value summary-card__value--danger' : 'summary-card__value'
              }
            >
              {usagePercent}%
            </span>
            <div className="summary-card__bar">
              <div
                className={
                  isOver
                    ? 'summary-card__bar-fill summary-card__bar-fill--danger'
                    : 'summary-card__bar-fill'
                }
                style={{ width: `${Math.round(usageRatio * 100)}%` }}
              />
            </div>
          </>
        ) : (
          <span className="summary-card__placeholder">예산 미설정</span>
        )}
      </div>

      <div className="summary-card">
        <span className="summary-card__label">잔여 예산</span>
        <span
          className={
            remaining !== null && remaining < 0
              ? 'summary-card__value summary-card__value--danger'
              : 'summary-card__value'
          }
        >
          {remaining !== null ? formatCurrency(remaining) : '-'}
        </span>
      </div>

      <div className="summary-card">
        <span className="summary-card__label">다음 입금일</span>
        <span className="summary-card__value">
          {daysUntilPayment === null ? '-' : daysUntilPayment > 0 ? `D-${daysUntilPayment}` : 'D-Day'}
        </span>
      </div>
    </div>
  )
}

export default SummaryCards
