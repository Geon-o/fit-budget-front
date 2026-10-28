// 결제 알림 파서 자체 검사: node scripts/check-payment-parser.mjs (Node 24 이상, .ts를 그대로 불러온다)
import assert from 'node:assert/strict'
import { parsePayment } from '../src/domains/expense/paymentNotification.ts'

const at = new Date(2026, 9, 28, 13, 45).getTime()

// 카드 승인: 시각 뒤가 가맹점, 누적 금액은 무시
assert.deepEqual(parsePayment('KB국민카드', '승인 홍*동 12,000원 일시불 10/28 13:45 스타벅스 누적 1,234,000원', at), {
  amount: 12000,
  merchant: '스타벅스',
  expenseDate: '2026-10-28',
})
// 시각이 없으면 제목을 가맹점으로
assert.deepEqual(parsePayment('토스', '9,900원 결제 완료', at), { amount: 9900, merchant: '토스', expenseDate: '2026-10-28' })
// 쉼표 없는 금액
assert.equal(parsePayment('신한카드', '승인 500원 10/28 13:45 편의점', at)?.amount, 500)
// 금액이 없으면 null
assert.equal(parsePayment('카톡', '결제 관련 문의드려요', at), null)

console.log('payment parser OK')
