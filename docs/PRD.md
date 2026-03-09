# 패션 쇼핑몰 MVP - PRD (Product Requirements Document)

**프로젝트명:** 패션 쇼핑몰 MVP
**작성일:** 2026-03-07
**버전:** v1.0

---

## 1. 프로젝트 개요

패션 아이템(의류, 잡화 등)을 온라인으로 판매하는 쇼핑몰 웹 애플리케이션의 MVP를 구축한다.
핵심 구매 플로우(회원가입 → 상품 탐색 → 주문 → 결제)와 관리자 기능을 최소 범위로 구현한다.

---

## 2. 기술 스택

| 영역 | 기술 | 선정 이유 |
|------|------|-----------|
| **Frontend** | React 18 + TypeScript + Vite | 빠른 HMR, 경량 빌드, SPA 구성 |
| **UI** | Tailwind CSS + shadcn/ui | 일관된 디자인 시스템, 커스터마이징 용이 |
| **라우팅** | React Router v6 | 클라이언트 사이드 라우팅, 레이아웃 중첩 |
| **상태관리** | Zustand + TanStack Query | 전역 상태 + 서버 상태 (캐싱, 동기화) 분리 |
| **폼 처리** | React Hook Form + Zod | 스키마 기반 유효성 검증 |
| **Backend** | Node.js + Express + TypeScript | 유연한 미들웨어 구조, 풍부한 생태계 |
| **ORM** | Prisma | 타입 안전 DB 접근, 마이그레이션 관리 |
| **DB** | PostgreSQL | 관계형 데이터(회원-주문-상품) 처리에 적합 |
| **인증** | JWT (jsonwebtoken + bcrypt) | Access/Refresh Token, httpOnly cookie 기반 |
| **결제** | 토스페이먼츠 (Toss Payments) | 국내 결제 연동 편의성, 테스트 환경 제공 |
| **파일 저장** | AWS S3 (또는 Cloudflare R2) | 상품 이미지 저장 |
| **배포** | Client: Vercel / Server: Railway 또는 Render | 프론트/백엔드 독립 배포 |

---

## 3. 솔루션 구성 및 기술요소

