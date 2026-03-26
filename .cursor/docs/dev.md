# Dev Log

## Entry map
- **Global dashboard(공개/전역)**: `app/(private)/dev/page.tsx`
  - `actions/dev/log/getGlobalRecentDevLogList` → `components/dev/DevLogDashboard`
- **User workspace**: `app/(private)/dev/[email]/page.tsx`
  - 사이드바/그룹트리/최근글/상세를 한 화면에서 조합해 렌더
  - query string 기반 선택
    - `?devLogGroupPk=...` → 그룹 글 목록
    - `?devLogPk=...` → 단일 글 상세

## Domain map
- **UI**
  - `components/dev/DevLogView.tsx`: 좌측 트리/목록 + 선택된 글/최근 글 등 통합 뷰, 삭제 액션 호출 지점 포함
  - `components/dev/DevLogDetailView.tsx`: 글 생성/수정 폼(에디터) 중심, `createDevLog`/`updateDevLog` 호출 지점
- **Server actions (log)**
  - `actions/dev/log/createDevLog.ts`: 생성 + `revalidateTag('dev-log')`
  - `actions/dev/log/updateDevLog.ts`: 수정 + `revalidateTag('dev-log')`
  - `actions/dev/log/deleteDevLog.ts`: 삭제 + `revalidateTag('dev-log')`
  - `actions/dev/log/toggleDevLogPin.ts`, `toggleDevLogPrivacy.ts`: 토글 + `revalidateTag('dev-log')`
  - `actions/dev/log/getDevLogByPk.ts`, `getRecentDevLogList.ts`, `getPinnedDevLogList.ts`, `searchDevLogByKeyword.ts` 등 조회 축
- **Server actions (group)**
  - `actions/dev/group/getAllGroupTree.ts`: 사용자 그룹 트리
  - `actions/dev/group/getGroupTreeAndPostsByPk.ts`: 보드/그룹 + 포스트 트리 구성(메인 초기 데이터)
  - `actions/dev/group/getPostListByGroupPk.ts`: 그룹별 포스트 목록
  - `actions/dev/group/toggleGroupPrivacy.ts`: 그룹 공개/비공개 + `revalidateTag('dev-log-group')`, `revalidateTag('dev-log')`

## Flow 설명
- **페이지 초기 로딩 (`/dev/:email`)**
  - `getGroupTreeAndPostsByPk()`로 전체 보드(트리) 구성
  - `getAllGroupTree(decodedEmail)`로 사용자 그룹 트리/리스트 구성
  - query에 따라 추가 fetch:
    - `devLogGroupPk`가 있으면 `getPostListByGroupPk(groupPk)`로 현재 그룹 글 목록
    - `devLogPk`가 있으면 `getDevLogByPk(pk)`로 상세
    - 둘 다 없고 email만 있으면 `getRecentDevLogList(email)`로 최근 글 목록
- **작성/수정**
  - `DevLogDetailView`에서 폼 데이터 구성 → `createDevLog` 또는 `updateDevLog`
  - 서버 액션이 `revalidateTag('dev-log')`로 캐시 무효화 → 목록/상세 재동기화 유도
- **삭제**
  - `DevLogView`에서 `deleteDevLog(pk)` 호출 → `revalidateTag('dev-log')`

