# GitHub Copilot Instructions

## プロジェクト概要

Link Like Essentials Backend - GraphQLバックエンドシステム

**目的**: 収集したカードデータをWebフロントエンドに提供する

**詳細設計**: `docs/DESIGN.md`を参照

---

## アーキテクチャ

**レイヤードアーキテクチャ（厳密に責務分離）**

```
src/
├── presentation/      # GraphQL Schema & Resolvers
├── application/       # Services (ビジネスロジック)
├── domain/           # Entities & Repository Interfaces
└── infrastructure/   # DB, Cache, Auth実装
```

**依存方向**: Presentation → Application → Domain ← Infrastructure

**重要**:

- Domainは他の層に依存しない
- InfrastructureはDomainのインターフェースを実装
- 上位層が下位層のインターフェースに依存（DIP）

---

## 技術スタック

- **TypeScript 5.x** (Strict Mode)
- **Node.js 20+**
- **Apollo Server 4.x** - GraphQL
- **Prisma** - ORM
- **Redis (ioredis)** - キャッシュ
- **Firebase Admin** - 認証
- **Neon PostgreSQL** - データベース
- **Jest** - テスト

---

## コーディング規約

### 1. TypeScript

```typescript
// ✅ Good
export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number): Promise<Card | null> {
    // implementation
  }
}

// ❌ Bad - any使用禁止
async findById(id: any): Promise<any> { }

// ❌ Bad - publicフィールドは避ける
constructor(public cardRepository: ICardRepository) {}
```

**必須**:

- `strict: true`
- `any`型禁止（`unknown`を使用）
- `!`（non-null assertion）は最小限に
- すべての関数に戻り値の型を明示

### 2. 命名規則

```typescript
// ファイル名: PascalCase (クラス・型), camelCase (関数・変数)
CardService.ts;
cardResolver.ts;

// クラス: PascalCase
class CardService {}

// インターフェース: "I" prefix + PascalCase
interface ICardRepository {}

// 型: PascalCase
type CardFilterInput = {};

// 変数・関数: camelCase
const cardService = new CardService();
async function findCard() {}

// 定数: UPPER_SNAKE_CASE
const MAX_CACHE_TTL = 3600;

// Enum: PascalCase (型), UPPER_CASE (値)
enum Rarity {
  UR = 'UR',
  SR = 'SR',
}
```

### 3. インポート順序

```typescript
// 1. Node.js標準モジュール
import * as fs from 'fs';

// 2. 外部パッケージ
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// 3. 内部モジュール（絶対パス）
import { ICardRepository } from '@/domain/repositories/ICardRepository';
import { Card } from '@/domain/entities/Card';

// 4. 相対パス（同一レイヤー内）
import { CacheService } from '../cache/CacheService';
```

### 4. エラーハンドリング

```typescript
// ✅ Good - カスタムエラークラス使用
import { NotFoundError } from '@/domain/errors/AppError';

async findById(id: number): Promise<Card> {
  const card = await this.repository.findById(id);
  if (!card) {
    throw new NotFoundError(`Card with id ${id} not found`);
  }
  return card;
}

// ❌ Bad - 汎用Error使用
throw new Error('Not found');
```

**エラークラス**: `domain/errors/AppError.ts`

- `AppError` - 基底クラス
- `NotFoundError` - 404
- `ValidationError` - 400
- `AuthenticationError` - 401

---

## データベース（Prisma）

### モデル定義

```prisma
// 必ずスネークケースのカラムにマッピング
model Card {
  id            Int       @id @default(autoincrement())
  cardName      String    @map("card_name")
  characterName String    @map("character_name")

  @@map("cards")  // テーブル名
}
```

### クエリ

```typescript
// ✅ Good - includeで関連データ取得（N+1対策）
const card = await prisma.card.findUnique({
  where: { id },
  include: {
    detail: true,
    accessories: true,
  },
});

// ✅ Good - トランザクション
await prisma.$transaction(async (tx) => {
  await tx.card.create({ data: cardData });
  await tx.cardDetail.create({ data: detailData });
});

// ❌ Bad - N+1問題
const cards = await prisma.card.findMany();
for (const card of cards) {
  const detail = await prisma.cardDetail.findUnique({
    where: { cardId: card.id },
  });
}
```

---

## キャッシュ戦略

### TTL設定

```typescript
const TTL = {
  CARD: 24 * 60 * 60, // 24時間
  CARD_LIST: 60 * 60, // 1時間
  CARD_DETAIL: 6 * 60 * 60, // 6時間
  STATS: 30 * 60, // 30分
};
```

### キャッシュキー命名

```typescript
// パターン: {entity}:{identifier}
`card:${id}` // 単一
`card:name:${cardName}:${char}` // 複合キー
`cards:list:${hash}` // 一覧（フィルターのハッシュ）
`cardDetail:${cardId}``stats:cards`;
```

### 実装パターン

```typescript
async findById(id: number): Promise<Card | null> {
  // 1. キャッシュチェック
  const cached = await this.cache.get<Card>(`card:${id}`);
  if (cached) return cached;

  // 2. DB取得
  const card = await this.repository.findById(id);

  // 3. キャッシュ保存
  if (card) {
    await this.cache.set(`card:${id}`, card, TTL.CARD);
  }

  return card;
}
```

