import { AuthenticationError } from '@/domain/errors/AppError';
import type { AuthUser } from '@/infrastructure/auth/AuthService';
import type { GraphQLContext } from '@/presentation/graphql/context';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 認証ガード
 * GraphQL Resolverで認証必須の処理を実行する前に呼び出す
 *
 * 開発環境（NODE_ENV=development）では認証チェックをバイパスする
 *
 * @param context - GraphQLContext
 * @throws {AuthenticationError} ユーザーが認証されていない場合（本番環境のみ）
 */
export function requireAuth(context: GraphQLContext): void {
  // 開発環境では認証チェックをスキップ
  if (isDevelopment) {
    return;
  }

  if (!context.user) {
    throw new AuthenticationError('認証が必要です');
  }
}

/**
 * 認証済みユーザーを取得
 * 認証されていない場合はエラーをスロー
 *
 * 開発環境（NODE_ENV=development）では認証チェックをバイパスし、
 * ユーザーが存在しない場合はundefinedを返す
 *
 * @param context - GraphQLContext
 * @returns 認証済みユーザー（開発環境では undefined の可能性あり）
 * @throws {AuthenticationError} ユーザーが認証されていない場合（本番環境のみ）
 */
export function getAuthenticatedUser(
  context: GraphQLContext
): AuthUser | undefined {
  // 開発環境ではユーザーの有無に関わらず返す
  if (isDevelopment) {
    return context.user;
  }

  requireAuth(context);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return context.user!;
}
