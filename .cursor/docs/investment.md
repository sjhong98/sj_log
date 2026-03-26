# Investment

## Entry map
- **Investment index**: `app/(private)/investment/page.tsx`
  - 클라이언트에서 `sessionStorage.userId`를 읽어 `/investment/:email`로 push (리다이렉트용)
- **Investment main**: `app/(private)/investment/[email]/page.tsx`
  - 현재는 `Investment` 텍스트만 렌더하는 placeholder

## Domain map
- **Routes**
  - `app/(private)/investment/page.tsx`
  - `app/(private)/investment/[email]/page.tsx`
- **Actions/Components**
  - 아직 전용 `actions/investment/*`, `components/investment/*` 구조는 보이지 않음

## Flow 설명
- **현재 상태**
  - 로그인 후 email 기반 경로로 이동하는 껍데기만 있고, 데이터 플로우는 미구현(또는 다른 위치에 숨겨져 있음)

