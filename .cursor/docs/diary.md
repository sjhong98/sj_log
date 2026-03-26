# Diary

## Entry map
- **Diary index**: `app/(private)/diary/page.tsx`
  - 서버에서 `getUser()` 확인 → `actions/diary/getDiaryList` → `components/diary/DiaryList`
- **Per-user redirect**: `app/(private)/diary/[email]/page.tsx`
  - 클라이언트에서 `sessionStorage.userId`를 읽어 `/diary/${userId}`로 push (현재 파일은 리다이렉트용)
- **Create / Update**
  - `app/(private)/diary/create/page.tsx`
  - `app/(private)/diary/update/[diaryPk]/page.tsx`
  - (실제 폼/로직은 `components/diary/CreateDiary.tsx` 중심)

## Domain map
- **UI**
  - `components/diary/DiaryList.tsx`
    - 상세 조회: `getDiaryDetail(diaryPk)`
    - 삭제: `deleteDiary(diaryPk)`
    - 댓글: `createComment`, `modifyComment`, `deleteComment`
  - `components/diary/CreateDiary.tsx`
    - 생성: `createDiary(diaryData)`
    - 수정: `updateDiary(diaryData)`
    - 초기값 로딩: `getDiaryDetail(diaryPk)` (update 시)
  - `components/diary/DiaryListPortal.tsx`: 포탈 렌더링(레이아웃의 `#root-portal` 사용)
- **Server actions**
  - `actions/diary/getDiaryList.ts`, `getDiaryDetail.ts`
  - `actions/diary/createDiary.ts`, `updateDiary.ts`, `deleteDiary.ts`
  - `actions/diary/comment/createComment.ts`, `modifyComment.ts`, `deleteComment.ts`

## Flow 설명
- **목록 보기**
  - `app/(private)/diary/page.tsx`에서 서버 렌더 단계에 `getUser()`로 인증 확인
  - `getDiaryList()` 결과를 `DiaryList`에 전달
- **상세 보기**
  - `DiaryList`에서 항목 선택 시 `getDiaryDetail(diaryPk)`를 호출해 상세 데이터를 UI에 바인딩
- **작성/수정**
  - `CreateDiary`가 `diaryPk` 존재 여부에 따라
    - 없으면 `createDiary`
    - 있으면 `getDiaryDetail`로 기존값 로딩 후 `updateDiary`
- **댓글**
  - `DiaryList` 내부에서 `createComment`/`modifyComment`/`deleteComment`로 변경 후 UI 상태 갱신

