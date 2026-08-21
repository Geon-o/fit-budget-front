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

  // 하루 기준선(균등 분배액)은 고정. 실제 지난 날짜는 기준선보다 더 썼으면 다음 날 한도가 줄고,
  // 덜 썼으면 다음 날 한도가 (기준선 + 남은 이월분)만큼 늘어난다.
  // 아직 지나지 않은 미래 날짜는 실제로 안 쓸지 알 수 없으므로 이월을 미리 가정하지 않고,
  // 오늘 시점까지 반영된 한도를 그대로 고정해서 보여준다.
  const recommendedByDay = useMemo(() => {
    const spendable = monthlyBudget - savingGoal
    const baseline = spendable / daysInMonth
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    const result: (number | null)[] = []
    let carry = 0
    let frozenRaw: number | null = null

    for (let day = 1; day <= daysInMonth; day++) {
      const isFuture = new Date(year, month - 1, day) > todayDate
      let raw: number
      if (isFuture) {
        frozenRaw ??= baseline + carry
        raw = frozenRaw
      } else {
        raw = baseline + carry
        carry = raw - (spentByDay.get(day) ?? 0)
      }

      result.push(monthlyBudget > 0 ? Math.floor(Math.max(raw, 0)) : null)
    }

    return result
  }, [spentByDay, monthlyBudget, savingGoal, daysInMonth, year, month])

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
