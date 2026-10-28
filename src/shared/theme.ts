// 디자인 방향: 플랫 + 큰 숫자(Cash App) + Material 3 동작. 강조색은 하나만 쓴다.
export const colors = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  ink: '#111111',
  subtle: '#6B6B6B',
  line: '#E6E6E6',
  accent: '#0F9D68', // 웹 시절부터 쓰던 저축 그린
  danger: '#D32F2F',
}

// 화면 하단에서 gap만큼 띄운 플로팅 탭 바. 탭 화면은 스크롤 끝 내용이 가려지지 않게 space만큼 하단 여백을 둔다.
export const tabBar = { height: 64, gap: 12, space: 64 + 12 + 16 }
