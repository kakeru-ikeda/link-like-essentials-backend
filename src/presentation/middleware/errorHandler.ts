import type { GraphQLError, GraphQLFormattedError } from 'graphql';

import { AppError } from '@/domain/errors/AppError';
import { logger } from '@/infrastructure/logger/Logger';

export function formatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  const originalError = (error as GraphQLError).originalError;

  // アプリケーションエラーの場合
  if (originalError instanceof AppError) {
    return {
      message: originalError.message,
      extensions: {
        code: originalError.code,
        statusCode: originalError.statusCode,
      },
      locations: formattedError.locations,
      path: formattedError.path,
    };
  }

  // その他のエラー
  logger.error('Unexpected GraphQL error', {
    message: formattedError.message,
    path: formattedError.path,
    extensions: formattedError.extensions,
  });

  // 本番環境では詳細を隠す
  if (process.env.NODE_ENV === 'production') {
    return {
      message: 'Internal server error',
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }

  return formattedError;
}
