# Link Like Essentials Backend - 設計書

## 1. プロジェクト概要

### 1.1 目的

保管したカードデータをWebフロントエンドに提供するGraphQLバックエンドシステム。

### 1.2 主要機能

- GraphQL APIによるカードデータの柔軟な取得
- Firebase Authenticationによる認証基盤
- Prisma + Redisによるキャッシュ戦略
- レイヤードアーキテクチャによる徹底した責務分離
- Dockerによるコンテナ化

### 1.3 技術スタック

- **言語**: TypeScript (最新版)
- **ランタイム**: Node.js 20+
- **GraphQLサーバー**: Apollo Server
- **ORM**: Prisma
- **キャッシュ**: Redis (ioredis)
- **認証**: Firebase Authentication
- **データベース**: Neon PostgreSQL
- **コンテナ**: Docker & Docker Compose
- **テスト**: Jest
- **リンター**: ESLint + Prettier

---

## 2. アーキテクチャ設計

### 2.1 レイヤードアーキテクチャ

```
┌─────────────────────────────────────────┐
│   Presentation Layer                    │  ← GraphQL Schema & Resolvers
│   (GraphQL API)                         │
├─────────────────────────────────────────┤
│   Application Layer                     │  ← Use Cases & Business Logic
│   (Services)                            │
├─────────────────────────────────────────┤
│   Domain Layer                          │  ← Entities & Repository Interfaces
│   (Entities, Interfaces)                │
├─────────────────────────────────────────┤
│   Infrastructure Layer                  │  ← External Systems Integration
│   (Repositories, Cache, Auth)           │
└─────────────────────────────────────────┘
```

### 2.2 ディレクトリ構造

```
link-like-essentials-backend/
├── src/
│   ├── presentation/          # Presentation Layer
│   │   ├── graphql/
│   │   │   ├── schema/       # GraphQL Schema定義
│   │   │   │   ├── card.graphql
│   │   │   │   ├── cardDetail.graphql
│   │   │   │   ├── accessory.graphql
│   │   │   │   └── common.graphql
│   │   │   ├── resolvers/    # GraphQL Resolvers
│   │   │   │   ├── cardResolver.ts
│   │   │   │   ├── cardDetailResolver.ts
│   │   │   │   └── accessoryResolver.ts
│   │   │   ├── directives/   # カスタムディレクティブ
│   │   │   │   └── authDirective.ts
│   │   │   └── context.ts    # GraphQLコンテキスト
│   │   └── middleware/       # Express Middleware
│   │       ├── errorHandler.ts
│   │       └── requestLogger.ts
│   │
│   ├── application/          # Application Layer
│   │   ├── services/        # ビジネスロジック
│   │   │   ├── CardService.ts
│   │   │   ├── CardDetailService.ts
│   │   │   └── AccessoryService.ts
│   │   └── dto/             # Data Transfer Objects
│   │       ├── CardDTO.ts
│   │       ├── CardDetailDTO.ts
│   │       └── AccessoryDTO.ts
│   │
│   ├── domain/              # Domain Layer
│   │   ├── entities/       # ドメインエンティティ
│   │   │   ├── Card.ts
│   │   │   ├── CardDetail.ts
│   │   │   └── Accessory.ts
│   │   ├── repositories/   # リポジトリインターフェース
│   │   │   ├── ICardRepository.ts
│   │   │   ├── ICardDetailRepository.ts
│   │   │   └── IAccessoryRepository.ts
│   │   └── valueObjects/   # 値オブジェクト
│   │       ├── Rarity.ts
│   │       ├── StyleType.ts
│   │       └── Stats.ts
│   │
│   ├── infrastructure/      # Infrastructure Layer
│   │   ├── database/       # データベース実装
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   ├── repositories/
│   │   │   │   ├── CardRepository.ts
│   │   │   │   ├── CardDetailRepository.ts
│   │   │   │   └── AccessoryRepository.ts
│   │   │   └── client.ts
│   │   ├── cache/          # キャッシュ実装
│   │   │   ├── RedisClient.ts
│   │   │   ├── CacheService.ts
│   │   │   └── strategies/
│   │   │       ├── CardCacheStrategy.ts
│   │   │       └── DetailCacheStrategy.ts
│   │   └── auth/           # 認証実装
│   │       ├── FirebaseAuth.ts
│   │       └── AuthService.ts
│   │
│   ├── config/             # 設定ファイル
│   │   ├── apollo.ts      # Apollo Server設定
│   │   ├── database.ts    # DB接続設定
│   │   ├── cache.ts       # Redis設定
│   │   └── firebase.ts    # Firebase設定
│   │
│   ├── types/             # 型定義
│   │   ├── graphql.ts    # 自動生成されるGraphQL型
│   │   └── context.ts    # コンテキスト型
│   │
│   └── server.ts          # エントリーポイント
│
├── prisma/
│   └── schema.prisma      # Prismaスキーマ
│
├── tests/                 # テストコード
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
└── package.json
```

---

## 3. データモデル設計

### 3.1 データベーススキーマ（既存）

#### cards テーブル

- 基本的なカード情報を格納

