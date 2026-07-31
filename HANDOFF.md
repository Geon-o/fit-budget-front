# FitBudget 프론트엔드 인수인계

## 스택
React 19 + Vite + TS, react-router-dom. 백엔드 없음 — 전부 mock API(도메인별 `api/*.ts`, 모듈 레벨 배열, `Promise.resolve` 흉내).

## 구조 (DDD, 도메인 기준)
```
src/
  app/            App.tsx, router.tsx, Layout.tsx(nav), Logo.tsx
  domains/
    expense/      api, components, hooks(useExpenses), types, index.ts
    budget/       api, components, hooks(useBudgets), types, index.ts
  pages/          DashboardPage(빈 껍데기), ExpensePage, BudgetSettingPage
  shared/         components(Select), hooks(useCountUp), utils(dateUtils), constants(categories)
  styles/         global.css (디자인 토큰)
```
도메인은 `index.ts`로만 외부에 공개, 서로 직접 import 금지. `pages`는 조합만.

## 디자인 테마
토스 카피 금지 — Linear(플랫 카드, 얇은 보더 `--border-card`, radius 8~12px, 각진 버튼) + Notion(그레이스케일 + 포인트 컬러 그린 `#0f9d68` 하나만) + Cash App(핵심 숫자는 크고 굵게, tabular-nums) 블렌드.
토큰은 `src/styles/global.css`. 그림자 쓰지 말고 보더 위주. 카테고리 아이콘도 파스텔 원형 대신 톤다운 사각 뱃지.

## 완성된 화면
- **지출 내역** (`/expenses`): 좌측 목록 + 우측 등록 폼, 상단에 월별 총 지출(카운트업 애니메이션, 재진입시에만 재생), 스크롤시 폼 밑에 미니 합계 페이드인
- **예산 설정** (`/budget`): 좌측 월별 아코디언 목록 + 우측 등록/수정 폼(대상 월 직접 선택, 기존 월 선택시 자동 프리필), 우측 상단 커스텀 연도 드롭다운(`shared/components/Select`, 네이티브 select 아님)
- **대시보드** (`/`): 미구현, placeholder만

## 안 한 것 / 다음에 할 것
- 백엔드 연동 전무 (Spring Boot 없음, 전부 mock)
- 일일 권장 사용액 계산 로직 (요구사항 핵심 기능, 아직 미구현)
- 대시보드 화면 전체
- AI 기능, 앱(RN), 오픈뱅킹/OCR 연동 — 명시적으로 스코프 제외

## 참고
전체 요구사항서는 대화 메모리(`project_requirements` 등)에 있음, 필요하면 물어볼 것.
