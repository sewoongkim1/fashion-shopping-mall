1. 어떻게 구현하면 좋을지  구체적인 PRD 작성.
2. 소스관리를 위해 폴더에 git 적용.
3. https://github.com/에 push하려고 하는데  필요한 정보 요청해주고 항상 master branch에 push해줘
4. Phase 1 - 기반 구축 --  1.프로젝트 초기 세팅 (client/server 폴더, 패키지 설치)
5. Phase 1 - 기반 구축 --  2. Prisma 스키마 정의 및 DB 마이그레이션
6. Phase 1 - 기반 구축 --  3. JWT 인증 미들웨어 + 라우트 가드 구현
7. Phase 1 - 기반 구축 --  4. 회원가입 / 로그인 구현 (서버 API + 클라이언트 폼)
8. Phase 1 - 기반 구축 --  5. 공통 레이아웃 (ShopLayout, AdminLayout, AuthLayout)
보완
A. 회원 테이블에 컬럼추가 
    - role컬럼 추가 . role은 두 개중 한개를 선택 (admin/user) 
    - 회원가입 화면에서는 필요없으나
    - 로그인시 admin인 경우에는 Navbar에 admin이 표기되고 admin페이지로 분기  
9. Phase 2 - 상품 -- 1.상품 CRUD API
10. Phase 2 - 상품 -- 2.Admin 상품 관리 페이지
보완
B. 이미지 upload 기능 추가
   Cloudinary 사이트를 이용하여 upload
11. Phase 2 - 상품 -- 3.상품 리스트 페이지 (필터, 정렬, 페이지네이션)
12. Phase 2 - 상품 -- 4.상품 상세 페이지
13. Phase 2 - 상품 --5. 장바구니  및 즉시구매 기능
14. Phase 3 - 주문/결제 -- 1. 주문 생성 API 및 주문 페이지
15. Phase 3 - 주문/결제 -- 2.  토스페이먼츠 결제 연동
      장바구니 및 주문 페이지 애서 주문하기 버튼 클릭시
      포트원 결제 모듈 초기화 추가해줘
      고객사 식별코드는 imp22672267
16. Phase 3 - 주문/결제 -- 3. 결제 페이지 및 결제 완료 처리
17. Phase 3 - 주문/결제 -- 4. 재고 차감 로직 확인

18. Phase 4 - Admin -- 1.Admin 대시보드 (매출, 통계)
19. Phase 4 - Admin -- 2.Admin 회원 관리
20. Phase 4 - Admin -- 3.Admin 주문 관리 (상태 변경)
21. Phase 4 - Admin -- 4.Admin 주문 관리 상세 페이지 
      -  주문관리 페이지에서 주문 상세페이지 연결