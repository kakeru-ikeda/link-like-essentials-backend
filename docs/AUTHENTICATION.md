# 認証システム

## 概要

Link Like Essentials BackendはFirebase Authenticationを使用した認証システムを実装しています。

**重要**: 開発環境（`NODE_ENV=development`）では認証チェックがバイパスされ、すべてのGraphQLクエリが認証なしで実行可能です。本番環境では必ずFirebase IDトークンが必要です。

---

## アーキテクチャ

```
Request → Context作成 → 認証ガード → Resolver → Response
           ↓
      Token検証
      (Firebase Auth)
```

### コンポーネント

1. **AuthService** (`infrastructure/auth/AuthService.ts`)
   - Firebase IDトークンの検証
   - ユーザー情報の取得

2. **AuthGuard** (`presentation/middleware/authGuard.ts`)
   - Resolver内での認証チェック
   - 未認証時のエラースロー

3. **GraphQLContext** (`presentation/graphql/context.ts`)
   - リクエストごとのユーザー情報保持

---

## 実装詳細

### 1. トークン検証フロー

```typescript
// src/config/context.ts
export async function createContext(req: Request): Promise<GraphQLContext> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user: GraphQLContext['user'] | undefined;

  if (token) {
    try {
      const authService = new AuthService();
      user = await authService.verifyAndGetUser(token);
    } catch (error) {
      logger.warn('Token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    user,
    dataSources: {
      /* ... */
    },
  };
}
```

**ポイント**:

- トークンが提供されない場合、`user`は`undefined`
- トークン検証失敗時もエラーをスローせず、`user`を`undefined`に設定
- 実際の認証チェックはResolverで実施

### 2. Resolverでの認証チェック

```typescript
// src/presentation/graphql/resolvers/cardResolver.ts
import { requireAuth } from '@/presentation/middleware/authGuard';

export const cardResolvers = {
  Query: {
    cards: async (_, args, context) => {
      requireAuth(context); // 🔒 認証必須

      const { first, after, filter, sort } = args;
      return await context.dataSources.cardService.findAll(filter, sort, {
        first,
        after,
      });
    },
  },
};
```

**すべてのQueryで認証ガードを実装**:

- `cards`
- `card`
- `cardByName`
- `cardStats`
- `cardDetail`
- `accessories`

### 3. 認証ガード関数

```typescript
// src/presentation/middleware/authGuard.ts

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 認証ガード
 * GraphQL Resolverで認証必須の処理を実行する前に呼び出す
 *
 * 開発環境（NODE_ENV=development）では認証チェックをバイパスする
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
 *
 * 開発環境（NODE_ENV=development）では認証チェックをバイパスし、
 * ユーザーが存在しない場合はundefinedを返す
 */
export function getAuthenticatedUser(
  context: GraphQLContext
): AuthUser | undefined {
  // 開発環境ではユーザーの有無に関わらず返す
  if (isDevelopment) {
    return context.user;
  }

  requireAuth(context);
  return context.user!;
}
```

**環境別の動作**:

| 環境   | NODE_ENV    | 認証チェック | トークンなしの場合 |
| ------ | ----------- | ------------ | ------------------ |
| 開発   | development | バイパス     | ✅ アクセス可能    |
| テスト | test        | 実施         | ❌ エラー          |
| 本番   | production  | 実施         | ❌ エラー          |

---

## エラーハンドリング

### 認証エラー

**ケース1: トークンなし**

```json
{
  "errors": [
    {
      "message": "認証が必要です",
      "extensions": {
        "code": "AUTHENTICATION_ERROR"
      }
    }
  ]
}
```

**ケース2: 無効なトークン**

```json
{
  "errors": [
    {
      "message": "認証が必要です",
      "extensions": {
        "code": "AUTHENTICATION_ERROR"
      }
    }
  ]
}
```

**ケース3: 期限切れトークン**

```json
{
  "errors": [
    {
      "message": "認証が必要です",
      "extensions": {
        "code": "AUTHENTICATION_ERROR"
      }
    }
  ]
}
```

### エラークラス階層

```
AppError (基底クラス)
  └─ AuthenticationError (401)
  └─ NotFoundError (404)
  └─ ValidationError (400)
```

---

## 使用方法

### クライアント側実装

#### 1. Firebase IDトークン取得

