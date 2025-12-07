import {
  AppError,
  NotFoundError,
  AuthenticationError,
  ValidationError,
  ForbiddenError,
  InternalServerError,
} from '@/domain/errors/AppError';

describe('AppError', () => {
  describe('AppError base class', () => {
    it('should create an error with custom message, code, and status', () => {
      const error = new AppError('Custom error', 'CUSTOM_CODE', 418);

      expect(error.message).toBe('Custom error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(418);
      expect(error.name).toBe('AppError');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default status code 500 if not provided', () => {
      const error = new AppError('Error message', 'ERROR_CODE');

      expect(error.statusCode).toBe(500);
    });

    it('should have proper prototype chain', () => {
      const error = new AppError('Test', 'TEST', 500);

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error with default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('リソースが見つかりません');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create a 404 error with custom message', () => {
      const error = new NotFoundError('Card not found');

      expect(error.message).toBe('Card not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('AuthenticationError', () => {
    it('should create a 401 error with default message', () => {
      const error = new AuthenticationError();

      expect(error.message).toBe('認証が必要です');
      expect(error.code).toBe('UNAUTHENTICATED');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create a 401 error with custom message', () => {
      const error = new AuthenticationError('Invalid token');

      expect(error.message).toBe('Invalid token');
      expect(error.code).toBe('UNAUTHENTICATED');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ValidationError', () => {
    it('should create a 400 error with default message', () => {
      const error = new ValidationError();

      expect(error.message).toBe('入力値が不正です');
      expect(error.code).toBe('BAD_USER_INPUT');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create a 400 error with custom message', () => {
      const error = new ValidationError('Invalid input format');

      expect(error.message).toBe('Invalid input format');
      expect(error.code).toBe('BAD_USER_INPUT');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a 403 error with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('アクセスが拒否されました');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create a 403 error with custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.code).toBe('FORBIDDEN');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('InternalServerError', () => {
    it('should create a 500 error with default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('サーバーエラーが発生しました');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('InternalServerError');
      expect(error).toBeInstanceOf(AppError);
    });

    it('should create a 500 error with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });
});
