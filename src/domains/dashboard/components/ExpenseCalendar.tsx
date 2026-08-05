import { useMemo } from 'react'
import type { Expense } from '../../expense'
import './ExpenseCalendar.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

interface ExpenseCalendarProps {
  yearMonth: string
  expenses: Expense[]
  monthlyBudget: number
  savingGoal: number
  paceMessage?: string | null
  paceIsWarning?: boolean
}

function ExpenseCalendar({
  yearMonth,
  expenses,
  monthlyBudget,
  savingGoal,
  paceMessage,
  paceIsWarning,
}: ExpenseCalendarProps) {
  const [year, month] = yearMonth.split('-').map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()

  const spentByDay = useMemo(() => {
    const map = new Map<number, number>()
    for (const expense of expenses) {
      const day = Number(expense.expenseDate.slice(8, 10))
      map.set(day, (map.get(day) ?? 0) + expense.amount)
    }
    return map
  }, [expenses])

  // 남은 지출 가능액을 남은 일수로 나눠 하루 권장액을 구하고, 그날 실제 지출을 반영해
  // 다음 날의 권장액을 다시 계산한다. 안 쓴 날의 여유분은 다음 날로 이월된다.
  // ponytail: 이월분이 말일 한두 날에 몰리면 숫자가 비정상적으로 튀어 보여서,
  // 표시용으로만 기준선(균등 분배액)의 3배로 상한을 둔다. 실제 잔여 예산은 SummaryCards에서 정확히 보여줌.
  const recommendedByDay = useMemo(() => {
    const spendable = monthlyBudget - savingGoal
    const baseline = spendable / daysInMonth
    const cap = baseline * 3
    const result: (number | null)[] = []
    let remainingSpendable = spendable
    let remainingDays = daysInMonth

    for (let day = 1; day <= daysInMonth; day++) {
      const raw = remainingSpendable / remainingDays
      result.push(monthlyBudget > 0 ? Math.floor(Math.min(raw, cap)) : null)
      remainingSpendable -= spentByDay.get(day) ?? 0
      remainingDays -= 1
    }

    return result
  }, [spentByDay, monthlyBudget, savingGoal, daysInMonth])

  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="expense-calendar">
      {monthlyBudget > 0 && (
        <div className="expense-calendar__legend">
          <span className="expense-calendar__legend-item">
            <span className="expense-calendar__legend-dot expense-calendar__legend-dot--ok" />
            예산 이내
          </span>
          <span className="expense-calendar__legend-item">
            <span className="expense-calendar__legend-dot expense-calendar__legend-dot--over" />
            예산 초과
          </span>
          {paceMessage && (
            <span
              className={
                paceIsWarning
                  ? 'expense-calendar__pace expense-calendar__pace--warning'
                  : 'expense-calendar__pace expense-calendar__pace--ok'
              }
            >
              {paceMessage}
            </span>
          )}
        </div>
      )}
      <div className="expense-calendar__weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day} className="expense-calendar__weekday">
            {day}
          </span>
        ))}
      </div>
      <div className="expense-calendar__grid">
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`} className="expense-calendar__cell expense-calendar__cell--empty" />
            )
          }

          const spent = spentByDay.get(day) ?? 0
          const recommended = recommendedByDay[day - 1]
          const isToday = isCurrentMonth && today.getDate() === day
          const isOverBudget = recommended !== null && spent > recommended

          const cellClasses = ['expense-calendar__cell']
          if (isToday) cellClasses.push('expense-calendar__cell--today')
          if (spent > 0) cellClasses.push(isOverBudget ? 'expense-calendar__cell--over' : 'expense-calendar__cell--ok')

          return (
            <div key={day} className={cellClasses.join(' ')}>
              <span className="expense-calendar__top-left">
                <span className="expense-calendar__day">{day}</span>
                {spent > 0 && (
                  <span
                    className={
                      isOverBudget
                        ? 'expense-calendar__spent expense-calendar__spent--over'
                        : 'expense-calendar__spent expense-calendar__spent--ok'
                    }
                  >
                    {spent.toLocaleString('ko-KR')}
                  </span>
                )}
              </span>
              {recommended !== null && (
                <span className="expense-calendar__budget">한도 {recommended.toLocaleString('ko-KR')}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExpenseCalendar
