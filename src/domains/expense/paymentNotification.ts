export interface ParsedPayment {
  amount: number
  merchant: string
  expenseDate: string // YYYY-MM-DD (알림을 받은 날)
}

const AMOUNT = /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)\s*원/
// 카드 승인 알림은 대개 "... 12,000원 일시불 10/28 13:45 스타벅스 누적 ..." 꼴이라 시각 뒤를 가맹점으로 본다
const AFTER_TIME = /\d{1,2}:\d{2}\s+(.+?)(?:\s+(?:누적|잔액|사용가능).*)?$/

/**
 * 결제 알림 문구에서 금액·가맹점을 뽑는다. 금액이 없으면 null.
 * ponytail: 카드사별 문구 차이는 휴리스틱으로만 처리 — 가맹점이 틀리면 확인 단계에서 사용자가 고친다.
 */
export function parsePayment(title: string, text: string, postedAt: number): ParsedPayment | null {
  const content = `${title} ${text}`.replace(/\s+/g, ' ').trim()
  const amountMatch = content.match(AMOUNT)
  if (!amountMatch) return null

  const merchant = text.replace(/\s+/g, ' ').trim().match(AFTER_TIME)?.[1] ?? title
  const d = new Date(postedAt)
  return {
    amount: Number(amountMatch[1].replace(/,/g, '')),
    merchant: merchant.trim().slice(0, 30),
    expenseDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  }
}
