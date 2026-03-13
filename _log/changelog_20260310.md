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

## Task 22. Phase 5 - 미들웨어 권한 체크 정리

### 변경 파일 (서버)
- `server/src/lib/AppError.ts` (신규 — 커스텀 에러 클래스)
- `server/src/middlewares/error.middleware.ts` (수정 — AppError/ZodError/Multer 분류 처리 + 404 핸들러)
- `server/src/app.ts` (수정 — `/api/*` 404 핸들러 등록)
- `server/src/services/auth.service.ts` (수정 — AppError 적용)
- `server/src/services/product.service.ts` (수정 — AppError 적용)
- `server/src/services/order.service.ts` (수정 — AppError 적용)
- `server/src/services/admin.service.ts` (수정 — AppError 적용)
- `server/src/controllers/auth.controller.ts` (수정 — 수동 에러 분기 제거)
- `server/src/controllers/product.controller.ts` (수정 — 수동 에러 분기 제거)
- `server/src/controllers/order.controller.ts` (수정 — 수동 에러 분기 제거)
- `server/src/controllers/admin.controller.ts` (수정 — AppError 사용, 수동 에러 분기 제거)

### 구현 내용
- **AppError 클래스**: 상태 코드 포함 커스텀 에러 (`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`)
- **에러 미들웨어 개선**: AppError → 해당 상태 코드, ZodError → 400 + 필드별 에러, Multer → 400, 기타 → 500
- **404 핸들러**: `/api/*` 매칭 안 되는 요청에 대해 명확한 404 응답
- **서비스 레이어**: `throw new Error()` → `throw AppError.xxx()` 전환 (4개 서비스)
- **컨트롤러 간소화**: 에러 미들웨어에서 자동 처리되므로 수동 분기 코드 제거 (4개 컨트롤러)

---

## Task 23. Phase 5 - 에러 핸들링 및 로딩 UI

### 변경 파일 (클라이언트)
- `client/src/components/ErrorBoundary.tsx` (신규 — React 에러 바운더리)
- `client/src/components/ui/loading-spinner.tsx` (신규 — LoadingSpinner, PageLoading 컴포넌트)
- `client/src/components/ui/toast.tsx` (신규 — ToastProvider, useToast 알림 시스템)
- `client/src/pages/NotFoundPage.tsx` (신규 — 404 페이지)
- `client/src/App.tsx` (수정 — ErrorBoundary, ToastProvider 래핑 + 404 라우트 추가)
- `client/src/pages/shop/ProductListPage.tsx` (수정 — PageLoading 적용)
- `client/src/pages/shop/ProductDetailPage.tsx` (수정 — PageLoading 적용)
- `client/src/pages/admin/AdminDashboardPage.tsx` (수정 — PageLoading 적용)
- `client/src/pages/admin/AdminUsersPage.tsx` (수정 — LoadingSpinner 적용)
- `client/src/pages/admin/AdminOrdersPage.tsx` (수정 — LoadingSpinner 적용)
- `client/src/pages/admin/AdminOrderDetailPage.tsx` (수정 — PageLoading 적용)

### 구현 내용
- **ErrorBoundary**: React 렌더링 에러 캐치, 에러 화면 표시 (홈으로/다시 시도)
- **LoadingSpinner**: 3가지 크기(sm/md/lg) 지원, PageLoading은 메시지 포함 전체 페이지 로딩
- **Toast 알림**: context 기반, success/error/info 3종, 3초 자동 소멸
- **404 페이지**: 존재하지 않는 경로 접근 시 안내 페이지 표시
- **로딩 UI 통일**: 기존 인라인 스피너/텍스트 → 재사용 가능한 컴포넌트로 교체

---

## Task 24. Phase 5 - 반응형 디자인 점검

### 변경 파일 (클라이언트)
- `client/src/components/layout/Header.tsx` (수정 — 모바일 햄버거 메뉴)
- `client/src/components/layout/AdminLayout.tsx` (수정 — 모바일 사이드바 토글)
- `client/src/components/layout/AdminSidebar.tsx` (수정 — onNavigate 콜백 추가)
- `client/src/components/layout/AdminTopBar.tsx` (수정 — 사이드바 토글 버튼 추가)
- `client/src/components/layout/AuthLayout.tsx` (수정 — 모바일 패딩 추가)
- `client/src/pages/shop/ProductListPage.tsx` (수정 — 검색 Input 반응형)
- `client/src/pages/admin/AdminUsersPage.tsx` (수정 — 필터/검색 반응형)
- `client/src/pages/admin/AdminOrdersPage.tsx` (수정 — 필터/검색 반응형)
- `client/src/pages/admin/AdminDashboardPage.tsx` (수정 — 주문 상태 그리드 반응형)

### 구현 내용
- **Header 모바일 메뉴**: md 브레이크포인트 기준 햄버거 버튼 + 슬라이드 메뉴
- **Admin 사이드바 토글**: lg 브레이크포인트 기준, 모바일에서 오버레이 방식 사이드바
- **AdminTopBar**: 모바일 사이드바 토글 버튼, 사용자명 sm 이상에서만 표시
- **검색 Input**: 고정 너비(w-60/w-64/w-72) → `w-full sm:w-XX` 반응형 전환
- **AuthLayout**: 모바일에서 카드가 화면을 넘지 않도록 px-4 패딩 추가
- **대시보드 그리드**: 주문 상태 grid-cols-3 → grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
