function Logo() {
  return (
    <svg viewBox="0 0 380 120" width="152" height="48">
      <defs>
        <linearGradient id="calGradComb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="100%" stopColor="#1ABC9C" />
        </linearGradient>
      </defs>

      <g transform="translate(0, -10)">
        <g transform="translate(10, 10)">
          <rect x="15" y="20" width="80" height="78" rx="14" fill="url(#calGradComb)" />

          <circle cx="32" cy="16" r="3" fill="#334155" />
          <circle cx="48" cy="16" r="3" fill="#334155" />
          <circle cx="64" cy="16" r="3" fill="#334155" />
          <circle cx="80" cy="16" r="3" fill="#334155" />

          <rect x="30" y="11" width="4" height="7" rx="1.5" fill="#94A3B8" />
          <rect x="46" y="11" width="4" height="7" rx="1.5" fill="#94A3B8" />
          <rect x="62" y="11" width="4" height="7" rx="1.5" fill="#94A3B8" />
          <rect x="78" y="11" width="4" height="7" rx="1.5" fill="#94A3B8" />

          <path
            d="M 55 31 V 53 C 47 53 47 63 55 63 V 86 M 23 58 H 50 C 50 50 60 50 60 58 H 87"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M 70 42 L 74 46 L 82 38"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        <text
          x="112"
          y="98"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          fontWeight="900"
          fontSize="46"
          letterSpacing="-0.8"
        >
          <tspan fill="#0F172A">Fit</tspan>
          <tspan fill="#2ECC71">Budget</tspan>
        </text>
      </g>
    </svg>
  )
}

export default Logo
