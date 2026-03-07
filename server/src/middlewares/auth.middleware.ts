import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import type { AuthRequest } from '../types';

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.access_token;

  if (!token) {
    res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    return;
  }

  try {
    const user = verifyAccessToken(token);
    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: '유효하지 않은 토큰입니다.' });
  }
}
