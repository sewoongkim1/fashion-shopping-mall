# Phase 1 - 기반 구축

## 목표
프로젝트 초기 세팅, DB 스키마, JWT 인증, 회원가입/로그인, 공통 레이아웃 구현

---

## Task 1. 프로젝트 초기 설정

### 1-1. Server (Express + TypeScript)
```
server/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── index.ts          # Express 서버 시작 (listen)
    ├── app.ts            # Express 앱 설정 (cors, json, cookie-parser, 라우트 등록)
    ├── lib/
    │   └── prisma.ts     # Prisma 싱글턴 클라이언트
    └── types/
        └── index.ts      # 서버 타입 정의
```

**설치 패키지:**
- dependencies: express, cors, cookie-parser, dotenv, @prisma/client, bcrypt, jsonwebtoken, zod
- devDependencies: typescript, ts-node, tsx, nodemon, @types/express, @types/cors, @types/cookie-parser, @types/bcrypt, @types/jsonwebtoken, prisma

**설정:**
- tsconfig.json: strict 모드, ESM or CommonJS 설정
- nodemon 또는 tsx watch 모드로 개발 서버 실행
- .env.example: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PORT

### 1-2. Client (React + Vite + Tailwind + shadcn/ui)
```
client/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── .env.example
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── lib/
    │   └── utils.ts       # cn() 유틸 (shadcn/ui용)
    ├── api/
    │   └── client.ts      # axios 인스턴스 (baseURL, withCredentials)
    ├── store/
    │   └── auth-store.ts  # Zustand 인증 상태
    └── types/
        └── index.ts       # 공통 타입 정의
```

**설치 패키지:**
- dependencies: react, react-dom, react-router-dom, @tanstack/react-query, zustand, axios, react-hook-form, @hookform/resolvers, zod, react-helmet-async
- devDependencies: typescript, @types/react, @types/react-dom, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer
- shadcn/ui: npx shadcn@latest init → Button, Input, Label, Card, Dialog, Toast 등 필요 컴포넌트 추가

