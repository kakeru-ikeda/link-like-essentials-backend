import { AuthenticationError, ForbiddenError } from '@/domain/errors/AppError';
import type { AuthUser } from '@/infrastructure/auth/AuthService';
import type { GraphQLContext } from '@/presentation/graphql/context';
import { requireAdmin } from '@/presentation/middleware/adminGuard';

const createMockUser = (
  customClaims?: Record<string, unknown>
): AuthUser => ({
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  customClaims: customClaims || {},
});

describe('adminGuard', () => {
  describe('requireAdmin', () => {
    it('should throw AuthenticationError if user is not authenticated', () => {
      const context: GraphQLContext = {
        user: undefined,
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow(AuthenticationError);
      expect(() => requireAdmin(context)).toThrow('認証が必要です');
    });

    it('should throw ForbiddenError if user has no custom claims', () => {
      const context: GraphQLContext = {
        user: createMockUser({}),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow(ForbiddenError);
      expect(() => requireAdmin(context)).toThrow(
        '管理者権限が必要です。この操作は管理者のみ実行できます。'
      );
    });

    it('should throw ForbiddenError if user has admin claim set to false', () => {
      const context: GraphQLContext = {
        user: createMockUser({ admin: false }),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow(ForbiddenError);
      expect(() => requireAdmin(context)).toThrow(
        '管理者権限が必要です。この操作は管理者のみ実行できます。'
      );
    });

    it('should not throw if user has admin claim set to true', () => {
      const context: GraphQLContext = {
        user: createMockUser({ admin: true }),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).not.toThrow();
    });

    it('should throw ForbiddenError if customClaims is undefined', () => {
      const context: GraphQLContext = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: true,
          customClaims: undefined,
        },
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow(ForbiddenError);
    });
  });
});
