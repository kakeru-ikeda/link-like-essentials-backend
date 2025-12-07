import type { AccessoryService } from '../../../../src/application/services/AccessoryService';
import type { CardDetailService } from '../../../../src/application/services/CardDetailService';
import type { CardService } from '../../../../src/application/services/CardService';
import type { SongService } from '../../../../src/application/services/SongService';
import type { AuthUser } from '../../../../src/infrastructure/auth/AuthService';
import type { GraphQLContext } from '../../../../src/presentation/graphql/context';

// Note: authGuard uses module-level isDevelopment constant evaluated at load time
// Testing both environments requires separate test files or dynamic imports
// For unit tests, we test the logic paths that are reachable in test environment

describe('AuthGuard', () => {
  const mockDataSources = {
    cardService: {} as CardService,
    cardDetailService: {} as CardDetailService,
    accessoryService: {} as AccessoryService,
    songService: {} as SongService,
  };

  const mockUser: AuthUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
  };

  // Import fresh module for each test to reset isDevelopment
  let requireAuth: typeof import('../../../../src/presentation/middleware/authGuard').requireAuth;
  let getAuthenticatedUser: typeof import('../../../../src/presentation/middleware/authGuard').getAuthenticatedUser;

  beforeEach(async () => {
    // Clear the module cache to get fresh imports
    jest.resetModules();

    // Re-import to get fresh module with current NODE_ENV
    const authGuardModule = await import(
      '../../../../src/presentation/middleware/authGuard'
    );
    requireAuth = authGuardModule.requireAuth;
    getAuthenticatedUser = authGuardModule.getAuthenticatedUser;
  });

  describe('requireAuth', () => {
    it('認証済みユーザーの場合、エラーをスローしない', () => {
      const context: GraphQLContext = {
        user: mockUser,
        dataSources: mockDataSources,
      };

      expect(() => requireAuth(context)).not.toThrow();
    });

    it('テスト環境で未認証の場合、AuthenticationErrorをスローする', () => {
      // In test environment (NODE_ENV=test), isDevelopment is false
      const context: GraphQLContext = {
        user: undefined,
        dataSources: mockDataSources,
      };

      expect(() => requireAuth(context)).toThrow('認証が必要です');
    });
  });

  describe('getAuthenticatedUser', () => {
    it('認証済みユーザーを返す', () => {
      const context: GraphQLContext = {
        user: mockUser,
        dataSources: mockDataSources,
      };

      const user = getAuthenticatedUser(context);

      expect(user).toEqual(mockUser);
      expect(user?.uid).toBe('test-uid');
      expect(user?.email).toBe('test@example.com');
    });

    it('テスト環境で未認証の場合、AuthenticationErrorをスローする', () => {
      const context: GraphQLContext = {
        user: undefined,
        dataSources: mockDataSources,
      };

      expect(() => getAuthenticatedUser(context)).toThrow('認証が必要です');
    });
  });
});
