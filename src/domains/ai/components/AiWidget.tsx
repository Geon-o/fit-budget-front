import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { askAi } from '../api/aiApi'
import './AiWidget.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const MAX_QUESTION_LENGTH = 500
const COUNTER_THRESHOLD = 400

function AiWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isOverLimit = input.length > MAX_QUESTION_LENGTH

  const submitQuestion = async () => {
    const question = input.trim()
    if (!question || isLoading || isOverLimit) return

    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submitQuestion()
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submitQuestion()
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

          <form
            className={isOverLimit ? 'ai-widget__composer ai-widget__composer--over-limit' : 'ai-widget__composer'}
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              className="ai-widget__composer-input"
              placeholder="무엇이든 물어보세요"
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="ai-widget__composer-footer">
              <span className={isOverLimit ? 'ai-widget__counter ai-widget__counter--over' : 'ai-widget__counter'}>
                {isOverLimit
                  ? `${MAX_QUESTION_LENGTH}자를 넘었어요`
                  : input.length > COUNTER_THRESHOLD
                    ? `${input.length}/${MAX_QUESTION_LENGTH}`
                    : ''}
              </span>
              <button
                className="ai-widget__send"
                type="submit"
                disabled={isLoading || isOverLimit}
                aria-label="전송"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                  <path
                    d="M10 15V5M10 5 5 10M10 5l5 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default AiWidget
