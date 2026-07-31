import { useEffect, useRef, useState } from 'react'
import './Select.css'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
}

function Select({ options, value, onChange }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleOutsideEvent(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent) {
        if (e.key === 'Escape') setIsOpen(false)
        return
      }
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideEvent)
    document.addEventListener('keydown', handleOutsideEvent)
    return () => {
      document.removeEventListener('mousedown', handleOutsideEvent)
      document.removeEventListener('keydown', handleOutsideEvent)
    }
  }, [isOpen])

  const selected = options.find((o) => o.value === value)

  return (
    <div className="select" ref={containerRef}>
      <button
        type="button"
        className="select__trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selected?.label ?? ''}</span>
        <span className={isOpen ? 'select__chevron is-open' : 'select__chevron'}>▾</span>
      </button>

      {isOpen && (
        <ul className="select__panel" role="listbox">
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                className={
                  option.value === value ? 'select__option is-selected' : 'select__option'
                }
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Select
