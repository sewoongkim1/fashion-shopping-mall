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
