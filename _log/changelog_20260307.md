# Changelog - 2026-03-07

## 1. PRD 작성
- `docs/PRD.md` 생성
- 기술 스택 정의 (React + Vite / Node.js + Express / PostgreSQL + Prisma)
- 시스템 아키텍처 다이어그램 작성 (Client SPA ↔ Express API ↔ DB)
- 인증 흐름 설계 (JWT Access/Refresh Token, httpOnly cookie)
- 결제 플로우 설계 (토스페이먼츠 위젯 + 서버 승인)
- 폴더 구조 설계 (client/ + server/ 분리)
- DB 스키마 설계 (User, Product, ProductImage, ProductOption, Order, OrderItem, Payment)
- API 엔드포인트 설계 (인증, 상품, 주문, 결제, 회원, 파일)
- 구현 우선순위 5단계 정의 (Phase 1~5)

## 2. Git 초기화
- `git init` 실행
- `.gitignore` 생성 (node_modules, .env, dist, IDE, .claude/ 등)
- 초기 커밋: `e6f908d` - init: 프로젝트 초기 설정 및 PRD 문서 작성

## 3. GitHub 리포지토리 생성 및 Push
- `gh` CLI 설치 (v2.87.3, winget)
- GitHub 인증 완료 (계정: sewoongkim1)
- 리포지토리 생성: https://github.com/sewoongkim1/fashion-shopping-mall (public)
- master 브랜치로 push 완료
- 커밋: `a492461` - docs: 작업 로그 추가 및 instruction 파일 업데이트

---LOG---
작업: init.md 3개 태스크 완료 (PRD 작성, Git 초기화, GitHub push)
입력 Context: instruction/init.md, claude.md, instruction/core.md
결과: 성공
생성 파일: docs/PRD.md, .gitignore, _log/changelog_20260307.md
주요 결정사항: public 리포지토리, master 브랜치 사용, gh CLI 인증 방식 채택
보완 필요: Phase 1 개발 착수 (프로젝트 초기 세팅, Prisma 스키마, JWT 인증)
교훈: gh auth setup-git으로 git credential 설정 필요
---END LOG---

## 4. Phase 1 - Task 1-2: Client 프로젝트 초기 설정 완료

### 기존 완료 (Vite 스캐폴딩)
- Vite + React + TypeScript 프로젝트 생성
- Tailwind CSS v4 설정 (@tailwindcss/vite 플러그인)
- shadcn/ui 초기화 (button 컴포넌트, cn() 유틸)
- vite.config.ts: proxy 설정 (/api → localhost:4000), @ alias
- 주요 dependencies 설치 (react-router-dom, @tanstack/react-query, zustand, axios, react-hook-form, zod, react-helmet-async 등)

### 추가 완료 항목
- `.env.example` 생성 (VITE_API_URL)
- `src/api/client.ts` 생성 — axios 인스턴스 (baseURL, withCredentials, 401 인터셉터로 토큰 갱신)
- `src/store/auth-store.ts` 생성 — Zustand 인증 상태 (user, isAuthenticated, setUser, logout)
- `src/types/index.ts` 생성 — PRD 기반 공통 타입 (User, Product, Order, Payment, Enum 타입 등)
- `src/App.tsx` 정리 — Vite 기본 템플릿 → React Router + TanStack Query + HelmetProvider 구조
- `src/App.css` 삭제 (미사용)

### 빌드 검증
- `tsc --noEmit`: 타입 체크 통과
- `vite build`: 프로덕션 빌드 성공

---LOG---
작업: Phase 1 Task 1-2 Client 프로젝트 초기 설정 완료
입력 Context: instruction/phase1.md, docs/PRD.md, instruction/core.md
결과: 성공
생성 파일: client/.env.example, client/src/api/client.ts, client/src/store/auth-store.ts, client/src/types/index.ts
주요 결정사항: axios 인터셉터에서 401 시 /api/auth/refresh 자동 시도 후 실패 시 /login 리다이렉트
보완 필요: Task 2 (Prisma 스키마 정의 및 DB 마이그레이션) 진행
교훈: shadcn/ui v4는 Tailwind CSS v4 + @tailwindcss/vite 플러그인 방식 사용 (tailwind.config.ts 불필요)
---END LOG---

## 5. Phase 1 - Task 2: Prisma 스키마 정의 및 DB 마이그레이션

