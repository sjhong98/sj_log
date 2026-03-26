# Common / Infra

## Entry map
- **DB/ORM**: Drizzle ORM + Postgres(Supabase) 스키마 기반
- **Supabase**
  - Auth: `@supabase/supabase-js`를 서버 액션에서 직접 사용 (`auth.getUser(token)`)
  - Images: Next image domain에 Supabase 스토리지 도메인 허용 (`next.config.ts`)
- **Server Actions**
  - Next server actions 사용 (`'use server'`)
  - `next.config.ts`에서 `serverActions.bodySizeLimit = '10mb'` (base64 업로드 등 대비)

## Domain map
- **Supabase/Drizzle**
  - `supabase/schema.ts`: Drizzle 테이블 정의 (여러 도메인에서 공통 사용)
  - `supabase/index`(예: `import db from '@/supabase'`): Drizzle client
  - `scripts/createTypesFromSchema.ts` + `db:pull` 스크립트로 스키마/타입 동기화 흔적
- **Types**
  - `types/schemaType`: DB 타입(예: `devLogType`, `nameType`)로 보이며 액션/컴포넌트에서 광범위 사용
  - `types/dev/*`: Dev 도메인 전용 타입 (예: `BoardType`)
- **UI kit**
  - `components/ui/*`: 공용 UI 컴포넌트
  - `components/layouts/*`: `Header`, `AuthMainSidebar`, `DashboardContainer`
  - `components/flexBox/*`: `Row`, `Column` 래퍼
- **Utils**
  - `utils/*`: 문자열 변환 등 공용 유틸 (예: `snakeToCamel.ts`)

## Flow 설명
- **서버 데이터 접근 기본형**
  - server action → `getUser()`로 uid 확보 → `db.select/insert/update` + `where(eq(table.uid, user.id))`
- **클라이언트 네비게이션 기본형**
  - 로그인 성공 시 `sessionStorage.userId(email)` 저장
  - 도메인 인덱스 페이지가 이를 읽어 `/domain/:email`로 push (리다이렉트 shell)
- **캐시 무효화**
  - Dev 도메인은 `revalidateTag('dev-log')`, `revalidateTag('dev-log-group')` 기반으로 갱신

