# Auth / Session

## Entry map
- **Login page**: `app/(guest)/login/page.tsx`
  - `actions/session/signIn` 호출
  - 성공 시 `sessionStorage.userId = email` 저장 후 `/dev/:email`로 이동
- **Private layout gate**: `app/(private)/layout.tsx`
  - 서버에서 `getUser()` 호출하여 `Header`에 주입

## Domain map
- **Server actions**
  - `actions/session/getUser.ts`: 쿠키 `logToken` → Supabase `auth.getUser(accessToken)`
  - `actions/session/checkSession.ts`: `getUser` 유효성 체크 + 실패 시 `refreshSession()` 시도
  - `actions/session/signIn.ts`, `signOut.ts`, `refreshSession.ts`: 로그인/세션 갱신 축 (세부 구현은 해당 파일 참조)
- **State storage**
  - 서버: `cookies()`의 `logToken`
  - 클라이언트: `sessionStorage.userId` (email)

## Flow 설명
- **로그인**
  - `app/(guest)/login/page.tsx`에서 `signIn({ email, password })`
  - 성공: toast → `sessionStorage.userId` 저장 → `router.push(/dev/${user.email})`
  - 실패: toast + 버튼 상태 원복
- **인증 사용자 조회(서버)**
  - `getUser()`가 `cookies().get('logToken')`를 읽어 Supabase에서 사용자 조회
  - 쿠키 없거나 오류면 `undefined/null` 반환 → 페이지/레이아웃에서 “로그인 필요” 처리 가능
- **세션 검사/갱신**
  - `checkSession()`에서 Supabase 조회 실패 시 `refreshSession()` 호출 → 새 토큰으로 재조회

