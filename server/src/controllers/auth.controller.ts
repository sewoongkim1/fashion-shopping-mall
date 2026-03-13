import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken, COOKIE_OPTIONS } from '../lib/jwt';
import type { AuthRequest } from '../types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.cookie('access_token', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
      res.cookie('refresh_token', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        data: result.user,
        message: '회원가입이 완료되었습니다.',
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.cookie('access_token', result.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
      res.cookie('refresh_token', result.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        data: result.user,
        message: '로그인 성공',
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, _next: NextFunction) {
    const token = req.cookies?.refresh_token;

    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token이 없습니다.' });
      return;
    }

    try {
      const user = verifyRefreshToken(token);
      const accessToken = generateAccessToken(user);

      res.cookie('access_token', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });

      res.json({ success: true, message: '토큰이 갱신되었습니다.' });
    } catch {
      res.status(401).json({ success: false, message: '유효하지 않은 Refresh token입니다.' });
    }
  }

  async logout(_req: Request, res: Response) {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);

    res.json({ success: true, message: '로그아웃 되었습니다.' });
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: '인증이 필요합니다.' });
        return;
      }

      const user = await authService.getMe(req.user.id);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