### 스키마 보정 (PRD 기준)
- ProductStatus: `INACTIVE` → `HIDDEN`
- OrderStatus: `PREPARING` 추가
- PaymentStatus: `READY/DONE` → `PENDING/APPROVED`
- Product.description: `String?` → `String @db.Text`
- Order 주소 필드: `recipientAddr/recipientZip/memo` → `address/addressDetail/zipCode/deliveryMemo`
- OrderItem 필드: `color/size/productPrice/productSalePrice` → `optionColor/optionSize/price`
- Payment.method: `PaymentMethod` enum → `String`
- Category: `ETC` 제거, `PaymentMethod` enum 제거

### Prisma 7 대응
- `prisma.config.ts` 생성 (datasource URL, migrate resolve, seed 설정)
- schema.prisma에서 `url = env("DATABASE_URL")` 제거 (Prisma 7에서 미지원)
- PrismaClient에 `@prisma/adapter-pg` + `pg Pool` 사용 (Prisma 7 필수)
- `--config prisma/prisma.config.ts` 플래그로 CLI 실행

### 마이그레이션
- `npx prisma migrate dev --name init` → 성공 (fashion_mall DB 자동 생성)
- `npx prisma generate` → Prisma Client 생성 완료

### 시드 데이터
- Admin 계정: admin@example.com / admin1234 (bcrypt 해싱)
- `npx prisma db seed` → 성공

---LOG---
작업: Phase 1 Task 2 Prisma 스키마 정의 및 DB 마이그레이션
입력 Context: instruction/phase1.md, docs/PRD.md, instruction/core.md
결과: 성공
생성 파일: server/prisma/prisma.config.ts, server/prisma/seed.ts, server/prisma/migrations/20260307115031_init/
주요 결정사항: Prisma 7은 schema에서 datasource url 미지원 → prisma.config.ts로 이관, PrismaClient는 @prisma/adapter-pg 어댑터 필수
보완 필요: Task 3 (JWT 인증 미들웨어 및 라우트 가드) 진행
교훈: Prisma 7 breaking changes — datasource url을 prisma.config.ts로 이관, PrismaClient에 adapter 패턴 사용, seed 설정은 migrations 섹션 내부에 배치
---END LOG---

## 6. Phase 1 - Task 3: JWT 인증 미들웨어 + 라우트 가드 구현

### Server 인증 유틸 및 미들웨어
- `src/lib/jwt.ts` — Access Token(15분)/Refresh Token(7일) 생성/검증, httpOnly cookie 옵션
- `src/middlewares/auth.middleware.ts` — JWT 검증 → req.user 주입
- `src/middlewares/role.middleware.ts` — role 기반 접근 제어 (가변 인자로 여러 role 지원)
- `src/middlewares/validate.middleware.ts` — Zod 스키마 유효성 검증 (body)
- `src/middlewares/error.middleware.ts` — 글로벌 에러 핸들러
- `app.ts`에 errorMiddleware 등록

### Client 라우트 가드
- `src/routes/ProtectedRoute.tsx` — 로그인 필수 (미인증 → /login 리다이렉트)
- `src/routes/AdminRoute.tsx` — ADMIN role 필수 (비관리자 → /login 리다이렉트)

### 빌드 검증
- Server `tsc --noEmit`: 통과
- Client `tsc --noEmit`: 통과

---LOG---
작업: Phase 1 Task 3 JWT 인증 미들웨어 + 라우트 가드 구현
입력 Context: instruction/phase1.md, instruction/core.md
결과: 성공
생성 파일: server/src/lib/jwt.ts, server/src/middlewares/auth.middleware.ts, server/src/middlewares/role.middleware.ts, server/src/middlewares/validate.middleware.ts, server/src/middlewares/error.middleware.ts, client/src/routes/ProtectedRoute.tsx, client/src/routes/AdminRoute.tsx
주요 결정사항: cookie 기반 JWT (access_token/refresh_token), Zod v4 에러 처리는 .issues 사용
보완 필요: Task 4 (회원가입/로그인 API 구현) 진행
교훈: Zod v4에서는 ZodError.errors 대신 ZodError.issues 사용
---END LOG---

## 7. Phase 1 - Task 4: 회원가입/로그인 구현 (Server API + Client 폼)

### Server API (4-1)
- `src/validations/auth.validation.ts` — Zod 스키마 (register: email/password/name/phone, login: email/password)
- `src/services/auth.service.ts` — AuthService 클래스 (register, login, getMe)
- `src/controllers/auth.controller.ts` — AuthController (register, login, refresh, logout, getMe)
- `src/routes/auth.routes.ts` — 5개 엔드포인트 등록
- `app.ts`에 `/api/auth` 라우트 등록

