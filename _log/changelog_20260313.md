# 작업 로그 - 2026-03-13

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

---

## Task 25. 주문 내역 페이지 및 Express v5 수정

### 변경 파일
- `client/src/pages/shop/MyOrdersPage.tsx` (신규 — 주문 내역 목록 페이지)
- `client/src/pages/shop/MyOrderDetailPage.tsx` (신규 — 주문 상세 페이지)
- `client/src/App.tsx` (수정 — /my-orders, /my-orders/:id 라우트 추가)
- `client/src/components/layout/Header.tsx` (수정 — 주문내역 네비게이션 링크 추가)
- `client/src/pages/shop/OrderCompletePage.tsx` (수정 — 주문 내역 보기 링크 /my-orders로 변경)
- `server/src/app.ts` (수정 — Express v5 와일드카드 `/api/*` → `/api/{*splat}`)

### 구현 내용
- **MyOrdersPage**: 페이지네이션된 주문 목록, 상태 뱃지, 주문 상품 미리보기
- **MyOrderDetailPage**: 주문 상품, 배송 정보, 결제 정보 상세 표시
- **Express v5 호환**: path-to-regexp v8 문법에 맞게 와일드카드 라우트 수정

---

## Task 26. Supabase DB 배포

### 변경 파일
- `server/prisma/prisma.config.ts` (수정 — migrate URL을 DIRECT_URL 사용)
- `server/package.json` (수정 — build 스크립트에 prisma.config.ts 경로 지정)

### 구현 내용
- **Supabase 프로젝트**: ap-northeast-1 리전, PostgreSQL
- **스키마 마이그레이션**: `prisma migrate diff`로 SQL 생성 후 Node.js pg로 직접 실행 (Prisma Rust 엔진 Windows 연결 이슈 우회)
- **데이터 마이그레이션**: 로컬 DB → Supabase로 7개 테이블 데이터 이전
- **런타임 연결**: `@prisma/adapter-pg` 사용으로 Rust 엔진 우회, Session mode pooler 사용

---

## Task 27. Railway 배포 (Server + Client)

### 변경 파일
- `client/package.json` (수정 — serve 패키지 추가, start 스크립트 추가)
- `client/src/pages/admin/AdminOrdersPage.tsx` (수정 — 미사용 import 제거)
- `client/src/pages/admin/AdminProductFormPage.tsx` (수정 — zodResolver 타입 수정)
- `client/src/pages/admin/AdminProductsPage.tsx` (수정 — Button asChild → render, Select onValueChange 타입)
- `client/src/pages/admin/AdminUsersPage.tsx` (수정 — 미사용 변수 제거)
- `client/src/pages/shop/ProductDetailPage.tsx` (수정 — Select onValueChange 타입)
- `client/src/pages/shop/ProductListPage.tsx` (수정 — Select onValueChange 타입)
- `server/src/lib/jwt.ts` (수정 — 크로스 도메인 쿠키 sameSite: none)

### 구현 내용
- **Server 배포**: Railway `fashion-mall-server` 프로젝트, 환경변수 11개 설정
- **Client 배포**: Railway 같은 프로젝트에 client 서비스 추가, `serve` 패키지로 SPA 호스팅
- **TypeScript 빌드 에러 수정**: base-ui Select/Button 타입 호환성 6건 수정
- **크로스 도메인 쿠키**: production 환경에서 `sameSite: 'none'` + `secure: true` 설정
- **CORS 설정**: 서버 CLIENT_URL에 배포된 client 도메인 추가

### 배포 URL
- Client: https://client-production-1d06.up.railway.app
- Server: https://server-production-8fe1.up.railway.app
- DB: Supabase (ap-northeast-1)
