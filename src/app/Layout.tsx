import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { AiWidget } from '../domains/ai'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/', label: '대시보드', end: true },
  { to: '/expenses', label: '지출 내역', end: false },
  { to: '/budget', label: '예산 설정', end: false },
]

function Layout() {
  const { pathname } = useLocation()
  const isLedgerListPage = pathname === '/ledgers'

  return (
    <div className="app-layout">
      <header className="app-nav">
        <div className="app-nav__inner">
          <NavLink to="/" className="app-nav__logo" aria-label="FitBudget">
            <Logo />
          </NavLink>
          {!isLedgerListPage && (
            <>
              <NavLink to="/ledgers" className="app-nav__ledger-button">
                가계부 변경
              </NavLink>
              <nav className="app-nav__links">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <AiWidget />
    </div>
  )
}

export default Layout
