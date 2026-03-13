---LOG---
작업: Phase 5 마무리 - 미들웨어 권한 체크 정리, 에러 핸들링 및 로딩 UI, 반응형 디자인 점검
입력 Context: instruction/init.md, instruction/core.md, CLAUDE.md
결과: 성공
생성 파일:
  - server/src/lib/AppError.ts (커스텀 에러 클래스)
  - client/src/components/ErrorBoundary.tsx (에러 바운더리)
  - client/src/components/ui/loading-spinner.tsx (LoadingSpinner, PageLoading)
  - client/src/components/ui/toast.tsx (ToastProvider, useToast)
  - client/src/pages/NotFoundPage.tsx (404 페이지)
주요 결정사항:
  - AppError 클래스로 서비스 레이어의 에러를 타입화하여 컨트롤러에서 수동 에러 분기 제거
  - 에러 미들웨어에서 AppError, ZodError, Multer 에러를 자동 분류 처리
  - API 404 핸들러를 /api/* 경로에 등록하여 존재하지 않는 API 요청에 대해 명확한 응답 제공
  - 모바일 반응형: Header 햄버거 메뉴, Admin 사이드바 오버레이 방식 토글
보완 필요:
  - toast 컴포넌트는 생성만 되었으며, 실제 mutation 성공/실패 시 호출하는 로직은 각 페이지에서 추가 가능
  - 코드 스플리팅(lazy import)으로 번들 크기 최적화 검토
교훈:
  - 서비스에서 AppError를 던지면 컨트롤러가 단순해지고, 에러 미들웨어 한 곳에서 일관된 응답 형식 보장
  - 반응형 디자인에서 고정 너비(w-60, w-72)는 모바일에서 오버플로우를 유발하므로 w-full sm:w-XX 패턴 사용
---END LOG---
