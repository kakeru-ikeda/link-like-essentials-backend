import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import * as Sentry from '@sentry/node';

import { AppError } from '@/domain/errors/AppError';
import { logger } from '@/infrastructure/logger/Logger';
import { SentryService } from '@/infrastructure/monitoring/SentryService';
import type { GraphQLContext } from '@/presentation/graphql/context';
import { formatError } from '@/presentation/middleware/errorHandler';

import { schema } from './schema';

const isDevelopment = process.env.NODE_ENV === 'development';

export const apolloServer = new ApolloServer<GraphQLContext>({
  schema,
  formatError,
  plugins: [
    // Development用のPlayground
    isDevelopment
      ? ApolloServerPluginLandingPageLocalDefault({ embed: true })
      : ApolloServerPluginLandingPageLocalDefault({ embed: false }),

    // ログプラグイン
    {
      // eslint-disable-next-line @typescript-eslint/require-await
      async requestDidStart() {
        return {
          // eslint-disable-next-line @typescript-eslint/require-await
          async didEncounterErrors(requestContext) {
            logger.error('GraphQL Error', {
              query: requestContext.request.query,
              variables: requestContext.request.variables,
              errors: requestContext.errors,
            });
          },
        };
      },
    },

    // Sentryトレーシングプラグイン
    {
      // eslint-disable-next-line @typescript-eslint/require-await
      async requestDidStart(requestContext) {
        const operation =
          requestContext.request.operationName || 'UnknownOperation';

        return {
          // eslint-disable-next-line @typescript-eslint/require-await
          async didEncounterErrors(ctx) {
            ctx.errors?.forEach((error) => {
              const originalError = error.originalError;

              // AppErrorの場合、statusCodeで判定
              if (originalError instanceof AppError) {
                const level =
                  originalError.statusCode >= 400 &&
                  originalError.statusCode < 500
                    ? 'warning'
                    : 'error';

                Sentry.withScope((scope) => {
                  scope.setLevel(level);
                  scope.setTag('graphql.operation', operation);
                  scope.setContext('graphql', {
                    query: ctx.request.query,
                    variables: ctx.request.variables,
                  });

                  SentryService.captureException(originalError, {
                    path: error.path,
                    statusCode: originalError.statusCode,
                  });
                });
              } else {
                // 予期しないエラーはerrorレベル
                Sentry.withScope((scope) => {
                  scope.setTag('graphql.operation', operation);
                  scope.setContext('graphql', {
                    query: ctx.request.query,
                    variables: ctx.request.variables,
                  });

                  SentryService.captureException(
                    originalError || new Error(error.message),
                    { path: error.path }
                  );
                });
              }
            });
          },
        };
      },
    },
  ],
  introspection: isDevelopment,
});
