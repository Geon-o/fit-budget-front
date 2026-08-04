import { useEffect, useMemo, useRef, useState } from 'react'
import { BudgetForm, BudgetList, useBudgets } from '../domains/budget'
import { useClosedMonths } from '../domains/expense'
import Select from '../shared/components/Select'
import './BudgetSettingPage.css'

function getCurrentYear(): string {
  return String(new Date().getFullYear())
}

function getCurrentYearMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function BudgetSettingPage() {
  const { budgets, isLoading, saveBudget } = useBudgets()
  const { isClosed } = useClosedMonths()
  const [year, setYear] = useState(getCurrentYear())
  const [openYearMonth, setOpenYearMonth] = useState<string | null>(null)
  const hasAutoOpened = useRef(false)

  useEffect(() => {
    if (hasAutoOpened.current || isLoading || budgets.length === 0) return
    hasAutoOpened.current = true

    const currentYearMonth = getCurrentYearMonth()
    const target =
      budgets.find((b) => b.yearMonth === currentYearMonth) ??
      [...budgets].sort((a, b) => b.yearMonth.localeCompare(a.yearMonth))[0]

    setYear(target.yearMonth.slice(0, 4))
    setOpenYearMonth(target.yearMonth)
  }, [isLoading, budgets])

  const yearOptions = useMemo(() => {
    const currentYear = Number(getCurrentYear())
    const years = new Set(budgets.map((b) => b.yearMonth.slice(0, 4)))
    for (let y = currentYear - 5; y <= currentYear + 5; y++) {
      years.add(String(y))
    }
    return [...years].sort((a, b) => b.localeCompare(a))
  }, [budgets])

  const filteredBudgets = useMemo(
    () => budgets.filter((b) => b.yearMonth.startsWith(year)),
    [budgets, year],
  )

  return (
    <div className="budget-page__layout">
      <div className="budget-page__header">
        <p className="budget-page__label">예산 설정</p>
        <Select
          options={yearOptions.map((y) => ({ value: y, label: `${y}년` }))}
          value={year}
          onChange={setYear}
        />
      </div>

      <div className="budget-page__main">
        {isLoading ? (
          <p className="budget-page__empty">불러오는 중...</p>
        ) : (
          <BudgetList
            budgets={filteredBudgets}
            onSave={saveBudget}
            openYearMonth={openYearMonth}
            onToggle={setOpenYearMonth}
            isClosed={isClosed}
          />
        )}
      </div>

      <aside className="budget-page__form-panel">
        <BudgetForm budgets={budgets} onSubmit={saveBudget} />
      </aside>
    </div>
  )
}

export default BudgetSettingPage
