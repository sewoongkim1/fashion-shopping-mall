# 작업 로그 - 2026-03-09

## Task 11. Phase 2 - 상품 리스트 페이지 (필터, 정렬, 페이지네이션)

### 변경 파일
- `client/src/pages/shop/ProductListPage.tsx` (신규)
- `client/src/hooks/useProducts.ts` (신규)
- `client/src/api/product.api.ts` (신규)
- `client/src/components/ui/select.tsx` (신규 - shadcn/ui)
- `client/src/App.tsx` (수정 - 라우트 추가)

### 구현 내용
- 카테고리 탭 필터 (전체, 상의, 하의, 아우터, 원피스, 신발, 가방, 액세서리)
- 상품명 검색 기능
- 정렬 옵션 (최신순, 낮은 가격순, 높은 가격순, 이름순)
- 반응형 그리드 (2/3/4열)
- 페이지네이션 (이전/다음 + 페이지 번호)
- URL searchParams 동기화

---

## Task 12. Phase 2 - 상품 상세 페이지

### 변경 파일
- `client/src/pages/shop/ProductDetailPage.tsx` (신규)
- `client/src/components/ui/badge.tsx` (신규 - shadcn/ui)
- `client/src/App.tsx` (수정 - 라우트 추가)

### 구현 내용
- 이미지 갤러리 (메인 이미지 + 썸네일 목록)
- 할인율 표시 (정가 대비 할인가)
- 컬러 → 사이즈 캐스케이딩 옵션 선택
- 재고 표시 및 품절 처리
- 수량 입력 (재고 범위 제한)
- 총 상품 금액 계산
- SEO (react-helmet-async)

---

## 보완. 로그인 후 리다이렉트 변경

### 변경 파일
- `client/src/hooks/useAuth.ts` (수정)

### 구현 내용
- 일반 사용자(USER): 로그인 시 `/products`로 이동
- 관리자(ADMIN): 로그인 시 `/admin/dashboard`로 이동

---

## 보완. 테스트 상품 시드 데이터

### 변경 파일
- `server/prisma/seed-products.ts` (신규 - 10개 상품)
- `server/prisma/seed-products-2.ts` (신규 - 20개 상품)

### 구현 내용
- 총 28개 테스트 상품 (카테고리별 분산)
- Unsplash 이미지 URL 사용
- 상품별 2~3개 옵션 (컬러/사이즈/재고)
- 일부 상품에 할인가 설정

---

## Task 13. Phase 2 - 장바구니 및 즉시구매 기능

### 변경 파일
- `client/src/store/cart-store.ts` (신규)
- `client/src/pages/shop/CartPage.tsx` (신규)
- `client/src/pages/shop/ProductDetailPage.tsx` (수정)
- `client/src/components/layout/Header.tsx` (수정)
- `client/src/App.tsx` (수정)

### 구현 내용
- **장바구니 상태관리**: Zustand + persist (localStorage)
  - CartItem: productId, productName, imageUrl, color, size, price, originalPrice, quantity, stock
  - addItem (중복 시 수량 합산), removeItem, updateQuantity, clearCart, totalItems, totalPrice
- **장바구니 페이지**:
  - 상품 목록 (이미지, 이름, 옵션, 가격)
  - 수량 조절 (+/- 버튼, 직접 입력)
  - 개별 삭제 / 전체 삭제
  - 주문 요약 (상품 금액, 배송비, 총 결제 금액)
  - 배송비: 5만원 이상 무료, 미만 3,000원
- **상품 상세 페이지 버튼**:
  - "장바구니 담기" - 장바구니에 추가 후 알림
  - "즉시구매" - 장바구니에 추가 후 /cart 페이지로 이동
- **Header**: 장바구니 링크 + 수량 뱃지 (빨간색, 99+)
- **라우트**: `/cart` 추가

---

## Task 14. Phase 3 - 주문 생성 API 및 주문 페이지

### 변경 파일 (서버)
- `server/src/validations/order.validation.ts` (신규)
- `server/src/services/order.service.ts` (신규)
- `server/src/controllers/order.controller.ts` (신규)
- `server/src/routes/order.routes.ts` (신규)
- `server/src/app.ts` (수정 - 주문 라우트 등록)

### 변경 파일 (클라이언트)
- `client/src/api/order.api.ts` (신규)
- `client/src/pages/shop/OrderPage.tsx` (신규)
- `client/src/pages/shop/OrderCompletePage.tsx` (신규)
- `client/src/App.tsx` (수정 - `/order`, `/order/complete` 라우트 추가)
- `client/src/pages/shop/CartPage.tsx` (수정 - 주문하기 버튼 연결)
- `client/src/pages/shop/ProductDetailPage.tsx` (수정 - 즉시구매 → 주문 페이지 직접 이동)

### 구현 내용
- **주문 API** (`POST/GET /api/orders`, `GET /api/orders/:id`):
  - 인증 필수 (authMiddleware)
  - Zod 기반 요청 검증
  - 재고 검증 → 트랜잭션(재고 차감 + 주문 생성)
  - 주문번호 자동생성 (`ORD-YYYYMMDD-XXXXX`)
  - 배송비: 5만원 이상 무료, 미만 3,000원
  - 사용자별 주문 목록/상세 조회 (페이지네이션)
- **주문 페이지** (`/order`):
  - 배송 정보 입력 (수령인, 연락처, 우편번호, 주소, 상세주소, 배송메모)
  - 주문 상품 목록 표시 (이미지, 이름, 옵션, 수량, 가격)
  - 결제 금액 요약 (상품 금액, 배송비, 총 결제 금액)
  - 클라이언트/서버 유효성 검증
- **주문 완료 페이지** (`/order/complete`):
  - 주문번호, 주문 상품, 배송 정보, 결제 정보 표시
  - 쇼핑 계속하기 / 주문 내역 보기 버튼
- **주문 플로우**:
  - 장바구니 → 주문 페이지 → 주문 완료 (장바구니 자동 비우기)
  - 상품 상세 즉시구매 → 주문 페이지 → 주문 완료 (장바구니 미경유)

