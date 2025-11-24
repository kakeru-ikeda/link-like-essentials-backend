import type { AccessoryService } from '../../../../src/application/services/AccessoryService';
import type { CardDetailService } from '../../../../src/application/services/CardDetailService';
import type { CardService } from '../../../../src/application/services/CardService';
import type { AuthUser } from '../../../../src/infrastructure/auth/AuthService';
import type { GraphQLContext } from '../../../../src/presentation/graphql/context';
import {
  getAuthenticatedUser,
  requireAuth,
} from '../../../../src/presentation/middleware/authGuard';

describe('AuthGuard', () => {
  const mockDataSources = {
    cardService: {} as CardService,
    cardDetailService: {} as CardDetailService,
    accessoryService: {} as AccessoryService,
  };

  const mockUser: AuthUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
  };

  describe('requireAuth', () => {
    it('認証済みユーザーの場合、エラーをスローしない', () => {
      const context: GraphQLContext = {
        user: mockUser,
        dataSources: mockDataSources,
      };

      expect(() => requireAuth(context)).not.toThrow();
    });

    // 開発環境（NODE_ENV=development）ではバイパスされるため、
    // テスト環境（NODE_ENV=test）では認証チェックが実行される
    // 実際の開発環境での動作確認は手動テストで行う
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

    // 開発環境での動作は手動テストで確認
  });
});
