import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import DashboardPage from '../pages/DashboardPage'
import ExpensePage from '../pages/ExpensePage'
import BudgetSettingPage from '../pages/BudgetSettingPage'
import LedgerListPage from '../pages/LedgerListPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/expenses', element: <ExpensePage /> },
      { path: '/budget', element: <BudgetSettingPage /> },
      { path: '/ledgers', element: <LedgerListPage /> },
    ],
  },
])
