export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '入力値が不正です') {
    super(message, 'BAD_USER_INPUT', 400);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'アクセスが拒否されました') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'サーバーエラーが発生しました') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
  }
}