---

## GraphQL

### スキーマ定義

```graphql
# 実データに基づくENUM定義（docs/DESIGN.md参照）
enum Rarity {
  UR
  SR
  R
  DR
  BR
  LR
}

# Nullable vs Non-nullable
type Card {
  id: ID! # 必須
  cardName: String! # 必須
  rarity: Rarity # オプショナル（NULL許容）
}

# Connection pattern（ページネーション）
type CardConnection {
  edges: [CardEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

### Resolver実装

```typescript
// ✅ Good - サービス層を呼び出す
export const cardResolvers: QueryResolvers = {
  card: async (_, { id }, context) => {
    return await context.dataSources.cardService.findById(parseInt(id));
  },
};

// ✅ Good - フィールドリゾルバー（遅延ロード）
export const cardFieldResolvers: CardResolvers = {
  detail: async (parent, _, context) => {
    if (parent.detail) return parent.detail;
    return await context.dataSources.cardDetailService.findByCardId(parent.id);
  },
};

// ❌ Bad - Resolver内でDBアクセス
card: async (_, { id }, context) => {
  return await prisma.card.findUnique({ where: { id } });
};
```

---

## テスト

### ディレクトリ構造

```
tests/
├── unit/              # ユニットテスト（80%カバレッジ目標）
├── integration/       # 統合テスト
└── e2e/              # E2Eテスト
```

### モック

```typescript
// ✅ Good - interfaceをモック
const mockRepository: jest.Mocked<ICardRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
};

// テスト
describe('CardService', () => {
  it('should return card from cache', async () => {
    mockCache.get.mockResolvedValue(mockCard);

    const result = await service.findById(1);

    expect(result).toEqual(mockCard);
    expect(mockRepository.findById).not.toHaveBeenCalled();
  });
});
```

---

## CI/CD

### 必須条件（GitHub Actions）

```bash
# PRマージ前に必ず成功すること
npm run lint          # ESLint (max-warnings: 0)
npm run format:check  # Prettier
npm run type-check    # TypeScript
npm run test:unit     # Jest
```

### ローカル確認

```bash
# CI実行前にローカルで確認
npm run ci:local
```

---

## データマッピング

### DB → Domain Entity

```typescript
// Repository層でマッピング
private mapToEntity(row: PrismaCard): Card {
  return {
    id: row.id,
    rarity: row.rarity as Rarity,  // ENUM変換
    cardName: row.cardName,
    characterName: row.characterName,
    // ...
  };
}
```

### 日本語 → GraphQL ENUM

```typescript
// EnumMapperを使用（docs/DESIGN.md参照）
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';

const limitedEnum = EnumMapper.toLimitedTypeEnum('恒常'); // 'PERMANENT'
const styleEnum = EnumMapper.toStyleTypeEnum('トリックスター'); // 'TRICKSTER'
```

---

## 環境変数

```typescript
// ✅ Good - バリデーション付き
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

const LLES_DATABASE_URL = getEnvVar('LLES_DATABASE_URL');

// ❌ Bad - 直接参照
const url = process.env.LLES_DATABASE_URL;
```

**必須環境変数**:

```env
LLES_DATABASE_URL          # Neon PostgreSQL
REDIS_HOST
REDIS_PORT
FIREBASE_SERVICE_ACCOUNT_PATH
NODE_ENV
```

---

## パフォーマンス

### 1. DataLoader（N+1対策）

```typescript
// ✅ Good - バッチロード
const loader = new DataLoader(async (ids: number[]) => {
  const cards = await prisma.card.findMany({
    where: { id: { in: [...ids] } },
  });
  return ids.map((id) => cards.find((c) => c.id === id) || null);
});
```

### 2. キャッシュ優先

```typescript
// 1. キャッシュ確認
// 2. DBアクセス
// 3. キャッシュ保存
```

### 3. Prisma最適化

```typescript
// select句で必要なフィールドのみ
const cards = await prisma.card.findMany({
  select: {
    id: true,
    cardName: true,
    characterName: true,
  },
});
```

---

## セキュリティ

### 1. 認証確認

```typescript
// GraphQLコンテキストでユーザー確認
if (!context.user) {
  throw new AuthenticationError('認証が必要です');
}
```

### 2. 入力検証

```typescript
// ✅ Good - バリデーション
if (!Number.isInteger(id) || id <= 0) {
  throw new ValidationError('Invalid ID');
}

// GraphQL Input型でも検証
input CardFilterInput {
  cardName: String  # 最大255文字など
}
```

---

## 参考資料

**詳細設計**: `docs/DESIGN.md`
**CI/CD**: `docs/CI_CD.md`

## 実装時の注意

1. **レイヤー間の依存を守る** - 下位層は上位層を知らない
2. **インターフェースに依存** - 具象クラスに直接依存しない
3. **キャッシュを活用** - DBアクセスを最小化
4. **テストを書く** - 80%カバレッジ目標
5. **型安全性** - `any`禁止、`strict: true`
6. **エラーハンドリング** - カスタムエラークラス使用
7. **CI通過が必須** - Lint, Test, Type Check