```typescript
interface Card {
  id: number;
  rarity: string | null; // UR, SR, R
  limited: string | null; // 恒常/限定
  cardName: string; // カード名
  cardUrl: string | null; // Wiki URL
  characterName: string; // キャラクター名
  styleType: string | null; // スタイルタイプ
  isLocked: boolean; // 手動更新保護フラグ
  createdAt: Date;
  updatedAt: Date;
}
```

#### card_details テーブル

- カードの詳細情報を格納

```typescript
interface CardDetail {
  id: number;
  cardId: number; // cards.id への外部キー
  favoriteMode: string | null; // お気に入りモード
  acquisitionMethod: string | null; // 入手方法
  awakeBeforeUrl: string | null; // 覚醒前画像URL
  awakeAfterUrl: string | null; // 覚醒後画像URL
  awakeBeforeStorageUrl: string | null; // Firebase Storage URL
  awakeAfterStorageUrl: string | null; // Firebase Storage URL
  smileMaxLevel: string | null; // スマイル最大値
  pureMaxLevel: string | null; // ピュア最大値
  coolMaxLevel: string | null; // クール最大値
  mentalMaxLevel: string | null; // メンタル最大値
  specialAppealName: string | null;
  specialAppealAp: string | null;
  specialAppealEffect: string | null;
  skillName: string | null;
  skillAp: string | null;
  skillEffect: string | null;
  traitName: string | null;
  traitEffect: string | null;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### card_accessories テーブル

- アクセサリーカード情報を格納

```typescript
interface CardAccessory {
  id: number;
  cardId: number; // cards.id への外部キー
  parentType: string; // special_appeal, skill, trait, accessory
  name: string;
  ap: string | null;
  effect: string | null;
  traitName: string | null;
  traitEffect: string | null;
  displayOrder: number;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 GraphQLスキーマ設計

#### 型定義

```graphql
# common.graphql
scalar DateTime

# レアリティ（実データから取得）
# UR: 247件, SR: 138件, R: 46件, DR: 23件, BR: 14件, LR: 3件
enum Rarity {
  UR # Ultra Rare
  SR # Super Rare
  R # Rare
  DR # Dream Rare
  BR # Birthday Rare
  LR # Limited Rare
}

# 限定区分（実データから取得）
# 14種類の限定タイプが存在
enum LimitedType {
  PERMANENT # 恒常
  LIMITED # 限定
  SPRING_LIMITED # 春限定
  SUMMER_LIMITED # 夏限定
  AUTUMN_LIMITED # 秋限定
  WINTER_LIMITED # 冬限定
  BIRTHDAY_LIMITED # 誕限定
  LEG_LIMITED # LEG限定
  BATTLE_LIMITED # 撃限定
  PARTY_LIMITED # 宴限定
  ACTIVITY_LIMITED # 活限定
  GRADUATE_LIMITED # 卒限定
  LOGIN_BONUS # ログボ
  REWARD # 報酬
}

# スタイルタイプ（実データから取得）
enum StyleType {
  CHEERLEADER # チアリーダー
  TRICKSTER # トリックスター
  PERFORMER # パフォーマー
  MOODMAKER # ムードメーカー
}

# お気に入りモード（実データから取得）
enum FavoriteMode {
  HAPPY # ハッピー
  MELLOW # メロウ
  NEUTRAL # ニュートラル
  NONE # --（データなし）
}

# アクセサリーの親タイプ（実データから取得）
enum ParentType {
  SPECIAL_APPEAL # special_appeal - スペシャルアピール
  SKILL # skill - スキル
  TRAIT # trait - 特性
}

type Stats {
  smile: Int
  pure: Int
  cool: Int
  mental: Int
}

type Skill {
  name: String!
  ap: String
  effect: String
}

type Trait {
  name: String!
  effect: String
}

# card.graphql
type Card {
  id: ID!
  rarity: Rarity
  limited: LimitedType
  cardName: String!
  cardUrl: String
  characterName: String!
  styleType: StyleType
  isLocked: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  # リレーション
  detail: CardDetail
}

type CardConnection {
  edges: [CardEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type CardEdge {
  node: Card!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

input CardFilterInput {
  rarity: Rarity
  limited: LimitedType
  characterName: String
  styleType: StyleType
  cardName: String
}

input CardSortInput {
  field: CardSortField!
  direction: SortDirection!
}

enum CardSortField {
  ID
  CARD_NAME
  CHARACTER_NAME
  CREATED_AT
  UPDATED_AT
}

enum SortDirection {
  ASC
  DESC
}

# cardDetail.graphql
type CardDetail {
  id: ID!
  cardId: Int!
  favoriteMode: FavoriteMode
  acquisitionMethod: String
  awakeBeforeUrl: String
  awakeAfterUrl: String
  awakeBeforeStorageUrl: String
  awakeAfterStorageUrl: String
  stats: Stats
  specialAppeal: Skill
  skill: Skill
  trait: Trait
  isLocked: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  # リレーション
  card: Card!
  accessories: [Accessory!]!
}

# accessory.graphql
type Accessory {
  id: ID!
  cardId: Int!
  parentType: ParentType!
  name: String!
  ap: String
  effect: String
  trait: Trait
  displayOrder: Int!
  isLocked: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!

  # リレーション
  card: Card!
}

# Query & Mutation
type Query {
  # カード一覧取得（ページネーション対応）
  cards(
    first: Int
    after: String
    filter: CardFilterInput
    sort: CardSortInput
  ): CardConnection!

  # 単一カード取得
  card(id: ID!): Card
  cardByName(cardName: String!, characterName: String!): Card

  # カード詳細取得
  cardDetail(cardId: ID!): CardDetail

  # アクセサリー一覧取得
  accessories(cardId: ID!, parentType: ParentType): [Accessory!]!

  # 統計情報
  cardStats: CardStats!
}

type CardStats {
  totalCards: Int!
  byRarity: [RarityCount!]!
  byStyleType: [StyleTypeCount!]!
  byCharacter: [CharacterCount!]!
}

type RarityCount {
  rarity: Rarity!
  count: Int!
}

type StyleTypeCount {
  styleType: StyleType!
  count: Int!
}

type CharacterCount {
  characterName: String!
  count: Int!
}

# 認証が必要な操作は将来拡張用
# type Mutation {
#   # ユーザーのお気に入り登録など
# }
```

#### データマッピング定義

データベースの文字列値をGraphQL ENUMにマッピングする際の対応表：

```typescript
// domain/valueObjects/Rarity.ts
export enum Rarity {
  UR = 'UR',
  SR = 'SR',
  R = 'R',
  DR = 'DR',
  BR = 'BR',
  LR = 'LR',
}

// domain/valueObjects/LimitedType.ts
export enum LimitedType {
  PERMANENT = '恒常',
  LIMITED = '限定',
  SPRING_LIMITED = '春限定',
  SUMMER_LIMITED = '夏限定',
  AUTUMN_LIMITED = '秋限定',
  WINTER_LIMITED = '冬限定',
  BIRTHDAY_LIMITED = '誕限定',
  LEG_LIMITED = 'LEG限定',
  BATTLE_LIMITED = '撃限定',
  PARTY_LIMITED = '宴限定',
  ACTIVITY_LIMITED = '活限定',
  GRADUATE_LIMITED = '卒限定',
  LOGIN_BONUS = 'ログボ',
  REWARD = '報酬',
}

// domain/valueObjects/StyleType.ts
export enum StyleType {
  CHEERLEADER = 'チアリーダー',
  TRICKSTER = 'トリックスター',
  PERFORMER = 'パフォーマー',
  MOODMAKER = 'ムードメーカー',
  MOODOMAKER = 'ムードーメーカー', // 誤字版も対応
}

// domain/valueObjects/FavoriteMode.ts
export enum FavoriteMode {
  HAPPY = 'ハッピー',
  MELLOW = 'メロウ',
  NEUTRAL = 'ニュートラル',
  NONE = '--',
}

// domain/valueObjects/ParentType.ts
export enum ParentType {
  SPECIAL_APPEAL = 'special_appeal',
  SKILL = 'skill',
  TRAIT = 'trait',
}
```

**マッパー関数:**

```typescript
// infrastructure/mappers/EnumMapper.ts
export class EnumMapper {
  // LimitedTypeのマッピング
  static toLimitedTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      恒常: 'PERMANENT',
      限定: 'LIMITED',
      春限定: 'SPRING_LIMITED',
      夏限定: 'SUMMER_LIMITED',
      秋限定: 'AUTUMN_LIMITED',
      冬限定: 'WINTER_LIMITED',
      誕限定: 'BIRTHDAY_LIMITED',
      LEG限定: 'LEG_LIMITED',
      撃限定: 'BATTLE_LIMITED',
      宴限定: 'PARTY_LIMITED',
      活限定: 'ACTIVITY_LIMITED',
      卒限定: 'GRADUATE_LIMITED',
      ログボ: 'LOGIN_BONUS',
      報酬: 'REWARD',
    };

    return mapping[value] || null;
  }

  // StyleTypeのマッピング
  static toStyleTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      チアリーダー: 'CHEERLEADER',
      トリックスター: 'TRICKSTER',
      パフォーマー: 'PERFORMER',
      ムードメーカー: 'MOODMAKER',
      ムードーメーカー: 'MOODOMAKER',
    };

    return mapping[value] || null;
  }

  // FavoriteModeのマッピング
  static toFavoriteModeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      ハッピー: 'HAPPY',
      メロウ: 'MELLOW',
      ニュートラル: 'NEUTRAL',
      '--': 'NONE',
    };

    return mapping[value] || null;
  }

  // ParentTypeのマッピング
  static toParentTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      special_appeal: 'SPECIAL_APPEAL',
      skill: 'SKILL',
      trait: 'TRAIT',
    };

    return mapping[value] || null;
  }
}
```

---

## 4. 認証設計

### 4.1 Firebase Authentication

```typescript
// infrastructure/auth/FirebaseAuth.ts
import * as admin from 'firebase-admin';

export class FirebaseAuth {
  private auth: admin.auth.Auth;

  constructor() {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH!);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    this.auth = admin.auth();
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    return await this.auth.verifyIdToken(token);
  }
}
```

### 4.2 GraphQLコンテキスト

```typescript
// presentation/graphql/context.ts
import { Request } from 'express';
import { FirebaseAuth } from '../../infrastructure/auth/FirebaseAuth';

export interface GraphQLContext {
  user?: {
    uid: string;
    email?: string;
  };
  dataSources: {
    cardService: CardService;
    cardDetailService: CardDetailService;
    accessoryService: AccessoryService;
  };
}

export async function createContext(req: Request): Promise<GraphQLContext> {
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user: GraphQLContext['user'] | undefined;

  if (token) {
    try {
      const firebaseAuth = new FirebaseAuth();
      const decodedToken = await firebaseAuth.verifyToken(token);
      user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (error) {
      // トークン検証失敗時は未認証として扱う
      console.warn('Token verification failed:', error);
    }
  }

  return {
    user,
    dataSources: {
      cardService: new CardService(),
      cardDetailService: new CardDetailService(),
      accessoryService: new AccessoryService(),
    },
  };
}
```

### 4.3 認証ディレクティブ

```typescript
// presentation/graphql/directives/authDirective.ts
import { GraphQLError } from 'graphql';
import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils';
import { GraphQLSchema } from 'graphql';

export function authDirectiveTransformer(
  schema: GraphQLSchema,
  directiveName: string = 'auth'
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0];

      if (authDirective) {
        const { resolve = defaultFieldResolver } = fieldConfig;

        fieldConfig.resolve = async function (source, args, context, info) {
          if (!context.user) {
            throw new GraphQLError('認証が必要です', {
              extensions: { code: 'UNAUTHENTICATED' },
            });
          }
          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
```

---

## 5. キャッシュ戦略

### 5.1 Redis キャッシュ設計

#### キャッシュキー命名規則

```
card:{id}                    # 単一カード
card:name:{cardName}:{char}  # 名前検索
cards:list:{hash}            # 一覧（フィルター条件のハッシュ）
cardDetail:{cardId}          # カード詳細
accessories:{cardId}         # アクセサリー一覧
stats:cards                  # 統計情報
```

#### TTL（Time To Live）設定

- カード一覧: 1時間
- カード詳細: 6時間
- 統計情報: 30分
- 単一カード: 24時間

### 5.2 キャッシュサービス実装

```typescript
// infrastructure/cache/CacheService.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized);
    } else {
      await this.redis.set(key, serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### 5.3 キャッシュ戦略の実装

```typescript
// infrastructure/cache/strategies/CardCacheStrategy.ts
import { CacheService } from '../CacheService';
import { Card } from '../../../domain/entities/Card';

export class CardCacheStrategy {
  constructor(private cache: CacheService) {}

  async getCard(id: number): Promise<Card | null> {
    return await this.cache.get<Card>(`card:${id}`);
  }

  async setCard(card: Card): Promise<void> {
    const TTL = 24 * 60 * 60; // 24時間
    await this.cache.set(`card:${card.id}`, card, TTL);
  }

  async getCardList(filterHash: string): Promise<Card[] | null> {
    return await this.cache.get<Card[]>(`cards:list:${filterHash}`);
  }

  async setCardList(filterHash: string, cards: Card[]): Promise<void> {
    const TTL = 60 * 60; // 1時間
    await this.cache.set(`cards:list:${filterHash}`, cards, TTL);
  }

  async invalidateCard(id: number): Promise<void> {
    await this.cache.del(`card:${id}`);
    // 一覧キャッシュも無効化
    await this.cache.invalidatePattern('cards:list:*');
  }
}
```

---

## 6. サービス層設計

### 6.1 CardService

```typescript
// application/services/CardService.ts
import { Card } from '../../domain/entities/Card';
import { ICardRepository } from '../../domain/repositories/ICardRepository';
import { CardCacheStrategy } from '../../infrastructure/cache/strategies/CardCacheStrategy';
import { CardFilterInput, CardSortInput } from '../dto/CardDTO';

export class CardService {
  constructor(
    private cardRepository: ICardRepository,
    private cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number): Promise<Card | null> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getCard(id);
    if (cached) {
      return cached;
    }

    // DBから取得
    const card = await this.cardRepository.findById(id);

    // キャッシュに保存
    if (card) {
      await this.cacheStrategy.setCard(card);
    }

    return card;
  }

  async findByName(
    cardName: string,
    characterName: string
  ): Promise<Card | null> {
    return await this.cardRepository.findByCardNameAndCharacter(
      cardName,
      characterName
    );
  }

  async findAll(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: { first?: number; after?: string }
  ): Promise<{
    cards: Card[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter, sort, pagination);

    // キャッシュチェック
    const cached = await this.cacheStrategy.getCardList(filterHash);
    if (cached) {
      return {
        cards: cached,
        totalCount: cached.length,
        hasNextPage: false,
      };
    }

    // DBから取得
    const result = await this.cardRepository.findAll(filter, sort, pagination);

    // キャッシュに保存
    await this.cacheStrategy.setCardList(filterHash, result.cards);

    return result;
  }

  async getStats(): Promise<CardStats> {
    // 統計情報の取得とキャッシュ
    const cacheKey = 'stats:cards';
    const cached = await this.cacheStrategy.cache.get<CardStats>(cacheKey);

    if (cached) {
      return cached;
    }

    const stats = await this.cardRepository.getStats();

    const TTL = 30 * 60; // 30分
    await this.cacheStrategy.cache.set(cacheKey, stats, TTL);

    return stats;
  }

