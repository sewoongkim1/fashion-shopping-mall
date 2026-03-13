export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string) {
    return new AppError(400, message);
  }

  static unauthorized(message = '인증이 필요합니다.') {
    return new AppError(401, message);
  }

  static forbidden(message = '접근 권한이 없습니다.') {
    return new AppError(403, message);
  }

  static notFound(message = '리소스를 찾을 수 없습니다.') {
    return new AppError(404, message);
  }

  static conflict(message: string) {
    return new AppError(409, message);
  }
}
