# Finance

## Entry map
- **Finance page**: `app/(private)/finance/page.tsx`
  - 서버에서 `actions/finance/account/getAccounts` 호출 → `components/finance/FinanceDashboard`에 주입

## Domain map
- **UI**
  - `components/finance/FinanceDashboard.tsx`
    - 계정 목록 갱신: `getAccounts()` 재호출 패턴
  - `components/finance/CreateFinanceAccountDialog.tsx`
    - 계정 생성: `createFinanceAccount(formData)`
    - 초기 로그(옵션): `createFinanceLog(...)`를 추가로 생성
  - `components/finance/CreateFinanceLogDialog.tsx`
    - 로그 생성: `createFinanceLog(formData)`
  - `components/finance/MonthlyLogsDisplay.tsx`
    - 월별 조회: `getMonthlyLogs(year, month, options?)`
  - `components/finance/AccountDisplay.tsx`
    - 계정별 로그 조회: `getLogsByAccountPk(accountPk)`
    - 계정 삭제: `deleteFinanceAccount(accountPk)`
  - `components/finance/calibrateAccounts.ts`
    - 보정 로직에서 `createFinanceLog`를 배치로 생성
- **Server actions**
  - Accounts: `actions/finance/account/createFinanceAccount.ts`, `deleteFinanceAccount.ts`, `getAccounts.tsx`
  - Logs: `actions/finance/log/createFinanceLog.ts`, `getMonthlyLogs.ts`, `getLogsByAccountPk.ts`

## Flow 설명
- **초기 진입**
  - `/finance` 진입 시 서버에서 `getAccounts()`로 계정 목록 확보 후 `FinanceDashboard` 렌더
- **계정 생성**
  - `CreateFinanceAccountDialog`에서 `createFinanceAccount`
  - 필요 시 생성 직후 `createFinanceLog`로 초기 잔액/오프셋 로그를 함께 기록
- **월별 로그 조회**
  - `MonthlyLogsDisplay`에서 연/월 변경 → `getMonthlyLogs` 재호출 → UI 갱신
- **계정 상세/삭제**
  - `AccountDisplay`에서 계정 선택 시 `getLogsByAccountPk`
  - 삭제 시 `deleteFinanceAccount` 호출 후 계정 목록/화면 상태 갱신

