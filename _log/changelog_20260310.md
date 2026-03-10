# 작업 로그 - 2026-03-10

## Task 15. Phase 3 - 포트원(아임포트) 결제 연동

### 변경 파일 (서버)
- `server/src/validations/payment.validation.ts` (신규)
- `server/src/services/payment.service.ts` (신규)
- `server/src/controllers/payment.controller.ts` (신규)
- `server/src/routes/payment.routes.ts` (신규)
- `server/src/app.ts` (수정 - 결제 라우트 등록)
- `server/src/routes/order.routes.ts` (수정 - Express 5 호환 미들웨어 적용)
- `server/package.json` (수정 - axios 의존성 추가)

### 변경 파일 (클라이언트)
- `client/src/api/payment.api.ts` (신규)
- `client/src/types/iamport.d.ts` (신규 - 아임포트 SDK 타입 선언)
- `client/index.html` (수정 - 아임포트 SDK CDN 스크립트 추가)
- `client/src/api/client.ts` (수정 - 토큰 갱신 인터셉터 baseURL 수정)

### 구현 내용
- **포트원 V1 SDK 연동**: CDN으로 iamport.payment.js 로드, 고객사 식별코드 `imp22672267`
- **결제 검증 API** (`POST /api/payments/verify`):
  - 포트원 REST API로 액세스 토큰 발급 → 결제 정보 조회
  - 주문 금액과 실제 결제 금액 일치 검증
  - Prisma 트랜잭션으로 Payment 레코드 생성 + Order 상태 PAID 업데이트
- **Express 5 호환**: `router.use(authMiddleware)` 패턴 → 개별 라우트 미들웨어 적용
- **API 클라이언트 수정**: 401 토큰 갱신 시 `apiClient` 인스턴스 사용 (baseURL 적용)

---

## Task 16. Phase 3 - 결제 페이지 및 결제 완료 처리

### 변경 파일
- `client/src/pages/shop/PaymentPage.tsx` (신규)
- `client/src/pages/shop/OrderPage.tsx` (수정 - 결제 페이지로 이동)
- `client/src/pages/shop/OrderCompletePage.tsx` (수정 - 결제 수단 표시)
- `client/src/App.tsx` (수정 - `/payment` 라우트 추가)

### 구현 내용
- **결제 페이지** (`/payment`):
  - 페이지 마운트 시 `IMP.request_pay()` 자동 호출
  - PG: html5_inicis, 결제수단: 카드
  - 결제 성공 → 서버 검증 API 호출 → 주문 완료 페이지
  - 결제 실패/취소 → 주문 완료 페이지 이동 (테스트 모드)
  - 결제 준비 중 / 진행 중 / 검증 중 / 실패 상태 UI
- **주문 플로우 변경**:
  - 기존: 주문 페이지 → 주문 완료
  - 변경: 주문 페이지 → 결제 페이지 → 주문 완료
  - `fromCart` 플래그로 장바구니 비우기 타이밍 제어
- **주문 완료 페이지 개선**: 결제 수단 한국어 레이블 표시

---

## 보완. 유틸리티 스크립트

### 변경 파일
- `server/prisma/reset-passwords.ts` (신규)
- `server/prisma/list-users.ts` (신규)

### 구현 내용
- 전체 사용자 비밀번호 초기화 스크립트 (bcrypt 해시)
- 사용자 목록 조회 스크립트

---

## Task 17. Phase 3 - 재고 차감 로직 확인

### 확인 파일
- `server/src/services/order.service.ts`

### 확인 내용
- 재고 차감 로직은 Task 14(주문 생성 API)에서 이미 구현 완료
- **재고 확인**: 주문 전 `ProductOption`에서 재고 조회, 부족 시 에러 반환
- **재고 차감**: Prisma `$transaction` 내에서 `stock: { decrement: quantity }` 원자적 차감
- **트랜잭션 보장**: 재고 차감과 주문 생성이 같은 트랜잭션 내에서 처리되어 데이터 일관성 보장
- 추가 수정 불필요 — 정상 동작 확인 완료
