import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { AiWidget } from '../domains/ai'
import { logout, useAuth } from '../domains/auth'
import './Layout.css'

const NAV_ITEMS = [
  { to: '/dashboard', label: '대시보드', end: true },
  { to: '/expenses', label: '지출 내역', end: false },
  { to: '/budget', label: '예산 설정', end: false },
]

function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isLedgerListPage = pathname === '/ledgers'
  const { user, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (isLoading) return null
  if (!user) return <Navigate to="/" replace />

  return (
    <div className="app-layout">
      <header className="app-nav">
        <div className="app-nav__inner">
          <NavLink to="/dashboard" className="app-nav__logo" aria-label="FitBudget">
            <Logo />
          </NavLink>
          {!isLedgerListPage && (
            <nav className="app-nav__center">
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
              <span className="app-nav__center-divider" />
              <NavLink to="/ledgers" className="app-nav__ledger-button">
                가계부 변경
              </NavLink>
            </nav>
          )}
          <div className="app-nav__account">
            <span className="app-nav__avatar">{user.nickname.charAt(0)}</span>
            <span className="app-nav__nickname">{user.nickname}</span>
            <span className="app-nav__divider" />
            <button type="button" className="app-nav__logout" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
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
