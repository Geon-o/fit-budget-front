import { useState } from 'react'
import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLedger } from '../app/providers/LedgerProvider'
import './LedgerListPage.css'

const ACCENT_COLORS = ['#d99b6c', '#6c9bd9', '#8fb96c', '#b06cd9', '#d96c8f', '#6cc2c2']

function getAccentColor(index: number): string {
  return ACCENT_COLORS[index % ACCENT_COLORS.length]
}

function LedgerListPage() {
  const { ledgerId, ledgers, setLedgerId, addLedger, renameLedger, setLedgerColor, deleteLedger } = useLedger()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [colorPickerId, setColorPickerId] = useState<string | null>(null)

  const selectLedger = (id: string) => {
    if (editingId) return
    setLedgerId(id)
    navigate('/')
  }

  const submitNewLedger = async () => {
    const name = newName.trim()
    if (!name) return
    await addLedger(name)
    setNewName('')
    setIsAdding(false)
  }

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitNewLedger()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewName('')
    }
  }

  const startEdit = (e: MouseEvent, id: string, currentName: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditName(currentName)
  }

  const submitEdit = async () => {
    const name = editName.trim()
    if (!name || !editingId) {
      setEditingId(null)
      return
    }
    await renameLedger(editingId, name)
    setEditingId(null)
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      submitEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const cancelEdit = (e: MouseEvent) => {
    e.stopPropagation()
    setEditingId(null)
  }

  const handleDelete = (e: MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (window.confirm(`'${name}' 가계부를 삭제할까요? 안의 지출/예산/고정지출 기록이 모두 함께 삭제돼요.`)) {
      deleteLedger(id)
    }
  }

  const toggleColorPicker = (e: MouseEvent, id: string) => {
    e.stopPropagation()
    setColorPickerId((prev) => (prev === id ? null : id))
  }

  const pickColor = async (e: MouseEvent, id: string, color: string) => {
    e.stopPropagation()
    await setLedgerColor(id, color)
    setColorPickerId(null)
  }

  return (
    <div className="ledger-list-page">
      <p className="ledger-list-page__title">가계부 변경</p>

      <div className="ledger-list-page__grid">
        {ledgers.map((ledger, index) => {
          const accent = ledger.color ?? getAccentColor(index)
          const isEditing = editingId === ledger.id
          const isPickingColor = colorPickerId === ledger.id
          return (
            <div
              key={ledger.id}
              role="button"
              tabIndex={0}
              style={{ '--ledger-accent': accent } as CSSProperties}
              className={
                ledger.id === ledgerId
                  ? 'ledger-list-page__card ledger-list-page__card--active'
                  : 'ledger-list-page__card'
              }
              onClick={() => selectLedger(ledger.id)}
            >
              {ledger.id === ledgerId && <span className="ledger-list-page__badge">사용 중</span>}

              {!isEditing && (
                <div className="ledger-list-page__card-actions">
                  <button
                    type="button"
                    className="ledger-list-page__icon-button"
                    aria-label="이름 수정"
                    onClick={(e) => startEdit(e, ledger.id, ledger.name)}
                  >
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                      <path
                        d="M13.5 3.5 16.5 6.5 7 16H4V13L13.5 3.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ledger-list-page__icon-button"
                    aria-label="가계부 설정"
                    onClick={(e) => toggleColorPicker(e, ledger.id)}
                  >
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                      <path
                        d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M16 10c0 .34-.03.66-.08.98l1.36 1.06-1.34 2.32-1.6-.54c-.5.44-1.08.78-1.72.99l-.26 1.65H8.64l-.26-1.65a5.3 5.3 0 0 1-1.72-.99l-1.6.54-1.34-2.32L5.08 11a4.7 4.7 0 0 1 0-1.96L3.72 7.98l1.34-2.32 1.6.54c.5-.44 1.08-.78 1.72-.99L8.64 3.5h2.72l.26 1.65c.64.21 1.22.55 1.72.99l1.6-.54 1.34 2.32-1.36 1.06c.05.32.08.64.08.98Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ledger-list-page__icon-button ledger-list-page__icon-button--danger"
                    aria-label="가계부 삭제"
                    onClick={(e) => handleDelete(e, ledger.id, ledger.name)}
                  >
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                      <path
                        d="M4 6h12M8 6V4.5A1.5 1.5 0 0 1 9.5 3h1A1.5 1.5 0 0 1 12 4.5V6M5.5 6 6 16.5A1.5 1.5 0 0 0 7.5 18h5a1.5 1.5 0 0 0 1.5-1.5L14.5 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {isPickingColor && (
                <div
                  className="ledger-list-page__color-picker"
                  onClick={(e) => {
                    e.stopPropagation()
                    setColorPickerId(null)
                  }}
                >
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="ledger-list-page__color-swatch"
                      style={{ background: color }}
                      aria-label={color}
                      onClick={(e) => pickColor(e, ledger.id, color)}
                    />
                  ))}
                </div>
              )}

              <span className="ledger-list-page__monogram">{ledger.name.charAt(0)}</span>

              {isEditing ? (
                <div className="ledger-list-page__edit-row" onClick={(e) => e.stopPropagation()}>
                  <input
                    className="ledger-list-page__name-input"
                    autoFocus
                    maxLength={10}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                  />
                  <button
                    type="button"
                    className="ledger-list-page__edit-confirm"
                    aria-label="수정 반영"
                    onClick={submitEdit}
                  >
                    <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
                      <path
                        d="M4 10.5 8 14.5 16 5.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ledger-list-page__edit-cancel"
                    aria-label="수정 취소"
                    onClick={cancelEdit}
                  >
                    <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
                      <path
                        d="M5 5 15 15M15 5 5 15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <span className="ledger-list-page__card-name">{ledger.name}</span>
              )}
            </div>
          )
        })}

        {isAdding ? (
          <input
            className="ledger-list-page__card ledger-list-page__card-input"
            autoFocus
            maxLength={10}
            value={newName}
            placeholder="새 가계부 이름"
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleAddKeyDown}
            onBlur={() => {
              if (!newName.trim()) setIsAdding(false)
            }}
          />
        ) : (
          <button
            type="button"
            className="ledger-list-page__card ledger-list-page__card--add"
            onClick={() => setIsAdding(true)}
          >
            + 새 가계부
          </button>
        )}
      </div>
    </div>
  )
}

export default LedgerListPage
