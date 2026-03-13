import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/AppError';

export function errorMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // AppError: 비즈니스 로직 에러 (상태 코드 포함)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Zod 유효성 검증 에러
  if (err instanceof ZodError) {
    const fieldErrors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      message: '입력값이 올바르지 않습니다.',
      errors: fieldErrors,
    });
    return;
  }

  // Multer 파일 크기 초과 에러
  if (err.message?.includes('File too large') || err.message?.includes('이미지 파일만')) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // 알 수 없는 서버 에러
  console.error('[Error]', err.message, err.stack);

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? '서버 오류가 발생했습니다.'
      : err.message,
  });
}

/** 매칭되지 않은 라우트 404 핸들러 */
export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: '요청하신 API를 찾을 수 없습니다.',
  });
}
