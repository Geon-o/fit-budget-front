import { useMemo, useState } from 'react'
import type { Budget } from '../../budget'
import Select from '../../../shared/components/Select'
import { formatCurrency } from '../../../shared/utils/dateUtils'
import './BudgetTrendChart.css'

const PERIOD_OPTIONS = [
  { value: '3', label: '3개월' },
  { value: '6', label: '6개월' },
  { value: '12', label: '12개월' },
]

const TICKS = [1, 0.75, 0.5, 0.25, 0]

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function formatCompact(value: number): string {
  if (value >= 10000) return `${Math.round(value / 10000)}만`
  return value.toLocaleString('ko-KR')
}

interface BudgetTrendChartProps {
  yearMonth: string
  budgets: Budget[]
  monthlyTotals: Map<string, number>
}

function BudgetTrendChart({ yearMonth, budgets, monthlyTotals }: BudgetTrendChartProps) {
  const [period, setPeriod] = useState('6')

  const months = useMemo(() => {
    const [year, month] = yearMonth.split('-').map(Number)
    const count = Number(period)
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(year, month - 1 - (count - 1 - i), 1)
      const ym = toYearMonth(date.getFullYear(), date.getMonth() + 1)
      const monthBudget = budgets.find((b) => b.yearMonth === ym)
      return {
        yearMonth: ym,
        label: `${date.getMonth() + 1}월`,
        budget: monthBudget?.monthlyBudget ?? 0,
        spent: monthlyTotals.get(ym) ?? 0,
      }
    })
  }, [yearMonth, period, budgets, monthlyTotals])

  const maxValue = Math.max(1, ...months.map((m) => Math.max(m.budget, m.spent)))

  return (
    <div className="budget-trend">
      <div className="budget-trend__header">
        <div className="budget-trend__legend">
          <span className="budget-trend__legend-item">
            <span className="budget-trend__legend-swatch budget-trend__legend-swatch--budget" />
            예산
          </span>
          <span className="budget-trend__legend-item">
            <span className="budget-trend__legend-swatch budget-trend__legend-swatch--spent" />
            지출 (예산 이내)
          </span>
          <span className="budget-trend__legend-item">
            <span className="budget-trend__legend-swatch budget-trend__legend-swatch--over" />
            지출 (예산 초과)
          </span>
        </div>
        <div className="budget-trend__period">
          <Select options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        </div>
      </div>

      <div className="budget-trend__plot">
        <div className="budget-trend__axis">
          {TICKS.map((t) => (
            <span key={t} className="budget-trend__axis-label">
              {formatCompact(Math.round(maxValue * t))}
            </span>
          ))}
        </div>

        <div className="budget-trend__plot-body">
          <div className="budget-trend__bars-row">
            <div className="budget-trend__gridlines">
              {TICKS.map((t) => (
                <div key={t} className="budget-trend__gridline" style={{ bottom: `${t * 100}%` }} />
              ))}
            </div>
            {months.map((m) => {
              const isOver = m.budget > 0 && m.spent > m.budget
              return (
                <div
                  key={m.yearMonth}
                  className="budget-trend__bars"
                  title={`예산 ${formatCurrency(m.budget)} · 지출 ${formatCurrency(m.spent)}`}
                >
                  <div
                    className="budget-trend__bar budget-trend__bar--budget"
                    style={{ height: `${(m.budget / maxValue) * 100}%` }}
                  />
                  <div
                    className={
                      isOver
                        ? 'budget-trend__bar budget-trend__bar--spent budget-trend__bar--over'
                        : 'budget-trend__bar budget-trend__bar--spent'
                    }
                    style={{ height: `${(m.spent / maxValue) * 100}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="budget-trend__labels-row">
            {months.map((m) => (
              <span key={m.yearMonth} className="budget-trend__label">
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetTrendChart
