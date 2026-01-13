# GitHub Copilot Instructions

## プロジェクト概要

Link Like Essentials Backend - GraphQLバックエンドシステム

**アーキテクチャ**: レイヤードアーキテクチャ（Presentation → Application → Domain ← Infrastructure）
**詳細設計**: `docs/DESIGN.md`を参照

---

## 技術スタック

- TypeScript 5.4.2 (Strict Mode)
- Apollo Server 4.10.0 + Prisma 5.11.0
- Redis (ioredis 5.3.2) + Firebase Auth
- Neon PostgreSQL

---

## 必須ルール

### TypeScript

- `strict: true`、`noUncheckedIndexedAccess: true`
- `any`型禁止（`unknown`使用）
- すべての関数に戻り値の型を明示
- privateフィールドは`private readonly`

### 命名規則

- ファイル: `CardService.ts`（クラス）、`cardResolver.ts`（関数）
- インターフェース: `ICardRepository`（I prefix必須）
- 定数: `MAX_CACHE_TTL`（UPPER_SNAKE_CASE）

### エラーハンドリング

カスタムエラークラスを使用（`domain/errors/AppError.ts`）

- `NotFoundError` - 404
- `ValidationError` - 400
- `AuthenticationError` - 401

---

## Prisma

### N+1対策（最重要）

```typescript
// ✅ 必ず include で関連データを取得
const cards = await this.prisma.card.findMany({
  where,
  include: {
    detail: true,      // 必須
    accessories: true,
  },
});

// ❌ ループ内でクエリは禁止
for (const card of cards) {
  const detail = await this.prisma.cardDetail.findUnique(...);
}
```

### 複合ユニークキー検索

```typescript
const card = await this.prisma.card.findUnique({
  where: {
    cardName_characterName: {
      cardName,
      characterName,
    },
  },
  include: { detail: true },
});
```

### ページネーション

Cursor-based pagination（`take: limit + 1`でhasNextPageチェック）

---

## GraphQL

### 必須ENUM（実データベース）

```graphql
enum Rarity {
  UR
  SR
  R
  DR
  BR
  LR
}
enum LimitedType {
  PERMANENT
  LIMITED
  SPRING_LIMITED
  SUMMER_LIMITED
  AUTUMN_LIMITED
  WINTER_LIMITED
  BIRTHDAY_LIMITED
  LEG_LIMITED
  BATTLE_LIMITED
  PARTY_LIMITED
  ACTIVITY_LIMITED
  BANGDREAM_LIMITED
  GRADUATE_LIMITED
  LOGIN_BONUS
  REWARD
}
enum StyleType {
  CHEERLEADER
  TRICKSTER
  PERFORMER
  MOODMAKER
  MOODOMAKER
}
enum ParentType {
  SPECIAL_APPEAL
  SKILL
  TRAIT
}
enum FavoriteMode {
  HAPPY
  MELLOW
  NEUTRAL
  NONE
}
```

### スキーマ構造

```graphql
type Card {
  id: ID!
  cardName: String!
  characterName: String!
  rarity: Rarity # nullable
  limited: LimitedType # nullable
  styleType: StyleType # nullable
  cardUrl: String
  isLocked: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  detail: CardDetail # 遅延ロード
  accessories: [Accessory!]!
}

type CardConnection {
  edges: [CardEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

input CardFilterInput {
  rarity: Rarity
  limited: LimitedType
  characterName: String
  styleType: StyleType
  cardName: String
  skillEffectContains: String
  traitEffectContains: String
  specialAppealEffectContains: String
  accessoryEffectContains: String
}
```

### Resolver

```typescript
// すべてのクエリで認証必須
export const cardResolvers = {
  Query: {
    cards: async (_, args, context) => {
      requireAuth(context); // 必須
      return await context.dataSources.cardService.findAll(...);
    },
  },
  Card: {
    // フィールドリゾルバー（遅延ロード）
    detail: async (parent, _, context) => {
      if (parent.detail) return parent.detail;
      return await context.dataSources.cardDetailService.findByCardId(parent.id);
    },
    // ENUM変換（日本語 → GraphQL ENUM）
    limited: (parent) => EnumMapper.toLimitedTypeEnum(parent.limited),
    styleType: (parent) => EnumMapper.toStyleTypeEnum(parent.styleType),
  },
};
```

---

## キャッシュ

### CardCacheStrategy使用（CacheService直接使用禁止）

```typescript
export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number): Promise<Card> {
    // 1. キャッシュ確認
    const cached = await this.cacheStrategy.getCard(id);
    if (cached) return cached;

    // 2. DBアクセス
    const card = await this.cardRepository.findById(id);
    if (!card) throw new NotFoundError(`Card with id ${id} not found`);

    // 3. キャッシュ保存
    await this.cacheStrategy.setCard(card);
    return card;
  }
}
```

### キャッシュキー命名

- `card:${id}` - 単一カード
- `card:name:${cardName}:${characterName}` - 複合キー
- `cards:list:${filterHash}` - 一覧（MD5ハッシュ）

### TTL

```typescript
const TTL = {
  CARD: 24 * 60 * 60, // 24時間
  CARD_LIST: 60 * 60, // 1時間
  CARD_DETAIL: 6 * 60 * 60, // 6時間
  STATS: 30 * 60, // 30分
} as const;
```

---

## 検索条件構築

```typescript
// アクセサリー効果検索（effectとtraitEffectの両方）
if (filter.accessoryEffectContains) {
  conditions.accessories = {
    some: {
      OR: [
        {
          effect: {
            contains: filter.accessoryEffectContains,
            mode: 'insensitive',
          },
        },
        {
          traitEffect: {
            contains: filter.accessoryEffectContains,
            mode: 'insensitive',
          },
        },
      ],
    },
  };
}
```

---

## 環境変数

必須: `LLES_DATABASE_URL`, `REDIS_HOST`, `REDIS_PORT`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `NODE_ENV`

```typescript
// バリデーション必須
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Environment variable ${key} is not set`);
  return value;
}
```

---

## CI/CD

PRマージ前に必ず成功: `npm run ci:local`（lint + format:check + type-check + test:unit）

---

## 実装チェックリスト

- [ ] Prismaクエリで`include`使用（N+1対策）
- [ ] CardCacheStrategy使用（CacheService直接使用禁止）
- [ ] すべてのResolverで`requireAuth(context)`実行
- [ ] ENUM変換は`EnumMapper`使用
- [ ] エラーはカスタムエラークラス使用
- [ ] 並列クエリは`Promise.all`使用
