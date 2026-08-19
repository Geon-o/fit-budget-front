const API_BASE_URL = 'http://localhost:8089'

export async function askAi(question: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/ai/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) throw new Error('AI 응답을 받지 못했습니다')
  const data = await res.json()
  return data.answer
}
