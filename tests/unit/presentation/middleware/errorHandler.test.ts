import type { GraphQLError, GraphQLFormattedError } from 'graphql';

import { AppError, NotFoundError } from '@/domain/errors/AppError';
import { logger } from '@/infrastructure/logger/Logger';
import { SentryService } from '@/infrastructure/monitoring/SentryService';
import { formatError } from '@/presentation/middleware/errorHandler';

jest.mock('@/infrastructure/logger/Logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/infrastructure/monitoring/SentryService', () => ({
  SentryService: {
    captureException: jest.fn(),
  },
}));

describe('errorHandler', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.clearAllMocks();
  });

  describe('formatError', () => {
    it('should format AppError correctly', () => {
      const originalError = new NotFoundError('Card not found');
      const graphqlError = {
        originalError,
      } as unknown as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Something went wrong',
        locations: [{ line: 1, column: 1 }],
        path: ['card'],
      };

      const result = formatError(formattedError, graphqlError);

      expect(result.message).toBe('Card not found');
      expect(result.extensions).toEqual({
        code: 'NOT_FOUND',
        statusCode: 404,
      });
      expect(result.locations).toEqual([{ line: 1, column: 1 }]);
      expect(result.path).toEqual(['card']);
    });

    it('should format custom AppError correctly', () => {
      const originalError = new AppError('Custom error', 'CUSTOM_CODE', 418);
      const graphqlError = {
        originalError,
      } as unknown as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Something went wrong',
      };

      const result = formatError(formattedError, graphqlError);

      expect(result.message).toBe('Custom error');
      expect(result.extensions).toEqual({
        code: 'CUSTOM_CODE',
        statusCode: 418,
      });
    });

    it('should return generic error in production for non-AppError', () => {
      process.env.NODE_ENV = 'production';

      const originalError = new Error('Internal error details');
      const graphqlError = {
        originalError,
      } as unknown as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Internal error details',
        extensions: { code: 'SOME_CODE' },
        path: ['query'],
      };

      const result = formatError(formattedError, graphqlError);

      expect(result.message).toBe('Internal server error');
      expect(result.extensions).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
      });
      expect(logger.error).toHaveBeenCalledWith('Unexpected GraphQL error', {
        message: formattedError.message,
        path: formattedError.path,
        extensions: formattedError.extensions,
      });
      expect(SentryService.captureException).toHaveBeenCalledWith(
        originalError,
        { path: formattedError.path }
      );
    });

    it('should return original error in non-production for non-AppError', () => {
      process.env.NODE_ENV = 'test';

      const originalError = new Error('Internal error details');
      const graphqlError = {
        originalError,
      } as unknown as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Internal error details',
        extensions: { code: 'SOME_CODE' },
        path: ['query'],
      };

      const result = formatError(formattedError, graphqlError);

      expect(result).toEqual(formattedError);
      expect(logger.error).toHaveBeenCalledWith('Unexpected GraphQL error', {
        message: formattedError.message,
        path: formattedError.path,
        extensions: formattedError.extensions,
      });
      expect(SentryService.captureException).not.toHaveBeenCalled();
    });

    it('should handle error without originalError', () => {
      process.env.NODE_ENV = 'test';

      const graphqlError = {} as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Syntax error',
        extensions: { code: 'SYNTAX_ERROR' },
      };

      const result = formatError(formattedError, graphqlError);

      expect(result).toEqual(formattedError);
      expect(logger.error).toHaveBeenCalledWith('Unexpected GraphQL error', {
        message: formattedError.message,
        path: formattedError.path,
        extensions: formattedError.extensions,
      });
      expect(SentryService.captureException).not.toHaveBeenCalled();
    });

    it('should send non-Error originalError to Sentry as Error in production', () => {
      process.env.NODE_ENV = 'production';

      const graphqlError = {
        originalError: 'unexpected',
      } as unknown as GraphQLError;

      const formattedError: GraphQLFormattedError = {
        message: 'Unexpected failure',
        path: ['query'],
      };

      formatError(formattedError, graphqlError);

      const captureCalls = (
        SentryService.captureException as jest.Mock
      ).mock.calls;
      const capturedError = captureCalls[0]?.[0] as Error | undefined;

      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError?.message).toBe('Unexpected failure');
    });
  });
});