**API 엔드포인트:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/register | 회원가입 (토큰 발급) |
| POST | /api/auth/login | 로그인 (토큰 발급) |
| POST | /api/auth/refresh | Access Token 갱신 |
| POST | /api/auth/logout | 로그아웃 (쿠키 제거) |
| GET | /api/auth/me | 현재 사용자 정보 |

### Client 페이지 (4-2)
- `src/api/auth.api.ts` — API 함수 (register, login, logout, refresh, getMe)
- `src/hooks/useAuth.ts` — TanStack Query 기반 인증 훅 (meQuery, loginMutation, registerMutation, logoutMutation)
- `src/pages/auth/LoginPage.tsx` — 로그인 폼 (React Hook Form + Zod)
- `src/pages/auth/RegisterPage.tsx` — 회원가입 폼 (비밀번호 확인 포함)
- shadcn/ui 컴포넌트 추가: Input, Label, Card

### 빌드 검증
- Server `tsc --noEmit`: 통과
- Client `tsc --noEmit`: 통과

---LOG---
작업: Phase 1 Task 4 회원가입/로그인 구현 (Server API + Client 폼)
입력 Context: instruction/phase1.md, docs/PRD.md, instruction/core.md
결과: 성공
생성 파일: server/src/validations/auth.validation.ts, server/src/services/auth.service.ts, server/src/controllers/auth.controller.ts, server/src/routes/auth.routes.ts, client/src/api/auth.api.ts, client/src/hooks/useAuth.ts, client/src/pages/auth/LoginPage.tsx, client/src/pages/auth/RegisterPage.tsx
주요 결정사항: cookie 기반 토큰 발급 (httpOnly, secure, sameSite:lax), 비밀번호 확인 필드는 클라이언트 전용
보완 필요: Task 5 (공통 레이아웃 구현) 진행
교훈: Express 5에서는 라우트 핸들러를 arrow function wrapper로 전달해야 this 바인딩 이슈 회피
---END LOG---

## 8. Phase 1 - Task 5: 공통 레이아웃 구현 (ShopLayout, AdminLayout, AuthLayout)

### 생성 파일
- `client/src/components/layout/Footer.tsx` — 푸터 (저작권 표시)
- `client/src/components/layout/AdminSidebar.tsx` — Admin 사이드바 (대시보드, 회원관리, 상품관리, 주문관리 메뉴, 현재 경로 하이라이트)
- `client/src/components/layout/AdminTopBar.tsx` — Admin 상단바 (Shop 이동 링크, 사용자 정보, 로그아웃)
- `client/src/components/layout/AuthLayout.tsx` — 중앙 정렬 카드 레이아웃 (`<Outlet />` 사용)
- `client/src/components/layout/ShopLayout.tsx` — Header + `<Outlet />` + Footer (flex-col min-h-screen)
- `client/src/components/layout/AdminLayout.tsx` — AdminSidebar + AdminTopBar + `<Outlet />` (flex h-screen)

### App.tsx 라우터 업데이트
- 중첩 레이아웃 라우팅 적용 (React Router v6 `<Outlet />` 패턴)
- Auth 라우트: `<AuthLayout>` → LoginPage, RegisterPage
- Shop 라우트: `<ShopLayout>` → Home, Products, ProductDetail, ProtectedRoute(Order, Checkout)
- Admin 라우트: `<AdminRoute>` → `<AdminLayout>` → Dashboard, Users, Products, Orders

### 빌드 검증
- Client `tsc --noEmit`: 통과

---LOG---
작업: Phase 1 Task 5 공통 레이아웃 구현 (ShopLayout, AdminLayout, AuthLayout)
입력 Context: instruction/phase1.md, instruction/init.md, instruction/core.md
결과: 성공
생성 파일: client/src/components/layout/Footer.tsx, AdminSidebar.tsx, AdminTopBar.tsx, AuthLayout.tsx, ShopLayout.tsx, AdminLayout.tsx
주요 결정사항: React Router v6 Outlet 패턴으로 레이아웃 중첩, AdminLayout은 flex h-screen으로 사이드바+메인 분리
보완 필요: Phase 2 개발 착수 (상품 관리 기능)
교훈: client 폴더에 별도 .git이 있으면 embedded repo 경고 발생 — .git 제거 후 정상 커밋 가능
---END LOG---
