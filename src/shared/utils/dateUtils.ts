export function toYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7) // YYYY-MM
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`
}
