import { useMemo, useState } from 'react'
import { BudgetForm, BudgetList, useBudgets } from '../domains/budget'
import Select from '../shared/components/Select'
import './BudgetSettingPage.css'

function getCurrentYear(): string {
  return String(new Date().getFullYear())
}

function BudgetSettingPage() {
  const { budgets, isLoading, saveBudget } = useBudgets()
  const [year, setYear] = useState(getCurrentYear())

  const yearOptions = useMemo(() => {
    const years = new Set(budgets.map((b) => b.yearMonth.slice(0, 4)))
    years.add(getCurrentYear())
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
          <BudgetList budgets={filteredBudgets} />
        )}
      </div>

      <aside className="budget-page__form-panel">
        <BudgetForm budgets={budgets} onSubmit={saveBudget} />
      </aside>
    </div>
  )
}

export default BudgetSettingPage
