import type { AuthUser } from '@/infrastructure/auth/AuthService';
import type { GraphQLContext } from '@/presentation/graphql/context';

const createMockUser = (
  customClaims?: Record<string, unknown>
): AuthUser => ({
  uid: 'test-uid',
  email: 'test@example.com',
  emailVerified: true,
  customClaims: customClaims || {},
});

describe('adminGuard', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // モジュールキャッシュをクリアしてNODE_ENVの変更を反映
    jest.resetModules();
  });

  afterEach(() => {
    // NODE_ENVを元に戻す
    process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
  });

  describe('requireAdmin', () => {
    it('should throw AuthenticationError if user is not authenticated in production', () => {
      process.env.NODE_ENV = 'production';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: undefined,
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow('認証が必要です');
    });

    it('should throw ForbiddenError if user has no custom claims in production', () => {
      process.env.NODE_ENV = 'production';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: createMockUser({}),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow('管理者権限が必要です');
    });

    it('should throw ForbiddenError if user has admin claim set to false in production', () => {
      process.env.NODE_ENV = 'production';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: createMockUser({ admin: false }),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow('管理者権限が必要です');
    });

    it('should not throw if user has admin claim set to true in production', () => {
      process.env.NODE_ENV = 'production';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: createMockUser({ admin: true }),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).not.toThrow();
    });

    it('should throw ForbiddenError if customClaims is undefined in production', () => {
      process.env.NODE_ENV = 'production';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          emailVerified: true,
          customClaims: undefined,
        },
        dataSources: {} as GraphQLContext['dataSources'],
      };

      expect(() => requireAdmin(context)).toThrow('管理者権限が必要です');
    });

    it('should bypass authentication and authorization checks in development mode', () => {
      process.env.NODE_ENV = 'development';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: undefined,
        dataSources: {} as GraphQLContext['dataSources'],
      };

      // 開発環境では認証なしでもエラーをスローしない
      expect(() => requireAdmin(context)).not.toThrow();
    });

    it('should bypass admin check in development mode even for non-admin users', () => {
      process.env.NODE_ENV = 'development';
      const { requireAdmin } =
        require('@/presentation/middleware/adminGuard');

      const context: GraphQLContext = {
        user: createMockUser({ admin: false }),
        dataSources: {} as GraphQLContext['dataSources'],
      };

      // 開発環境では管理者権限なしでもエラーをスローしない
      expect(() => requireAdmin(context)).not.toThrow();
    });
  });
});
