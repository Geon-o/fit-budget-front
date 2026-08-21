import { getLoginUrl } from '../domains/auth'
import './LoginPage.css'

const FEATURES = [
  '오늘 얼마까지 써도 되는지 매일 자동으로 계산해요',
  '목표 저축액을 지키면서 남은 예산을 관리해요',
  '가족이나 동거인과 하나의 가계부를 함께 봐요',
]

const PREVIEW_DAYS = [
  { day: 18, limit: '75,000' },
  { day: 19, limit: '77,777' },
  { day: 20, limit: '80,769' },
  { day: 21, limit: '84,000', spent: '42,000', today: true },
  { day: 22, limit: '87,500' },
  { day: 23, limit: '91,304' },
  { day: 24, limit: '95,454' },
]

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-page__content">
        <div className="login-page__left">
          <p className="login-page__logo">fit-budget</p>
          <h1 className="login-page__headline">
            이번 달, 오늘 얼마 써도 되는지
            <br />
            매번 계산기 두드리지 마세요
          </h1>
          <p className="login-page__lead">
            예산과 목표 저축액만 정해두면 하루 사용 가능 금액을 자동으로 알려드려요.
          </p>

          <ul className="login-page__features">
            {FEATURES.map((text) => (
              <li key={text} className="login-page__feature">
                <span className="login-page__feature-dot" />
                {text}
              </li>
            ))}
          </ul>

          <div className="login-page__buttons">
            <a className="login-page__button login-page__button--google" href={getLoginUrl('google')}>
              <svg className="login-page__icon" viewBox="0 0 20 20" width="18" height="18">
                <path
                  fill="#4285F4"
                  d="M19.6 10.23c0-.68-.06-1.32-.17-1.95H10v3.68h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.33 2.99-7.25Z"
                />
                <path
                  fill="#34A853"
                  d="M10 20c2.7 0 4.96-.9 6.61-2.42l-3.23-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H1.08v2.59A10 10 0 0 0 10 20Z"
                />
                <path
                  fill="#FBBC05"
                  d="M4.41 11.92a6 6 0 0 1 0-3.84V5.49H1.08a10 10 0 0 0 0 9.02l3.33-2.59Z"
                />
                <path
                  fill="#EA4335"
                  d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.96 9.96 0 0 0 10 0 10 10 0 0 0 1.08 5.49l3.33 2.59C5.2 5.72 7.4 3.96 10 3.96Z"
                />
              </svg>
              구글로 로그인
            </a>
            <a className="login-page__button login-page__button--naver" href={getLoginUrl('naver')}>
              <svg className="login-page__icon" viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path
                  d="M11.6 10.5 8.1 5.4H5.4v9.2h2.9v-5.1l3.5 5.1h2.7V5.4h-2.9v5.1Z"
                  fill="currentColor"
                />
              </svg>
              네이버로 로그인
            </a>
          </div>
        </div>

        <div className="login-page__right">
          <div className="login-page__glow" />
          <div className="login-page__preview">
            <div className="login-page__preview-bar">
              <span className="login-page__preview-dot" />
              <span className="login-page__preview-dot" />
              <span className="login-page__preview-dot" />
            </div>
            <div className="login-page__preview-body">
              <div className="login-page__preview-stats">
                <div className="login-page__preview-stat">
                  <span className="login-page__preview-stat-label">오늘 한도</span>
                  <span className="login-page__preview-stat-value login-page__preview-stat-value--accent">
                    84,000원
                  </span>
                </div>
                <div className="login-page__preview-stat">
                  <span className="login-page__preview-stat-label">잔여 예산</span>
                  <span className="login-page__preview-stat-value">2,300,000원</span>
                </div>
              </div>
              <div className="login-page__preview-week">
                {PREVIEW_DAYS.map((d) => (
                  <div
                    key={d.day}
                    className={
                      d.today
                        ? 'login-page__preview-cell login-page__preview-cell--today'
                        : 'login-page__preview-cell'
                    }
                  >
                    <span className="login-page__preview-day">{d.day}</span>
                    {d.spent && <span className="login-page__preview-spent">{d.spent}</span>}
                    <span className="login-page__preview-limit">{d.limit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
