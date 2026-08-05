import type { WheelEvent } from 'react'
import './WheelPicker.css'

interface WheelPickerProps {
  value: number
  options: number[]
  onChange: (value: number) => void
  formatLabel: (value: number) => string
  wrap?: boolean
}

function WheelPicker({ value, options, onChange, formatLabel, wrap = false }: WheelPickerProps) {
  const index = options.indexOf(value)
  const prevValue = index > 0 ? options[index - 1] : wrap ? options[options.length - 1] : null
  const nextValue = index < options.length - 1 ? options[index + 1] : wrap ? options[0] : null

  function step(direction: 1 | -1) {
    const target = direction === -1 ? prevValue : nextValue
    if (target !== null) onChange(target)
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault()
    step(e.deltaY > 0 ? 1 : -1)
  }

  return (
    <div className="wheel-picker">
      <button
        type="button"
        className="wheel-picker__button"
        onClick={() => step(-1)}
        disabled={prevValue === null}
        aria-label="이전 값"
      >
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
          <path
            d="M5 12.5 10 7.5 15 12.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="wheel-picker__reel" onWheel={handleWheel}>
        <span className="wheel-picker__item wheel-picker__item--edge">
          {prevValue !== null ? formatLabel(prevValue) : ''}
        </span>
        <span key={value} className="wheel-picker__item wheel-picker__item--current">
          {formatLabel(value)}
        </span>
        <span className="wheel-picker__item wheel-picker__item--edge">
          {nextValue !== null ? formatLabel(nextValue) : ''}
        </span>
      </div>

      <button
        type="button"
        className="wheel-picker__button"
        onClick={() => step(1)}
        disabled={nextValue === null}
        aria-label="다음 값"
      >
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none">
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

export default WheelPicker
