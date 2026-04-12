import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/domain/errors/AppError';
import { logger } from '@/infrastructure/logger/Logger';

export function restErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  logger.error('Unexpected REST API error', {
    error: err instanceof Error ? err.message : String(err),
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'サーバーエラーが発生しました',
    },
  });
}