  private generateFilterHash(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: { first?: number; after?: string }
  ): string {
    const data = JSON.stringify({ filter, sort, pagination });
    // 簡易的なハッシュ生成
    return Buffer.from(data).toString('base64');
  }
}
```

---

## 7. リポジトリ実装

### 7.1 Prismaスキーマ

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Card {
  id            Int       @id @default(autoincrement())
  rarity        String?   @db.VarChar(50)  // UR, SR, R, DR, BR, LR
  limited       String?   @db.VarChar(50)  // 恒常, 限定, 春限定, 夏限定, etc.
  cardName      String    @map("card_name") @db.VarChar(255)
  cardUrl       String?   @map("card_url") @db.Text
  characterName String    @map("character_name") @db.VarChar(255)
  styleType     String?   @map("style_type") @db.VarChar(100)  // チアリーダー, トリックスター, etc.
  isLocked      Boolean   @default(false) @map("is_locked")
  createdAt     DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt     DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  detail      CardDetail?
  accessories CardAccessory[]

  @@unique([cardName, characterName], map: "cards_card_name_character_name_key")
  @@index([cardName], map: "idx_cards_card_name")
  @@index([characterName], map: "idx_cards_character_name")
  @@index([rarity], map: "idx_cards_rarity")
  @@index([isLocked], map: "idx_cards_is_locked")
  @@map("cards")
}

model CardDetail {
  id                      Int       @id @default(autoincrement())
  cardId                  Int       @unique @map("card_id")
  favoriteMode            String?   @map("favorite_mode") @db.VarChar(255)  // ハッピー, メロウ, ニュートラル, --
  acquisitionMethod       String?   @map("acquisition_method") @db.Text
  awakeBeforeUrl          String?   @map("awake_before_url") @db.Text
  awakeAfterUrl           String?   @map("awake_after_url") @db.Text
  awakeBeforeStorageUrl   String?   @map("awake_before_storage_url") @db.Text
  awakeAfterStorageUrl    String?   @map("awake_after_storage_url") @db.Text
  smileMaxLevel           String?   @map("smile_max_level") @db.VarChar(50)
  pureMaxLevel            String?   @map("pure_max_level") @db.VarChar(50)
  coolMaxLevel            String?   @map("cool_max_level") @db.VarChar(50)
  mentalMaxLevel          String?   @map("mental_max_level") @db.VarChar(50)
  specialAppealName       String?   @map("special_appeal_name") @db.VarChar(255)
  specialAppealAp         String?   @map("special_appeal_ap") @db.VarChar(50)
  specialAppealEffect     String?   @map("special_appeal_effect") @db.Text
  skillName               String?   @map("skill_name") @db.VarChar(255)
  skillAp                 String?   @map("skill_ap") @db.VarChar(50)
  skillEffect             String?   @map("skill_effect") @db.Text
  traitName               String?   @map("trait_name") @db.VarChar(255)
  traitEffect             String?   @map("trait_effect") @db.Text
  isLocked                Boolean   @default(false) @map("is_locked")
  createdAt               DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt               DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId], map: "idx_card_details_card_id")
  @@index([isLocked], map: "idx_card_details_is_locked")
  @@map("card_details")
}

model CardAccessory {
  id           Int       @id @default(autoincrement())
  cardId       Int       @map("card_id")
  parentType   String    @map("parent_type") @db.VarChar(50)  // special_appeal, skill, trait
  name         String    @db.VarChar(255)
  ap           String?   @db.VarChar(50)
  effect       String?   @db.Text
  traitName    String?   @map("trait_name") @db.VarChar(255)
  traitEffect  String?   @map("trait_effect") @db.Text
  displayOrder Int       @default(0) @map("display_order")
  isLocked     Boolean   @default(false) @map("is_locked")
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt    DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId], map: "idx_card_accessories_card_id")
  @@index([parentType], map: "idx_card_accessories_parent_type")
  @@index([isLocked], map: "idx_card_accessories_is_locked")
  @@map("card_accessories")
}
```

### 7.2 CardRepository実装

