# sj_log 구조 요약 (빠른 진입용)

이 문서는 “어디를 보면 되는지”만 빠르게 찾기 위한 최소 요약입니다. 세부 도메인 흐름은 아래 도메인 문서를 참고하세요.

## Entry map
- **Framework**: Next.js App Router (`next@15.x`)
- **Root entry**
  - `app/layout.tsx`: 전역 폰트/`Providers`/`ToastContainer`
  - `app/page.tsx`: 최초 진입 시 `/login`으로 push (클라이언트)
- **Route groups**
  - `app/(guest)/*`: 게스트 영역 (로그인)
  - `app/(private)/*`: 인증 이후 영역 (사이드바/헤더 포함)
- **Private shell**
  - `app/(private)/layout.tsx`: `getUser()`로 사용자 조회 후 `Header`/`AuthMainSidebarWrapper`로 감싼 레이아웃

## Domain map (상위 도메인)
- **Auth / Session**: `actions/session/*`, `app/(guest)/login/*`, `app/(private)/logout/*`
- **Dev Log**: `app/(private)/dev/*`, `actions/dev/*`, `components/dev/*`
- **Diary**: `app/(private)/diary/*`, `actions/diary/*`, `components/diary/*`
- **Finance**: `app/(private)/finance/*`, `actions/finance/*`, `components/finance/*`
- **Names (연락처/인물?)**: `app/(private)/names/*`, `actions/names/*`
- **Investment**: `app/(private)/investment/*` (현재는 placeholder 성격)
- **Shared/Infra**: `supabase/*`, `utils/*`, `types/*`, `components/ui/*`

## Flow (프로젝트 공통 패턴)
- **인증 상태**
  - 서버 측: `cookies().get('logToken')` 기반으로 `actions/session/getUser.ts`가 Supabase `auth.getUser(token)` 호출
  - 클라이언트 측: 로그인 성공 시 `sessionStorage.userId`에 email 저장 후 각 도메인에서 `/dev/:email`, `/diary/:email` 등으로 이동
- **데이터 접근**
  - 서버 액션(`'use server'`)에서 `getUser()`로 uid 확보 → Drizzle ORM + `supabase/schema` 테이블로 조회/수정
- **캐시/리프레시**
  - Dev 관련 액션에서 `revalidateTag('dev-log')`, `revalidateTag('dev-log-group')` 사용 (UI 갱신 트리거)

## 도메인 문서 바로가기
- `auth-session.md`
- `dev.md`
- `diary.md`
- `finance.md`
- `names.md`
- `investment.md`
- `common-infra.md`

