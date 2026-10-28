// 네이버 로그인 복귀 링크(fitbudget://naver-login?...)는 login.tsx의 openAuthSessionAsync가 받는다.
// 라우터까지 처리하면 없는 경로라 Unmatched Route가 뜨므로 여기서 무시한다.
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  return path.includes('naver-login') ? null : path
}
