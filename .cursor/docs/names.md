# Names

## Entry map
- **Names index**: `app/(private)/names/page.tsx`
  - 클라이언트에서 `sessionStorage.userId`를 읽어 `/names/:email`로 push (리다이렉트용)
- **Names main**: `app/(private)/names/[email]/page.tsx`
  - 이름 목록/상세/태그/이미지 업로드/시크릿 모드(OTP)까지 포함한 단일 대시보드형 페이지
  - URL query string으로 선택 상태 유지: `?namePk=...`

## Domain map
- **UI (대부분 단일 페이지 내부)**
  - `app/(private)/names/[email]/page.tsx`
    - 목록: `getNameList({ filter })` 또는 `getNameListByPartialKeyword(keyword)`
    - 태그 검색: `getNameTagByPartialKeyword(keyword)`
    - 상세: `getNameDetail(namePk)`
    - 생성/수정/삭제: `createName`, `updateName`, `deleteName`
    - 태그 연결/해제: `nameTagging({ namePk, tagName })`, `nameUntagging({ namePk, tagPk })`
    - 태그 그룹 보기: `getNameListGroupByTags()`
    - 이미지 업로드: `uploadNameImage(namePk, base64)`
    - 시크릿 모드: 클라이언트 OTP 입력 후 로컬에서 토글(현재는 고정 코드 비교)
- **Server actions**
  - `actions/names/getNameList.ts`:
    - `getUser()`로 uid 확보 후 `supabase/schema`의 `name` 테이블에서 uid 기준 조회 + total count
  - 그 외: `actions/names/*` (검색/태깅/이미지 업로드/CRUD)

## Flow 설명
- **초기 로딩**
  - mount 시 `fetchNameList()` 실행
  - URL에 `namePk`가 있으면 `handleSelectNameDetail(pk)`로 상세 자동 로드
- **목록 조회**
  - 검색어가 있으면 `getNameListByPartialKeyword`
  - 없으면 `getNameList({ filter })` (기본은 `createdAt` 정렬)
  - 필터가 `tag`일 때 `getNameListGroupByTags()` 결과를 별도 렌더링
- **상세 선택**
  - `getNameDetail(pk)`로 상세 로드 후 폼/태그 상태 바인딩
  - 동시에 `router.replace(?namePk=pk)`로 URL에 선택 상태 기록
- **저장**
  - `namePk`가 있으면 `updateName` + `processTags()`로 `nameTagging` 반복
  - 없으면 `createName` 후 `processTags()` 수행
- **태그 삭제**
  - UI에서 제거 → 서버에서 `nameUntagging({ namePk, tagPk })` 호출
- **이미지 업로드**
  - 파일을 base64로 변환 → `uploadNameImage(namePk, base64)` → 반환 URL을 폼 상태에 반영