```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  // トークンをGraphQLリクエストに含める
}
```

#### 2. GraphQLリクエスト

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getAuth } from 'firebase/auth';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    return { headers };
  }

  const token = await user.getIdToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

#### 3. curlでのテスト

```bash
# 1. Firebase IDトークン取得（Firebaseコンソールまたはテストツール）
export TOKEN="eyJhbGciOiJSUzI1NiIsImtpZCI6..."

# 2. GraphQLリクエスト
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "{ cards(first: 10) { edges { node { id cardName } } totalCount } }"
  }'
```

---

## テスト

### ユニットテスト

認証ガードのテスト: `tests/unit/presentation/middleware/authGuard.test.ts`

```typescript
describe('AuthGuard', () => {
  describe('requireAuth', () => {
    it('認証済みユーザーの場合、エラーをスローしない', () => {
      const context = { user: mockUser, dataSources: mockDataSources };
      expect(() => requireAuth(context)).not.toThrow();
    });

    it('未認証の場合、AuthenticationErrorをスローする', () => {
      const context = { user: undefined, dataSources: mockDataSources };
      expect(() => requireAuth(context)).toThrow(AuthenticationError);
    });
  });
});
```

### テスト実行

```bash
npm run test:unit -- tests/unit/presentation/middleware/authGuard.test.ts
```

---

## セキュリティベストプラクティス

### 1. トークン管理

✅ **推奨**:

- トークンはメモリまたはsecure cookies に保存
- 定期的にトークンをリフレッシュ
- ログアウト時にトークンを破棄

❌ **非推奨**:

- localStorageへの保存（XSS脆弱性）
- トークンをURLパラメータに含める
- 長期間同じトークンを使用

### 2. Firebase設定

```typescript
// firebase-service-account.json は .gitignore に追加
// 環境変数で管理
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
```

### 3. レート制限

将来的な実装予定:

- IPアドレスベースのレート制限
- ユーザーベースのレート制限
- エンドポイント別の制限

---

## トラブルシューティング

### 問題1: "認証が必要です"エラー

**原因**:

- トークンが提供されていない
- トークンが無効
- トークンが期限切れ

**解決方法**:

1. トークンが正しくヘッダーに含まれているか確認
2. `Bearer `プレフィックスが正しいか確認
3. トークンをリフレッシュ

### 問題2: トークン検証失敗（ログに警告）

**原因**:

- Firebase設定が正しくない
- service accountファイルが見つからない

**解決方法**:

1. `FIREBASE_SERVICE_ACCOUNT_PATH`環境変数を確認
2. service accountファイルの権限を確認
3. Firebaseプロジェクト設定を確認

### 問題3: CORS エラー

**原因**:

- フロントエンドのoriginがCORS設定に含まれていない

**解決方法**:

```typescript
// src/server.ts
app.use(
  cors({
    origin: isDevelopment
      ? ['http://localhost:3000', 'https://studio.apollographql.com']
      : LLES_CORS_ORIGIN,
    credentials: true,
  })
);
```

---

## 環境変数

認証に必要な環境変数:

```env
# Firebase Authentication
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# CORS（本番環境）
LLES_CORS_ORIGIN=https://your-frontend-domain.com

# Node環境（重要: 開発環境では認証バイパス）
NODE_ENV=development  # 開発環境: 認証なしでアクセス可能
NODE_ENV=production   # 本番環境: 認証必須
```

**開発環境の注意事項**:

- `NODE_ENV=development`の場合、認証チェックは完全にバイパスされます
- これにより、Firebaseトークンなしでローカル開発が可能です
- 本番環境では必ず`NODE_ENV=production`を設定してください

---

## 今後の拡張

### 計画中の機能

1. **ロールベース認証**
   - admin, user, readonly などのロール定義
   - ロールごとのアクセス制御

2. **APIキー認証**
   - サーバー間通信用のAPIキー
   - Read-onlyアクセス用の公開キー

3. **レート制限**
   - ユーザーごとのリクエスト制限
   - エンドポイント別の制限

4. **監査ログ**
   - 認証成功/失敗のログ記録
   - 不審なアクセスの検出

---

## 参考資料

- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Apollo Server Authentication](https://www.apollographql.com/docs/apollo-server/security/authentication/)
- [GraphQL Security](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
