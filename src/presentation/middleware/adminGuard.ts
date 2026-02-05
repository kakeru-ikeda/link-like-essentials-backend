import { AuthenticationError, ForbiddenError } from '@/domain/errors/AppError';
import type { GraphQLContext } from '@/presentation/graphql/context';

/**
 * 管理者認可ガード
 * 管理者専用のMutation操作を実行する前に呼び出す
 *
 * Firebase Authのカスタムクレームで admin: true が設定されているユーザーのみ許可
 *
 * @param context - GraphQLContext
 * @throws {AuthenticationError} ユーザーが認証されていない場合
 * @throws {ForbiddenError} ユーザーが管理者権限を持っていない場合
 */
export function requireAdmin(context: GraphQLContext): void {
  // まず認証チェック
  if (!context.user) {
    throw new AuthenticationError('認証が必要です');
  }

  // 管理者権限チェック
  // Firebase Auth のカスタムクレームで admin: true が設定されているかチェック
  const customClaims = context.user.customClaims;
  if (!customClaims || customClaims['admin'] !== true) {
    throw new ForbiddenError(
      '管理者権限が必要です。この操作は管理者のみ実行できます。'
    );
  }
}
