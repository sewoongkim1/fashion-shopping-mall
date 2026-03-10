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

---

## Task 18. Phase 4 - Admin 대시보드 (매출, 통계)

### 변경 파일 (서버)
- `server/src/services/admin.service.ts` (신규) — AdminService 클래스
- `server/src/controllers/admin.controller.ts` (신규) — AdminController 클래스
- `server/src/routes/admin.routes.ts` (신규) — Admin API 라우트
- `server/src/app.ts` (수정 — `/api/admin` 라우트 등록)

### 변경 파일 (클라이언트)
- `client/src/api/admin.api.ts` (신규) — Admin API 클라이언트
- `client/src/pages/admin/AdminDashboardPage.tsx` (신규)
- `client/src/App.tsx` (수정 — Admin 라우트 추가)

### 구현 내용
- **대시보드 통계 API** (`GET /api/admin/dashboard`):
  - 전체 회원/상품/주문 수, 전체 매출, 오늘 주문/매출
  - 주문 상태별 카운트 (PENDING~CANCELLED)
  - 최근 주문 5건, 최근 6개월 월별 매출 추이
- **대시보드 UI**:
  - 통계 카드 6개 (총 매출, 오늘 매출, 총 주문, 오늘 주문, 총 회원, 총 상품)
  - 주문 상태별 현황 그리드
  - 월별 매출 바 차트 (CSS 기반)
  - 최근 주문 리스트 (주문자, 상품, 금액, 상태)
- **인증/인가**: authMiddleware + roleMiddleware('ADMIN') 적용

---

## Task 19. Phase 4 - Admin 회원 관리

### 변경 파일
- `server/src/services/admin.service.ts` (수정 — 회원 조회/상태/역할 변경)
- `server/src/controllers/admin.controller.ts` (수정 — 회원 API 엔드포인트)
- `server/src/routes/admin.routes.ts` (수정 — 회원 관리 라우트)
- `client/src/api/admin.api.ts` (수정 — 회원 관리 API 함수)
- `client/src/pages/admin/AdminUsersPage.tsx` (신규)

### 구현 내용
- **회원 목록 API** (`GET /api/admin/users`): 페이지네이션, 이름/이메일 검색, 역할 필터
- **회원 상태 토글** (`PATCH /api/admin/users/:id/toggle-active`): 활성/비활성 전환
- **회원 역할 변경** (`PATCH /api/admin/users/:id/role`): USER/ADMIN 변경
- **회원 관리 UI**: 검색, 역할 필터, 회원 테이블 (이름, 이메일, 역할, 주문수, 상태, 가입일), 페이지네이션

---

## Task 20. Phase 4 - Admin 주문 관리 (상태 변경)

### 변경 파일
- `server/src/services/admin.service.ts` (수정 — 주문 조회/상태 변경)
- `server/src/controllers/admin.controller.ts` (수정 — 주문 API 엔드포인트)
- `server/src/routes/admin.routes.ts` (수정 — 주문 관리 라우트)
- `client/src/api/admin.api.ts` (수정 — 주문 관리 API 함수)
- `client/src/pages/admin/AdminOrdersPage.tsx` (신규)

### 구현 내용
- **주문 목록 API** (`GET /api/admin/orders`): 페이지네이션, 주문번호/수령인/회원명 검색, 상태 필터
- **주문 상태 변경** (`PATCH /api/admin/orders/:id/status`): 6개 상태 (PENDING~CANCELLED)
- **주문 관리 UI**:
  - 검색, 상태 필터, 주문 테이블 (주문번호, 주문자, 상품, 금액, 상태, 일시)
  - 상태 변경 드롭다운 (색상 구분)
  - 주문 상세 확장 패널 (주문 상품 목록, 금액 합계, 배송 정보, 결제 수단)
  - 페이지네이션

---

## Task 21. Phase 4 - Admin 주문 관리 상세 페이지

### 변경 파일 (서버)
- `server/src/services/admin.service.ts` (수정 — `getOrderDetail()` 메서드 추가)
- `server/src/controllers/admin.controller.ts` (수정 — `GET /api/admin/orders/:id` 엔드포인트, Express 5 타입 수정)
- `server/src/routes/admin.routes.ts` (수정 — 주문 상세 라우트 추가)

### 변경 파일 (클라이언트)
- `client/src/api/admin.api.ts` (수정 — `getOrderDetail()` 함수 추가)
- `client/src/pages/admin/AdminOrderDetailPage.tsx` (신규)
- `client/src/pages/admin/AdminOrdersPage.tsx` (수정 — 주문번호 클릭 링크 추가)
- `client/src/App.tsx` (수정 — `/admin/orders/:id` 라우트 추가)

### 보완 수정
- `server/src/app.ts` (수정 — CORS origin 다중 포트 허용)

### 구현 내용
- **주문 상세 API** (`GET /api/admin/orders/:id`): 주문 + 유저 + 결제 + 상품 정보 포함 조회
- **주문 상세 페이지** (`/admin/orders/:id`):
  - 주문 기본 정보 (주문번호, 일시, 주문자, 연락처)
  - 주문 상품 테이블 (상품명, 옵션, 수량, 단가, 소계, 합계)
  - 배송 정보 (수령인, 연락처, 주소, 메모)
  - 결제 정보 (수단, 금액, 상태, 승인일, 결제키)
  - 주문 상태 변경 버튼 (6개 상태)
- **목록→상세 연결**: 주문 목록에서 주문번호 클릭 시 상세 페이지 이동
- **CORS 수정**: 개발 환경 다중 포트(5173~5176) 허용