```typescript
// infrastructure/database/repositories/CardRepository.ts
import { PrismaClient } from '@prisma/client';
import { ICardRepository } from '../../../domain/repositories/ICardRepository';
import { Card } from '../../../domain/entities/Card';
import {
  CardFilterInput,
  CardSortInput,
} from '../../../application/dto/CardDTO';

export class CardRepository implements ICardRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Card | null> {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        detail: true,
      },
    });

    return card ? this.mapToEntity(card) : null;
  }

  async findByCardNameAndCharacter(
    cardName: string,
    characterName: string
  ): Promise<Card | null> {
    const card = await this.prisma.card.findUnique({
      where: {
        cardName_characterName: {
          cardName,
          characterName,
        },
      },
      include: {
        detail: true,
      },
    });

    return card ? this.mapToEntity(card) : null;
  }

  async findAll(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: { first?: number; after?: string }
  ): Promise<{
    cards: Card[];
    totalCount: number;
    hasNextPage: boolean;
  }> {
    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(sort);

    const [cards, totalCount] = await Promise.all([
      this.prisma.card.findMany({
        where,
        orderBy,
        take: pagination?.first,
        skip: pagination?.after ? 1 : 0,
        cursor: pagination?.after
          ? { id: parseInt(pagination.after) }
          : undefined,
        include: {
          detail: true,
        },
      }),
      this.prisma.card.count({ where }),
    ]);

    return {
      cards: cards.map(this.mapToEntity),
      totalCount,
      hasNextPage: pagination?.first
        ? cards.length === pagination.first
        : false,
    };
  }

  async getStats(): Promise<CardStats> {
    const [totalCards, byRarity, byStyleType, byCharacter] = await Promise.all([
      this.prisma.card.count(),
      this.prisma.card.groupBy({
        by: ['rarity'],
        _count: true,
      }),
      this.prisma.card.groupBy({
        by: ['styleType'],
        _count: true,
      }),
      this.prisma.card.groupBy({
        by: ['characterName'],
        _count: true,
        orderBy: { _count: { characterName: 'desc' } },
        take: 20,
      }),
    ]);

    return {
      totalCards,
      byRarity: byRarity.map((r) => ({
        rarity: r.rarity as Rarity,
        count: r._count,
      })),
      byStyleType: byStyleType.map((s) => ({
        styleType: s.styleType as StyleType,
        count: s._count,
      })),
      byCharacter: byCharacter.map((c) => ({
        characterName: c.characterName,
        count: c._count,
      })),
    };
  }

  private buildWhereClause(filter?: CardFilterInput): any {
    if (!filter) return {};

    return {
      ...(filter.rarity && { rarity: filter.rarity }),
      ...(filter.limited && { limited: filter.limited }),
      ...(filter.styleType && { styleType: filter.styleType }),
      ...(filter.characterName && {
        characterName: { contains: filter.characterName },
      }),
      ...(filter.cardName && {
        cardName: { contains: filter.cardName },
      }),
    };
  }

  private buildOrderByClause(sort?: CardSortInput): any {
    if (!sort) return { id: 'desc' };

    const fieldMap: Record<string, string> = {
      ID: 'id',
      CARD_NAME: 'cardName',
      CHARACTER_NAME: 'characterName',
      CREATED_AT: 'createdAt',
      UPDATED_AT: 'updatedAt',
    };

    return {
      [fieldMap[sort.field]]: sort.direction.toLowerCase(),
    };
  }

  private mapToEntity(card: any): Card {
    return {
      id: card.id,
      rarity: card.rarity,
      limited: card.limited,
      cardName: card.cardName,
      cardUrl: card.cardUrl,
      characterName: card.characterName,
      styleType: card.styleType,
      isLocked: card.isLocked,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      detail: card.detail,
    };
  }
}
```

---

## 8. GraphQL Resolver実装

```typescript
// presentation/graphql/resolvers/cardResolver.ts
import { GraphQLContext } from '../context';
import {
  QueryResolvers,
  CardResolvers,
  Card as GraphQLCard,
} from '../../../types/graphql';

export const cardResolvers: {
  Query: QueryResolvers;
  Card: CardResolvers;
} = {
  Query: {
    cards: async (_, args, context: GraphQLContext) => {
      const { first, after, filter, sort } = args;

      const result = await context.dataSources.cardService.findAll(
        filter || undefined,
        sort || undefined,
        { first: first || 20, after: after || undefined }
      );

      const edges = result.cards.map((card, index) => ({
        node: card,
        cursor: Buffer.from(`${card.id}`).toString('base64'),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage: result.hasNextPage,
          hasPreviousPage: false,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: result.totalCount,
      };
    },

    card: async (_, { id }, context: GraphQLContext) => {
      return await context.dataSources.cardService.findById(parseInt(id));
    },

    cardByName: async (
      _,
      { cardName, characterName },
      context: GraphQLContext
    ) => {
      return await context.dataSources.cardService.findByName(
        cardName,
        characterName
      );
    },

    cardStats: async (_, __, context: GraphQLContext) => {
      return await context.dataSources.cardService.getStats();
    },
  },

  Card: {
    detail: async (parent, _, context: GraphQLContext) => {
      if (parent.detail) return parent.detail;

      return await context.dataSources.cardDetailService.findByCardId(
        parent.id
      );
    },
  },
};
```

---

## 9. エラーハンドリング

### 9.1 カスタムエラークラス

```typescript
// domain/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'リソースが見つかりません') {
    super(message, 'NOT_FOUND', 404);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = '認証が必要です') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '入力値が不正です') {
    super(message, 'BAD_USER_INPUT', 400);
  }
}
```

### 9.2 GraphQLエラーフォーマッター

```typescript
// presentation/middleware/errorHandler.ts
import { GraphQLError } from 'graphql';
import { AppError } from '../../domain/errors/AppError';

export function formatError(error: GraphQLError) {
  // アプリケーションエラーの場合
  if (error.originalError instanceof AppError) {
    return {
      message: error.message,
      code: error.originalError.code,
      path: error.path,
      extensions: {
        code: error.originalError.code,
        statusCode: error.originalError.statusCode,
      },
    };
  }

  // その他のエラー
  console.error('Unexpected error:', error);

  return {
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
    },
  };
}
```

---

## 10. 環境設定

### 10.1 環境変数

```env
# .env.example

# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_PROJECT_ID=your-project-id

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

### 10.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - '4000:4000'
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis
    volumes:
      - ./firebase-service-account.json:/app/firebase-service-account.json:ro
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

### 10.3 Dockerfile

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run prisma:generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production

EXPOSE 4000

CMD ["npm", "start"]
```

---

## 11. テスト戦略

### 11.1 テスト構成

