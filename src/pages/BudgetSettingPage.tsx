import { useEffect, useMemo, useRef, useState } from 'react'
import { BudgetForm, BudgetList, useBudgets } from '../domains/budget'
import { useClosedMonths } from '../domains/expense'
import { RecurringExpenseForm, RecurringExpenseList, useRecurringExpenses } from '../domains/recurringExpense'
import { useLedger } from '../app/providers/LedgerProvider'
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
  const { ledgerId, ledgers, isLoading: isLedgerLoading } = useLedger()
  if (!ledgerId) {
    return (
      <p className="budget-page__empty">
        {isLedgerLoading || ledgers.length > 0
          ? '불러오는 중...'
          : "가계부를 먼저 만들어주세요 (상단 '가계부 변경')"}
      </p>
    )
  }
  return <BudgetSettingPageContent ledgerId={ledgerId} />
}

function BudgetSettingPageContent({ ledgerId }: { ledgerId: string }) {
  const { budgets, isLoading, saveBudget } = useBudgets(ledgerId)
  const { isClosed } = useClosedMonths(ledgerId)
  const {
    recurringExpenses,
    isLoading: isRecurringLoading,
    addRecurringExpense,
    deleteRecurringExpense,
  } = useRecurringExpenses(ledgerId)
  const [year, setYear] = useState(getCurrentYear())
  const [openYearMonth, setOpenYearMonth] = useState<string | null>(null)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetFormYearMonth, setBudgetFormYearMonth] = useState(getCurrentYearMonth())
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
            onEditingChange={setIsEditingBudget}
          />
        )}
      </div>

      <aside className="budget-page__form-panel">
        <BudgetForm
          budgets={budgets}
          onSubmit={saveBudget}
          onYearMonthChange={setBudgetFormYearMonth}
          disabled={isEditingBudget}
        />
      </aside>

      <div className="budget-page__recurring">
        <p className="budget-page__label">고정 지출</p>
        <div className="budget-page__recurring-layout">
          {isRecurringLoading ? (
            <p className="budget-page__empty">불러오는 중...</p>
          ) : (
            <RecurringExpenseList
              recurringExpenses={recurringExpenses}
              onDelete={deleteRecurringExpense}
            />
          )}
          <RecurringExpenseForm
            onSubmit={addRecurringExpense}
            targetYearMonth={budgetFormYearMonth}
          />
        </div>
      </div>
    </div>
  )
}

export default BudgetSettingPage
