import { createBrowserRouter } from 'react-router-dom'
import DashboardPage from '../pages/DashboardPage'
import ExpensePage from '../pages/ExpensePage'
import BudgetSettingPage from '../pages/BudgetSettingPage'

export const router = createBrowserRouter([
  { path: '/', element: <DashboardPage /> },
  { path: '/expenses', element: <ExpensePage /> },
  { path: '/budget', element: <BudgetSettingPage /> },
])