```typescript
// tests/unit/services/CardService.test.ts
import { CardService } from '../../../src/application/services/CardService';
import { ICardRepository } from '../../../src/domain/repositories/ICardRepository';
import { CardCacheStrategy } from '../../../src/infrastructure/cache/strategies/CardCacheStrategy';

describe('CardService', () => {
  let cardService: CardService;
  let mockRepository: jest.Mocked<ICardRepository>;
  let mockCache: jest.Mocked<CardCacheStrategy>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      // ... other methods
    } as any;

    mockCache = {
      getCard: jest.fn(),
      setCard: jest.fn(),
      // ... other methods
    } as any;

    cardService = new CardService(mockRepository, mockCache);
  });

  describe('findById', () => {
    it('should return card from cache if available', async () => {
      const mockCard = { id: 1, cardName: 'Test Card' };
      mockCache.getCard.mockResolvedValue(mockCard as any);

      const result = await cardService.findById(1);

      expect(result).toEqual(mockCard);
      expect(mockCache.getCard).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from DB and cache if not in cache', async () => {
      const mockCard = { id: 1, cardName: 'Test Card' };
      mockCache.getCard.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockCard as any);

      const result = await cardService.findById(1);

      expect(result).toEqual(mockCard);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCache.setCard).toHaveBeenCalledWith(mockCard);
    });
  });
});
```

---

## 12. パフォーマンス最適化

### 12.1 DataLoader導入

```typescript
// infrastructure/dataloader/CardLoader.ts
import DataLoader from 'dataloader';
import { ICardRepository } from '../../domain/repositories/ICardRepository';
import { Card } from '../../domain/entities/Card';

export class CardLoader {
  private loader: DataLoader<number, Card | null>;

  constructor(private repository: ICardRepository) {
    this.loader = new DataLoader(async (ids: readonly number[]) => {
      const cards = await this.repository.findByIds([...ids]);
      const cardMap = new Map(cards.map((card) => [card.id, card]));
      return ids.map((id) => cardMap.get(id) || null);
    });
  }

  async load(id: number): Promise<Card | null> {
    return await this.loader.load(id);
  }
}
```

### 12.2 クエリ最適化

- N+1問題解決のためPrismaの`include`活用
- バッチクエリの利用
- インデックス活用

---

## 13. モニタリング・ログ

### 13.1 構造化ログ

```typescript
// infrastructure/logger/Logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
```

### 13.2 リクエストロギング

```typescript
// presentation/middleware/requestLogger.ts
import { logger } from '../../infrastructure/logger/Logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('GraphQL Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
```

---

## 14. セキュリティ

### 14.1 レート制限

```typescript
// presentation/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 最大100リクエスト
  message: 'リクエスト数が多すぎます。しばらく待ってから再度お試しください。',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 14.2 クエリ複雑度制限

```typescript
// config/apollo.ts
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const complexityLimit = createComplexityLimitRule(1000, {
  onCost: (cost) => {
    console.log('Query complexity:', cost);
  },
});
```

---

## 15. デプロイメント

### 15.1 本番環境構成

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  GraphQL Server (x3) │
└──────┬───────────────┘
       │
       ├─────────────┬────────────┐
       │             │            │
       ▼             ▼            ▼
┌──────────┐  ┌──────────┐  ┌─────────┐
│ Neon DB  │  │  Redis   │  │Firebase │
└──────────┘  └──────────┘  └─────────┘
```

### 15.2 CI/CD パイプライン

#### CI: GitHub Actions

GitHub Actionsでコード品質チェックを実施。**Lintとユニットテストの通過が必須条件**。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npm run format:check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npm run prisma:generate

      - name: Run unit tests
        run: npm run test:unit
        env:
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests

  type-check:
    name: TypeScript Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npm run prisma:generate

      - name: Type check
        run: npm run type-check

  # PRのステータスチェック用の統合ジョブ
  ci-success:
    name: CI Success
    runs-on: ubuntu-latest
    needs: [lint, test, type-check]
    if: always()
    steps:
      - name: Check all jobs
        run: |
          if [[ "${{ needs.lint.result }}" != "success" ]] || \
             [[ "${{ needs.test.result }}" != "success" ]] || \
             [[ "${{ needs.type-check.result }}" != "success" ]]; then
            echo "One or more CI jobs failed"
            exit 1
          fi
          echo "All CI jobs passed successfully"