**설정:**
- vite.config.ts: proxy 설정 (/api → http://localhost:4000)
- .env.example: VITE_API_URL

---

## Task 2. Prisma 스키마 정의 및 DB 마이그레이션

### 스키마 작성 (server/prisma/schema.prisma)
PRD 섹션 5의 DB 스키마를 그대로 구현:
- **모델**: User, Product, ProductImage, ProductOption, Order, OrderItem, Payment
- **Enum**: Role(USER/ADMIN), Category, ProductStatus, OrderStatus, PaymentStatus, PaymentMethod
- **관계**: cascade delete, unique 제약조건 적용

### 마이그레이션 실행
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 시드 데이터 (server/prisma/seed.ts)
- Admin 계정 1개 (email: admin@example.com, password: bcrypt 해싱)
- package.json에 prisma.seed 설정 추가

---

## Task 3. JWT 인증 미들웨어 + 라우트 가드

### 3-1. Server 인증 유틸 및 미들웨어
```
server/src/
├── lib/
│   └── jwt.ts                  # generateAccessToken, generateRefreshToken, verifyToken
├── middlewares/
│   ├── auth.middleware.ts      # JWT 검증 → req.user 주입
│   ├── role.middleware.ts      # role 기반 접근 제어 (ADMIN 전용)
│   ├── validate.middleware.ts  # Zod 스키마 유효성 검증
│   └── error.middleware.ts     # 글로벌 에러 핸들러
└── types/
    └── index.ts                # Request 확장 (req.user 타입)
```

**JWT 설정:**
- Access Token: httpOnly cookie, 15분 만료
- Refresh Token: httpOnly cookie, 7일 만료
- cookie 옵션: httpOnly, secure(prod), sameSite: 'lax'

### 3-2. Client 라우트 가드
```
client/src/routes/
├── ProtectedRoute.tsx    # 로그인 필수 (미인증 → /login 리다이렉트)
└── AdminRoute.tsx        # ADMIN role 필수 (비관리자 → /login 리다이렉트)
```

**axios 인터셉터:**
- 401 응답 시 → /api/auth/refresh 시도 → 실패 시 로그인 페이지 리다이렉트

---

## Task 4. 회원가입 / 로그인 구현

### 4-1. Server API
```
server/src/
├── routes/auth.routes.ts
├── controllers/auth.controller.ts
├── services/auth.service.ts
└── validations/auth.validation.ts
```

**API 엔드포인트:**
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/register | 회원가입 (email, password, name, phone) |
| POST | /api/auth/login | 로그인 (Access + Refresh Token 발급) |
| POST | /api/auth/refresh | Access Token 갱신 |
| POST | /api/auth/logout | 로그아웃 (쿠키 제거) |
| GET | /api/auth/me | 현재 로그인 사용자 정보 |

**Validation (Zod):**
- register: email 형식, password 8자 이상, name 필수
- login: email, password 필수

**Service 로직:**
- register: 이메일 중복 체크 → bcrypt 해싱 → DB 저장 → 토큰 발급
- login: 이메일 조회 → bcrypt 비교 → 토큰 발급
- refresh: Refresh Token 검증 → 새 Access Token 발급
- logout: 쿠키 클리어

### 4-2. Client 페이지
```
client/src/
├── pages/auth/
│   ├── LoginPage.tsx       # 로그인 폼 (email, password)
│   └── RegisterPage.tsx    # 회원가입 폼 (email, password, name, phone)
├── api/
│   └── auth.api.ts         # register, login, logout, refresh, getMe
├── hooks/
│   └── useAuth.ts          # 인증 상태 관리 훅 (TanStack Query)
└── store/
    └── auth-store.ts       # user 정보, isAuthenticated (Zustand)
```

**폼 구현:**
- React Hook Form + Zod resolver
- shadcn/ui 컴포넌트 (Input, Button, Label, Card)
- 에러 메시지 표시, 로딩 상태

---

## Task 5. 공통 레이아웃

### 레이아웃 컴포넌트
```
client/src/components/layout/
├── ShopLayout.tsx      # Header + {children} + Footer
├── AdminLayout.tsx     # AdminSidebar + AdminTopBar + {children}
├── AuthLayout.tsx      # 중앙 정렬 카드 레이아웃
├── Header.tsx          # 로고, 네비게이션, 로그인/회원가입 버튼
├── Footer.tsx          # 푸터
├── AdminSidebar.tsx    # Admin 사이드바 (대시보드, 회원관리, 상품관리, 주문관리 메뉴)
└── AdminTopBar.tsx     # Admin 상단바 (사용자 정보, 로그아웃)
```

### App.tsx 라우터 설정
```tsx
<Routes>
  {/* Auth 라우트 */}
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
  </Route>

  {/* Shop 라우트 */}
  <Route element={<ShopLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/products" element={<ProductListPage />} />
    <Route path="/products/:id" element={<ProductDetailPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/order" element={<OrderPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
    </Route>
  </Route>

  {/* Admin 라우트 */}
  <Route element={<AdminRoute />}>
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<DashboardPage />} />
      <Route path="/admin/users" element={<MemberListPage />} />
      <Route path="/admin/products" element={<AdminProductListPage />} />
      <Route path="/admin/orders" element={<AdminOrderListPage />} />
    </Route>
  </Route>
</Routes>
```

---

## 커밋 계획 (1기능 = 1커밋)

| 순서 | 커밋 메시지 | 범위 |
|------|-------------|------|
| 1 | feat: server 프로젝트 초기 설정 (Express + TypeScript) | Task 1-1 |
| 2 | feat: client 프로젝트 초기 설정 (Vite + React + Tailwind + shadcn/ui) | Task 1-2 |
| 3 | feat: Prisma 스키마 정의 및 DB 마이그레이션 | Task 2 |
| 4 | feat: JWT 인증 미들웨어 및 라우트 가드 구현 | Task 3 |
| 5 | feat: 회원가입/로그인 API 구현 (server) | Task 4-1 |
| 6 | feat: 회원가입/로그인 페이지 구현 (client) | Task 4-2 |
| 7 | feat: 공통 레이아웃 구현 (ShopLayout, AdminLayout, AuthLayout) | Task 5 |

---

## 수행 순서
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 순서로 진행.
각 Task 완료 시 커밋 + push (master 브랜치).
작업 완료 후 _log/changelog에 기록.
