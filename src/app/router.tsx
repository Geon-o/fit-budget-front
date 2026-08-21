import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import DashboardPage from '../pages/DashboardPage'
import ExpensePage from '../pages/ExpensePage'
import BudgetSettingPage from '../pages/BudgetSettingPage'
import LedgerListPage from '../pages/LedgerListPage'
import LoginPage from '../pages/LoginPage'

export const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  {
    element: <Layout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/expenses', element: <ExpensePage /> },
      { path: '/budget', element: <BudgetSettingPage /> },
      { path: '/ledgers', element: <LedgerListPage /> },
    ],
  },
])