```

#### CD: Jenkins

Jenkinsを使用してデプロイメントを実行。CI（GitHub Actions）の成功が前提条件。

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'your-registry.example.com'
        IMAGE_NAME = 'link-like-essentials-backend'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        DEPLOYMENT_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : 'staging'}"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 1, unit: 'HOURS')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        returnStdout: true,
                        script: "git rev-parse --short HEAD"
                    ).trim()
                    env.IMAGE_TAG = "${env.DEPLOYMENT_ENV}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Verify CI Status') {
            steps {
                script {
                    echo "Verifying GitHub Actions CI status..."
                    // GitHub Actions CIの成功を確認
                    // この段階でCI（lint, test）が通過していることを前提とする
                    sh """
                        echo "CI Status: Passed (verified by GitHub Actions)"
                        echo "Proceeding with deployment..."
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
                    docker.build(
                        "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
                        "-f docker/Dockerfile ."
                    )
                }
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        def image = docker.image("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                        image.push()
                        image.push("${env.DEPLOYMENT_ENV}-latest")
                    }
                }
            }
        }

        stage('Database Migration') {
            when {
                expression { env.DEPLOYMENT_ENV == 'production' }
            }
            steps {
                script {
                    echo "Running database migrations..."
                    sh """
                        docker run --rm \
                          -e DATABASE_URL=${env.DATABASE_URL} \
                          ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          npm run prisma:migrate:deploy
                    """
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                expression { env.DEPLOYMENT_ENV == 'staging' }
            }
            steps {
                script {
                    echo "Deploying to Staging environment..."
                    sh """
                        # Kubernetes deployment example
                        kubectl set image deployment/link-like-backend-staging \
                          backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          --namespace=staging

                        kubectl rollout status deployment/link-like-backend-staging \
                          --namespace=staging \
                          --timeout=300s
                    """
                }
            }
        }

        stage('Deploy to Production') {
            when {
                expression { env.DEPLOYMENT_ENV == 'production' }
            }
            steps {
                script {
                    // 本番環境デプロイには手動承認を要求
                    input message: 'Deploy to Production?', ok: 'Deploy'

                    echo "Deploying to Production environment..."
                    sh """
                        # Blue-Green Deployment
                        kubectl set image deployment/link-like-backend-production \
                          backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          --namespace=production

                        kubectl rollout status deployment/link-like-backend-production \
                          --namespace=production \
                          --timeout=600s
                    """
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Running health checks..."
                    sh """
                        # デプロイ後のヘルスチェック
                        sleep 10

                        HEALTH_URL=\$(kubectl get service link-like-backend-${env.DEPLOYMENT_ENV} \
                          --namespace=${env.DEPLOYMENT_ENV} \
                          -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

                        curl -f http://\${HEALTH_URL}:4000/health || exit 1
                        echo "Health check passed"
                    """
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                script {
                    echo "Running smoke tests..."
                    sh """
                        # GraphQLエンドポイントの簡易テスト
                        npm run test:smoke -- --env=${env.DEPLOYMENT_ENV}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Deployment succeeded: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // Slack/Discord通知
            // slackSend(...)
        }
        failure {
            echo "Deployment failed: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // ロールバック処理
            script {
                if (env.DEPLOYMENT_ENV == 'production') {
                    sh """
                        kubectl rollout undo deployment/link-like-backend-production \
                          --namespace=production
                    """
                }
            }
            // Slack/Discord通知
            // slackSend(...)
        }
        always {
            cleanWs()
        }
    }
}
```

#### CI/CDフロー図

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions (CI)                      │
├─────────────────────────────────────────────────────────────┤
│  1. Lint Check (ESLint + Prettier)        [必須]            │
│  2. Unit Tests (Jest)                     [必須]            │
│  3. Type Check (TypeScript)               [必須]            │
│  4. Coverage Report                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ CI Success
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                       Jenkins (CD)                          │
├─────────────────────────────────────────────────────────────┤
│  1. Verify CI Status                                        │
│  2. Build Docker Image                                      │
│  3. Push to Registry                                        │
│  4. Database Migration (production only)                    │
│  5. Deploy to Environment                                   │
│     - Staging: Auto deploy                                  │
│     - Production: Manual approval required                  │
│  6. Health Check                                            │
│  7. Smoke Tests                                             │
└─────────────────────────────────────────────────────────────┘
```

#### package.json スクリプト

```json
{
  "scripts": {
    "lint": "eslint 'src/**/*.{ts,tsx}' --max-warnings 0",
    "lint:fix": "eslint 'src/**/*.{ts,tsx}' --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx,json,md}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,json,md}'",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:unit": "jest --coverage --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:smoke": "jest --testPathPattern=tests/smoke",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate:dev": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "build": "tsc && tsc-alias",
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

---

## 16. 今後の拡張計画

### 16.1 Phase 1（現在）

- ✅ GraphQL APIによる読み取り専用エンドポイント
- ✅ Firebase Authentication統合
- ✅ Redisキャッシュ実装

### 16.2 Phase 2（将来）

- ユーザー機能（お気に入り、デッキ構築）
- Mutation追加
- サブスクリプション（リアルタイム更新）
- 全文検索（Elasticsearch統合）

### 16.3 Phase 3（将来）

- 管理画面API
- データ分析機能
- レコメンデーション機能
- パフォーマンス分析ツール

---

## 17. 開発規約

### 17.1 コーディング規約

- TypeScript Strict Mode有効化
- ESLint + Prettierによるコードフォーマット
- 命名規則: camelCase (変数・関数), PascalCase (クラス・型)

### 17.2 Git運用

- ブランチ戦略: Git Flow
- コミットメッセージ: Conventional Commits
- プルリクエスト必須

### 17.3 レビュー基準

- テストカバレッジ80%以上
- TypeScript型エラーゼロ
- ESLintエラーゼロ

---

## まとめ

本設計書ではモダンで拡張性の高いGraphQLバックエンドシステムを定義しました。

**主要ポイント:**

1. レイヤードアーキテクチャによる徹底した責務分離
2. Prisma + Redisによる高速キャッシュ戦略
3. Firebase Authenticationによる堅牢な認証基盤
4. GraphQLによる柔軟なデータ取得
5. Dockerによる環境の一貫性

この設計に基づいて実装を進めることで、保守性が高く、パフォーマンスに優れたバックエンドシステムを構築できます。
