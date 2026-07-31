import { NavLink, Outlet } from 'react-router-dom'
import Logo from './Logo'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/', label: '대시보드', end: true },
  { to: '/expenses', label: '지출 내역', end: false },
  { to: '/budget', label: '예산 설정', end: false },
]

function Layout() {
  return (
    <div className="app-layout">
      <header className="app-nav">
        <div className="app-nav__inner">
          <NavLink to="/" className="app-nav__logo" aria-label="FitBudget">
            <Logo />
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
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