### 3.1 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │          React SPA (Vite + React Router)             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │    │
│  │  │ Shop UI  │  │ Admin UI │  │ 토스 결제 위젯     │ │    │
│  │  └──────────┘  └──────────┘  └────────────────────┘ │    │
│  │        TanStack Query ←── REST API 호출 ──→         │    │
│  └──────────────────────────┬───────────────────────────┘    │
└─────────────────────────────┼────────────────────────────────┘
                              │ HTTP (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Node.js + Express (TypeScript)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  Routes       │  │  Controllers │  │  Services          │ │
│  │  /auth        │  │  authCtrl    │  │  authService       │ │
│  │  /products    │  │  productCtrl │  │  productService    │ │
│  │  /orders      │  │  orderCtrl   │  │  orderService      │ │
│  │  /payments    │  │  paymentCtrl │  │  paymentService    │ │
│  │  /users       │  │  userCtrl    │  │  userService       │ │
│  └──────┬───────┘  └──────────────┘  └──────────┬─────────┘ │
│         │                                        │           │
│         ▼                                        ▼           │
│  ┌──────────────────┐                   ┌──────────────┐     │
│  │  Middleware       │                   │  Prisma ORM  │     │
│  │  - authGuard      │                   └──────┬───────┘     │
│  │  - roleGuard      │                          │             │
│  │  - validate (Zod) │                          │             │
│  │  - errorHandler   │                          │             │
│  └──────────────────┘                           │             │
└─────────────────────────────────────────────────┼─────────────┘
                                                  │
                  ┌───────────────────────────────┼────────────┐
                  ▼                               ▼            ▼
          ┌──────────────┐               ┌──────────────┐ ┌──────────┐
          │ PostgreSQL   │               │ AWS S3 /     │ │ 토스     │
          │ (Supabase /  │               │ Cloudflare   │ │ Payments │
          │  Neon)       │               │ R2           │ │ API      │
          └──────────────┘               └──────────────┘ └──────────┘
```

### 3.2 기술요소 상세

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **Client 렌더링** | React 18 + Vite | SPA, 빠른 개발 서버 HMR, 최적화 빌드 |
| **Client 라우팅** | React Router v6 | 레이아웃 중첩, 라우트 가드, 코드 스플리팅 (lazy) |
| **서버 상태** | TanStack Query (React Query) | API 응답 캐싱, 자동 리페치, 옵티미스틱 업데이트 |
| **전역 상태** | Zustand | 인증 상태, 주문 폼 등 클라이언트 전용 상태 |
| **UI 프레임워크** | Tailwind CSS + shadcn/ui | 유틸리티 CSS + 접근성 보장된 Headless 컴포넌트 |
| **폼 처리** | React Hook Form + Zod | 스키마 기반 유효성 검증 (클라이언트 + 서버 공유) |
| **Server 프레임워크** | Express.js + TypeScript | Route → Controller → Service 레이어드 구조 |
| **인증** | jsonwebtoken + bcrypt | Access Token (15분) + Refresh Token (7일), httpOnly cookie |
| **ORM** | Prisma | 타입 안전 쿼리, 마이그레이션, 시드 데이터 관리 |
| **DB** | PostgreSQL (Supabase 또는 Neon) | 관계형 데이터 (회원-주문-상품), 무료 호스팅 티어 활용 |
| **파일 저장** | AWS S3 Presigned URL | 클라이언트 직접 업로드로 서버 부하 최소화 |
| **결제** | 토스페이먼츠 SDK | 결제 위젯 (Client) + 서버 승인 (Server) |
| **주소 검색** | Daum 우편번호 API | 배송지 입력 시 우편번호/주소 자동 완성 |
| **배포** | Client: Vercel / Server: Railway | 프론트/백엔드 독립 배포, 독립 스케일링 |

### 3.3 인증 및 권한 흐름

```
[회원가입] POST /api/auth/register → bcrypt 해싱 → DB 저장
[로그인]   POST /api/auth/login    → 비밀번호 검증 → Access + Refresh Token 발급
                                      ├─ Access Token  → httpOnly cookie (15분)
                                      └─ Refresh Token → httpOnly cookie (7일)

[API 요청] Client → Authorization cookie 자동 전송 → Server
           Express Middleware에서 JWT 검증 → req.user 주입
              ├─ authGuard: 로그인 필수 API 보호
              └─ roleGuard('ADMIN'): Admin 전용 API 보호

[토큰 갱신] Access Token 만료 → POST /api/auth/refresh
              ├─ Refresh Token 유효 → 새 Access Token 발급
              └─ Refresh Token 만료 → 401 → Client에서 로그인 페이지 리다이렉트

[Client 라우트 보호] React Router에서 ProtectedRoute 컴포넌트로 가드
              ├─ /admin/* → ADMIN role 필수 (아니면 /login 리다이렉트)
              ├─ /order*  → 로그인 필수 (아니면 /login 리다이렉트)
              └─ /products → 누구나 접근 가능
```

### 3.4 결제 플로우

```
1. [Client 주문 페이지] 배송 정보 입력 → POST /api/orders → Order 생성 (PENDING)
2. [Client 결제 페이지] 토스페이먼츠 위젯 렌더링 → 사용자 결제 진행
3. [토스 → Client]     성공 콜백 → paymentKey, orderId, amount 수신
4. [Client → Server]   POST /api/payments/confirm → 토스 서버에 승인 요청 (서버 간 통신)
5. [Server 완료 처리]  Prisma 트랜잭션: Payment 저장 + Order 상태 PAID + 재고 차감
6. [실패 처리]         에러 응답 → Client에서 에러 메시지 표시, Order 상태 유지 (PENDING)
```

---

## 4. 폴더 구조

```
fashion-mall/
├── README.md
│
├── client/                             # ===== Frontend (React + Vite) =====
│   ├── .env                            # VITE_API_URL 등
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── public/
│   │   └── images/                     # 정적 이미지 (로고, 플레이스홀더)
│   │
│   └── src/
│       ├── main.tsx                    # 앱 엔트리 (React DOM 렌더링)
│       ├── App.tsx                     # 라우터 설정 (React Router v6)
│       │
│       ├── routes/                     # 라우트 가드
│       │   ├── ProtectedRoute.tsx      # 로그인 필수 가드
│       │   └── AdminRoute.tsx          # ADMIN role 가드
│       │
│       ├── pages/
│       │   ├── HomePage.tsx            # 메인 → 상품 리스트 또는 랜딩
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx
│       │   │   └── RegisterPage.tsx
│       │   ├── shop/
│       │   │   ├── ProductListPage.tsx
│       │   │   ├── ProductDetailPage.tsx
│       │   │   ├── OrderPage.tsx
│       │   │   ├── CheckoutPage.tsx
│       │   │   └── OrderCompletePage.tsx
│       │   └── admin/
│       │       ├── DashboardPage.tsx
│       │       ├── MemberListPage.tsx
│       │       ├── ProductListPage.tsx
│       │       ├── ProductFormPage.tsx  # 등록 + 수정 공용
│       │       ├── OrderListPage.tsx
│       │       └── OrderDetailPage.tsx
│       │
│       ├── components/
│       │   ├── ui/                     # shadcn/ui (Button, Input, Dialog 등)
│       │   ├── layout/
│       │   │   ├── ShopLayout.tsx      # Header + Footer 래퍼
│       │   │   ├── AdminLayout.tsx     # Sidebar + TopBar 래퍼
│       │   │   ├── AuthLayout.tsx      # 인증 페이지 레이아웃
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── AdminSidebar.tsx
│       │   │   └── AdminTopBar.tsx
│       │   ├── product/
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ProductGrid.tsx
│       │   │   ├── ImageGallery.tsx
│       │   │   ├── OptionSelector.tsx
│       │   │   └── CategoryFilter.tsx
│       │   ├── order/
│       │   │   ├── OrderForm.tsx
│       │   │   ├── OrderSummary.tsx
│       │   │   └── PaymentWidget.tsx   # 토스페이먼츠 위젯 래퍼
│       │   └── admin/
│       │       ├── DashboardStats.tsx
│       │       ├── DataTable.tsx
│       │       ├── ProductForm.tsx
│       │       └── ImageUploader.tsx
│       │
│       ├── hooks/                      # 커스텀 훅
│       │   ├── useAuth.ts             # 인증 상태 훅
│       │   └── useProducts.ts         # 상품 쿼리 훅 (TanStack Query)
│       │
│       ├── api/                        # API 호출 함수 (axios 인스턴스)
│       │   ├── client.ts              # axios 인스턴스 (baseURL, 인터셉터)
│       │   ├── auth.api.ts
│       │   ├── product.api.ts
│       │   ├── order.api.ts
│       │   ├── payment.api.ts
│       │   └── user.api.ts
│       │
│       ├── store/
│       │   ├── auth-store.ts          # 인증 상태 (Zustand)
│       │   └── order-store.ts         # 주문 폼 상태 (Zustand)
│       │
│       ├── types/
│       │   └── index.ts               # 공통 타입 (API 응답, 폼 등)
│       │
│       └── lib/
│           └── utils.ts               # 가격 포맷, 날짜 포맷 등
│
│
├── server/                             # ===== Backend (Node.js + Express) =====
│   ├── .env                            # DB URL, JWT Secret, 토스 키 등
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   │
│   ├── prisma/
│   │   ├── schema.prisma              # DB 스키마 정의
│   │   ├── seed.ts                    # 초기 데이터 시딩 (Admin 계정 등)
│   │   └── migrations/                # 마이그레이션 이력
│   │
│   └── src/
│       ├── index.ts                   # Express 앱 시작점 (listen)
│       ├── app.ts                     # Express 앱 설정 (미들웨어, 라우트 등록)
│       │
│       ├── routes/                    # 라우트 정의 (URL → Controller 매핑)
│       │   ├── auth.routes.ts
│       │   ├── product.routes.ts
│       │   ├── order.routes.ts
│       │   ├── payment.routes.ts
│       │   ├── user.routes.ts
│       │   └── upload.routes.ts
│       │
│       ├── controllers/               # 요청/응답 처리 (입력 파싱, 응답 포맷)
│       │   ├── auth.controller.ts
│       │   ├── product.controller.ts
│       │   ├── order.controller.ts
│       │   ├── payment.controller.ts
│       │   ├── user.controller.ts
│       │   └── upload.controller.ts
│       │
│       ├── services/                  # 비즈니스 로직 (DB 조작, 외부 API 호출)
│       │   ├── auth.service.ts
│       │   ├── product.service.ts
│       │   ├── order.service.ts
│       │   ├── payment.service.ts
│       │   └── user.service.ts
│       │
│       ├── middlewares/
│       │   ├── auth.middleware.ts     # JWT 검증 → req.user 주입
│       │   ├── role.middleware.ts     # role 기반 접근 제어
│       │   ├── validate.middleware.ts # Zod 스키마 유효성 검증
│       │   └── error.middleware.ts    # 글로벌 에러 핸들러
│       │
│       ├── validations/               # Zod 스키마 (요청 바디 검증)
│       │   ├── auth.validation.ts
│       │   ├── product.validation.ts
│       │   └── order.validation.ts
│       │
│       ├── lib/
│       │   ├── prisma.ts             # Prisma 싱글턴 클라이언트
│       │   ├── jwt.ts                # JWT 발급/검증 유틸
│       │   └── utils.ts              # 주문번호 생성 등
│       │
│       └── types/
│           └── index.ts              # 서버 타입 (Request 확장, DTO 등)
```

---

## 5. DB 스키마 (핵심 모델)

```prisma
// ──────────────────────────────
// 회원
// ──────────────────────────────
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String                         // bcrypt 해싱
  name          String
  phone         String?
  role          Role      @default(USER)
  isActive      Boolean   @default(true)       // 계정 활성 상태
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}

// ──────────────────────────────
// 상품
// ──────────────────────────────
model Product {
  id            String           @id @default(cuid())
  name          String
  description   String           @db.Text
  price         Int                               // 원 단위 정수
  salePrice     Int?                              // 할인가 (null이면 할인 없음)
  category      Category
  images        ProductImage[]
  options       ProductOption[]
  status        ProductStatus    @default(ACTIVE)
  isDeleted     Boolean          @default(false)  // 소프트 삭제
  orderItems    OrderItem[]
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
}

enum Category {
  TOP           // 상의
  BOTTOM        // 하의
  OUTER         // 아우터
  DRESS         // 원피스
  BAG           // 가방
  SHOES         // 신발
  ACCESSORY     // 악세서리
}

enum ProductStatus {
  ACTIVE        // 판매중
  SOLDOUT       // 품절
  HIDDEN        // 숨김
}

model ProductImage {
  id         String   @id @default(cuid())
  url        String
  sortOrder  Int      @default(0)              // 이미지 정렬 순서
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductOption {
  id         String   @id @default(cuid())
  color      String                            // e.g. "블랙", "화이트"
  size       String                            // e.g. "S", "M", "L", "XL"
  stock      Int      @default(0)              // 옵션별 재고 관리
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, color, size])           // 동일 상품 내 컬러+사이즈 조합 유니크
}

// ──────────────────────────────
// 주문
// ──────────────────────────────
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique            // YYYYMMDDHHmmss + 랜덤 4자리
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  totalAmount     Int                            // 상품 합계
  shippingFee     Int                            // 배송비 (50,000원 이상 무료, 미만 3,000원)
  status          OrderStatus @default(PENDING)
  recipientName   String                         // 수령인
  recipientPhone  String                         // 수령인 연락처
  zipCode         String                         // 우편번호
  address         String                         // 기본 주소
  addressDetail   String                         // 상세 주소
  deliveryMemo    String?                        // 배송 메모
  payment         Payment?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum OrderStatus {
  PENDING         // 주문 대기 (결제 전)
  PAID            // 결제 완료
  PREPARING       // 배송 준비
  SHIPPING        // 배송 중
  DELIVERED       // 배송 완료
  CANCELLED       // 취소
}

model OrderItem {
  id            String   @id @default(cuid())
  orderId       String
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId     String
  productName   String                          // 주문 시점 상품명 스냅샷
  optionColor   String                          // 주문 시점 선택 컬러
  optionSize    String                          // 주문 시점 선택 사이즈
  quantity      Int
  price         Int                             // 주문 시점 단가
}

// ──────────────────────────────
// 결제
// ──────────────────────────────
model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  order         Order         @relation(fields: [orderId], references: [id])
  paymentKey    String        @unique           // 토스페이먼츠 결제 키
  method        String                          // 카드, 간편결제 등
  amount        Int
  status        PaymentStatus @default(PENDING)
  approvedAt    DateTime?
  createdAt     DateTime      @default(now())
}

enum PaymentStatus {
  PENDING       // 결제 대기
  APPROVED      // 승인 완료
  FAILED        // 결제 실패
  CANCELLED     // 결제 취소
}
```

### 5.1 ER 다이어그램 (관계 요약)

```
User (1) ──── (*) Order
                    │
Order (1) ──── (*) OrderItem
Order (1) ──── (1) Payment

Product (1) ──── (*) ProductImage
Product (1) ──── (*) ProductOption
```

### 5.2 핵심 설계 결정

| 결정 사항 | 선택 | 이유 |
|-----------|------|------|
| 재고 관리 단위 | ProductOption (컬러+사이즈) | 패션 상품은 옵션 조합별 재고가 다름 |
| 상품 삭제 | 소프트 삭제 (isDeleted) | 주문 이력 참조 무결성 보장 |
| 주문 상품 정보 | OrderItem에 스냅샷 저장 | 상품 수정/삭제 후에도 주문 내역 보존 |
| 카테고리 | Enum 타입 | MVP 범위에서 고정 카테고리로 충분, 향후 테이블 분리 가능 |
| 가격 단위 | Int (원) | 소수점 없는 원화, 정수 연산으로 부동소수점 오류 방지 |
| 배송비 정책 | Order에 shippingFee 저장 | 정책 변경 시 기존 주문에 영향 없음 |

---

## 6. 기능 상세 명세

### 6.1 회원가입

| 항목 | 내용 |
|------|------|
| **경로** | `/register` |
| **입력 필드** | 이메일, 비밀번호, 비밀번호 확인, 이름, 휴대폰 번호 |
| **유효성 검증** | 이메일 형식, 비밀번호 8자 이상(영문+숫자+특수문자), 중복 이메일 체크 |
| **비밀번호** | bcrypt 해싱 후 저장 |
| **완료 후** | 로그인 페이지로 리다이렉트 |

### 6.2 로그인

| 항목 | 내용 |
|------|------|
| **경로** | `/login` |
| **방식** | 이메일 + 비밀번호 → POST /api/auth/login |
| **토큰** | Access Token (15분, httpOnly cookie) + Refresh Token (7일, httpOnly cookie) |
| **권한** | role(USER/ADMIN) 기반 접근 제어 (서버: middleware, 클라이언트: ProtectedRoute) |
| **보호** | Admin 페이지는 ADMIN role만 접근 가능 (AdminRoute 가드) |

### 6.3 상품 리스트

| 항목 | 내용 |
|------|------|
| **경로** | `/products` |
| **기능** | 카테고리 필터, 가격 정렬(낮은순/높은순), 키워드 검색 |
| **표시 정보** | 썸네일, 상품명, 가격, 할인가 |
| **페이지네이션** | 무한 스크롤 또는 페이지 번호 방식 |
| **데이터 로딩** | TanStack Query (캐싱 + 자동 리페치) |

### 6.4 상품 상세 페이지

| 항목 | 내용 |
|------|------|
| **경로** | `/products/[id]` |
| **표시 정보** | 이미지 갤러리, 상품명, 가격, 할인가, 설명, 옵션(사이즈/컬러) |
| **기능** | 옵션 선택, 수량 선택, 장바구니 담기, 바로 구매 |
| **SEO** | react-helmet-async로 동적 메타 태그 |

### 6.5 주문 페이지

| 항목 | 내용 |
|------|------|
| **경로** | `/order` |
| **인증** | 로그인 필수 (미로그인 시 로그인 페이지 리다이렉트) |
| **표시 정보** | 주문 상품 목록, 수량, 옵션, 가격 |
| **입력 필드** | 배송지 주소(우편번호 API 연동), 수령인, 연락처 |
| **기능** | 주문 총액 계산, 결제 진행 버튼 |

### 6.6 결제 페이지

| 항목 | 내용 |
|------|------|
| **경로** | `/checkout` |
| **결제 수단** | 토스페이먼츠 SDK 연동 (카드, 간편결제) |
| **플로우** | 결제 요청 → 토스 결제창 → 성공/실패 콜백 → 서버 승인 → 주문 상태 업데이트 |
| **완료** | 결제 성공 시 주문 완료 페이지, 재고 차감 |
| **실패 처리** | 결제 실패 시 에러 메시지, 재시도 안내 |

### 6.7 Admin - 대시보드

| 항목 | 내용 |
|------|------|
| **경로** | `/admin/dashboard` |
| **표시 정보** | 오늘 매출, 총 주문 수, 신규 회원 수, 최근 주문 목록 |
| **차트** | 일별/주별 매출 추이 (recharts 라이브러리) |

### 6.8 Admin - 회원 관리

| 항목 | 내용 |
|------|------|
| **경로** | `/admin/users` |
| **기능** | 회원 목록 조회 (검색, 페이지네이션), 회원 상세 보기, 권한 변경(USER/ADMIN) |

### 6.9 Admin - 상품 관리

| 항목 | 내용 |
|------|------|
| **경로** | `/admin/products` |
| **기능** | 상품 CRUD, 이미지 업로드(S3), 옵션 관리, 활성/비활성 토글 |
| **입력 필드** | 상품명, 카테고리, 가격, 할인가, 설명, 재고, 이미지, 옵션 |

### 6.10 Admin - 주문 관리

| 항목 | 내용 |
|------|------|
| **경로** | `/admin/orders` |
| **기능** | 주문 목록 조회 (상태 필터, 날짜 필터), 주문 상세 보기, 주문 상태 변경 |
| **상태 변경** | PENDING → PAID → SHIPPING → DELIVERED / CANCELLED |

---

## 7. API 엔드포인트 설계

> Base URL: `/api` (Express 서버)

### 인증
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/auth/register` | - | 회원가입 |
| POST | `/api/auth/login` | - | 로그인 (Access + Refresh Token 발급) |
| POST | `/api/auth/refresh` | Refresh Token | Access Token 갱신 |
| POST | `/api/auth/logout` | Access Token | 로그아웃 (쿠키 제거) |

### 상품
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/api/products` | - | 상품 목록 (쿼리: category, search, sort, page) |
| GET | `/api/products/:id` | - | 상품 상세 |
| POST | `/api/products` | Admin | 상품 등록 |
| PUT | `/api/products/:id` | Admin | 상품 수정 |
| DELETE | `/api/products/:id` | Admin | 상품 삭제 (소프트) |

### 주문
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/orders` | User | 주문 생성 |
| GET | `/api/orders` | User/Admin | 주문 목록 (Admin: 전체, User: 본인) |
| GET | `/api/orders/:id` | User/Admin | 주문 상세 |
| PATCH | `/api/orders/:id/status` | Admin | 주문 상태 변경 |

### 결제
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/payments/confirm` | User | 결제 승인 (토스 서버 검증) |
| POST | `/api/payments/cancel` | Admin | 결제 취소 |

### 회원
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/api/users` | Admin | 회원 목록 (검색, 페이지네이션) |
| GET | `/api/users/:id` | Admin | 회원 상세 |
| PATCH | `/api/users/:id/role` | Admin | 권한 변경 |
| PATCH | `/api/users/:id/status` | Admin | 계정 활성/비활성 |

### 파일
| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/api/upload` | Admin | 이미지 업로드 (S3 presigned URL 발급) |

---

## 8. 구현 우선순위 (개발 단계)

### Phase 1 - 기반 구축
1. 프로젝트 초기 설정 (server: Express + TS / client: Vite + React + Tailwind + shadcn/ui)
2. Prisma 스키마 정의 및 DB 마이그레이션
3. JWT 인증 미들웨어 + 라우트 가드 구현
4. 회원가입 / 로그인 구현 (서버 API + 클라이언트 폼)
5. 공통 레이아웃 (ShopLayout, AdminLayout, AuthLayout)

### Phase 2 - 상품
6. 상품 CRUD API 
7. Admin 상품 관리 페이지
8. 이미지 업로드 (Cloudinary Site 활용)
9. 상품 리스트 페이지 (필터, 정렬, 페이지네이션)
10. 상품 상세 페이지
11. 장바구니  및 즉시구매 기능
  
### Phase 3 - 주문/결제
12. 주문 생성 API 및 주문 페이지
13. 토스페이먼츠 결제 연동
14. 결제 페이지 및 결제 완료 처리
15. 재고 차감 로직

### Phase 4 - Admin
16. Admin 대시보드 (매출, 통계)
17. Admin 회원 관리
17. Admin 주문 관리 (상태 변경)

### Phase 5 - 마무리
19. 미들웨어 권한 체크 정리
20. 에러 핸들링 및 로딩 UI
21. 반응형 디자인 점검
22. 배포 (Client: Vercel / Server: Railway / DB: Supabase or Neon)

---

## 9. 비기능 요구사항

| 항목 | 기준 |
|------|------|
| **반응형** | 모바일(360px) ~ 데스크탑(1440px) 대응 |
| **성능** | LCP 2.5초 이내, 이미지 lazy loading, Vite 코드 스플리팅 |
| **보안** | CORS 설정, httpOnly cookie, XSS 방지, SQL Injection 방지(Prisma), bcrypt 해싱 |
| **접근성** | 시맨틱 HTML, 키보드 내비게이션, ARIA 라벨 |
| **에러 처리** | API 에러 표준 응답 형식, 사용자 친화적 에러 UI |

---

## 10. MVP 제외 범위 (향후 확장)

- 소셜 로그인 (카카오, 네이버, 구글)
- 상품 리뷰/평점
- 쿠폰/포인트 시스템
- 위시리스트
- 실시간 알림 (주문 상태 변경)
- 배송 추적 연동
- 환불 처리
