import { useState } from 'react'
import type { FormEvent } from 'react'
import { askAi } from '../api/aiApi'
import './AiWidget.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function AiWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    setIsLoading(true)

    try {
      const answer = await askAi(question)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'AI 응답을 받지 못했어요. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className={isOpen ? 'ai-widget__toggle' : 'ai-widget__toggle ai-widget__toggle--pulse'}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="AI에게 물어보기"
      >
        {isOpen ? (
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <path
              d="M5 5 15 15M15 5 5 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
            <path
              d="M4 15V6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5v5A1.5 1.5 0 0 1 14.5 13H8l-4 4Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="ai-widget__panel">
          <div className="ai-widget__messages">
            {messages.length === 0 && (
              <p className="ai-widget__empty">
                예: "이번 달 지출 줄이려면 뭘 줄이는 게 좋을까?"
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === 'user'
                    ? 'ai-widget__bubble ai-widget__bubble--user'
                    : 'ai-widget__bubble ai-widget__bubble--assistant'
                }
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="ai-widget__bubble ai-widget__bubble--assistant">
                생각 중...
              </div>
            )}
          </div>

          <form className="ai-widget__input-row" onSubmit={handleSubmit}>
            <input
              className="ai-widget__input"
              type="text"
              placeholder="무엇이든 물어보세요"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="ai-widget__send" type="submit" disabled={isLoading}>
              전송
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default AiWidget
