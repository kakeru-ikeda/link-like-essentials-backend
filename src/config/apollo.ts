import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';


import { logger } from '@/infrastructure/logger/Logger';
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
  ],
  introspection: isDevelopment,
});
