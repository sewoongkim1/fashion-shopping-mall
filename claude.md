  - **프로젝트명:** 패션 쇼핑몰 MVP

# 쇼핑물 프로젝트
  - 페션 쇼핑물 웹 사이트 구축 (MVP(Minimum Viable Product))

## 1. 프로젝트 개요

패션 아이템(의류, 잡화 등)을 온라인으로 판매하는 쇼핑몰 웹 애플리케이션의 MVP를 구축한다.
핵심 구매 플로우(회원가입 → 상품 탐색 → 주문 → 결제)와 관리자 기능을 최소 범위로 구현한다.

## 2. 프로젝트 개발범위
```
   - 회원가입
   - 로그인
   - Admin
     -- dashboard
     -- 회원관리
     -- 상품관리
     -- 주문관리
   - 상품리스트 
   - 상품상세 페이지
   - 주문페이지
   - 결제페이지 
```

## 3. 솔루션 구성 및 기술요소
  - server:  node.js, express, postgrsSQL
  - front: react, vite

## 4. 폴더 구조
 - server: server 폴더
 - front: client 폴더  

## 5.  출력 형식
- 코드 블록: 언어 태그 포함
- 설명: 한국어, 간결하게
- 변경사항: diff 형식으로 표시

## 6. 출력 요구사항
1. Service 클래스 
2. Controller 클래스 (API 엔드포인트)
3. DTO 클래스 (Request/Response)
4. 단위 테스트 

## 프로젝트 PRD
@docs\PRD.md

## 프로젝트공통
@instruction\core.md
