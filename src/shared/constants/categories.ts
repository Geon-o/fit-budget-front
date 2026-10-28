export const EXPENSE_CATEGORIES = [
  '식비',
  '교통',
  '주거/통신',
  '문화/여가',
  '쇼핑',
  '건강/의료',
  '공과금',
  '기타',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

interface CategoryStyle {
  icon: string
  color: string
  bg: string
}

const CATEGORY_STYLE: Record<ExpenseCategory, CategoryStyle> = {
  '식비': { icon: '🍚', color: '#E8863C', bg: '#FDF0E4' },
  '교통': { icon: '🚌', color: '#3D7BD9', bg: '#E9F0FC' },
  '주거/통신': { icon: '🏠', color: '#6C63D9', bg: '#EDECFB' },
  '문화/여가': { icon: '🎬', color: '#D65FA0', bg: '#FBEAF3' },
  '쇼핑': { icon: '🛍️', color: '#C99A2E', bg: '#FBF3DF' },
  '건강/의료': { icon: '💊', color: '#2FA37A', bg: '#E5F6EF' },
  '공과금': { icon: '💡', color: '#4A9CC7', bg: '#E6F3FA' },
  '기타': { icon: '⭐', color: '#8B95A1', bg: '#EEF1F4' },
}

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLE[category as ExpenseCategory] ?? CATEGORY_STYLE['기타']
}
