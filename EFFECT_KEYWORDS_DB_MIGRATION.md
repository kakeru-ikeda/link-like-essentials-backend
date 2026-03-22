# スキル効果・特性効果キーワードのDB移行設計

## 概要

スキル効果・特性効果のヒット条件文言（正規表現キーワード）を、現在のフロントエンド Config ファイルから DB 管理に移行する設計。

**前提条件**

- 検索のリアルタイム性を損なわないこと（カードフィルタリングのレスポンスタイムを変えない）
- バックエンド: Node.js（Express）+ Apollo Server + Prisma + PostgreSQL (Neon)、GraphQL API
- フロントエンド: Next.js + Apollo Client + Zustand

---

## 現状の構造

### フロントエンドのフィルタリングフロー

```
ユーザーがUI操作
    ↓
useCardFilterQuery.ts（クエリパラメータ管理）
    ↓
useCards.ts（Apollo Client で全カードを一括GET_CARDS、クライアントサイドフィルタ）
    ↓
filterCardsOnClient（cardFilterService.ts）
    ↓
getSkillEffectKeyword/getTraitEffectKeyword
    ↓
config/skillEffects.ts の SKILL_EFFECT_KEYWORDS  ← ここをDB化する
config/traitEffects.ts の TRAIT_EFFECT_KEYWORDS  ← ここをDB化する
    ↓
keywordMatcher.ts（正規表現 or 部分文字列マッチ）
```

**重要**: カードフィルタリングはフロントエンドが**全カードを一括取得してクライアント側でフィルタリング**している。バックエンドの`skillEffectContains`等は現状未使用。つまりキーワードの取得先をConfigからDBに変えるだけで、フィルタリング処理自体は変更不要。

### 現在のキーワード管理箇所

| ファイル                              | 内容                       | 影響範囲                                                      |
| ------------------------------------- | -------------------------- | ------------------------------------------------------------- |
| `config/skillEffects.ts`              | `SKILL_EFFECT_KEYWORDS`    | CardFilter, DeckAnalyzer                                      |
| `config/traitEffects.ts`              | `TRAIT_EFFECT_KEYWORDS`    | CardFilter, DeckAnalyzer, traitConditions                     |
| `config/traitConditions.ts`           | `TRAIT_CONDITION_PATTERNS` | `TRAIT_EFFECT_KEYWORDS`を参照して生成                         |
| `services/game/skillEffectService.ts` | キーワード取得・マッチング | cardFilterService, deckAnalyzerService, traitConditionService |
| `services/game/traitEffectService.ts` | キーワード取得・マッチング | cardFilterService, deckAnalyzerService                        |

---

## 問題点

1. ゲームアップデートでスキル文言が変わるたびにコード変更・デプロイが必要
2. 正規表現パターンが多数でメンテナンスが難しい
3. 管理サイドからDB操作で即時更新できない

---

## 設計目標

```
Configファイル（コード）→ RDB（skill_effect_keywords / trait_effect_keywords）
     ↕ GraphQL
フロントエンド起動時に一括取得 → Zustandにキャッシュ → クライアントサイドフィルタで利用
```

---

## Phase 1: バックエンド変更

### 1-1. DBテーブル設計（Prisma スキーマ追加）

```prisma
model SkillEffectKeyword {
  id           Int       @id @default(autoincrement())
  effectType   String    @map("effect_type") @db.VarChar(50)
  keyword      String    @db.Text
  displayOrder Int       @default(0) @map("display_order")
  isLocked     Boolean?  @default(false) @map("is_locked")
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt    DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  @@index([effectType], map: "idx_skill_effect_keywords_effect_type")
  @@map("skill_effect_keywords")
}

model TraitEffectKeyword {
  id           Int       @id @default(autoincrement())
  effectType   String    @map("effect_type") @db.VarChar(50)
  keyword      String    @db.Text
  displayOrder Int       @default(0) @map("display_order")
  isLocked     Boolean?  @default(false) @map("is_locked")
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt    DateTime? @default(now()) @updatedAt @map("updated_at") @db.Timestamp(6)

  @@index([effectType], map: "idx_trait_effect_keywords_effect_type")
  @@map("trait_effect_keywords")
}
```

**設計方針**

- `keyword` は正規表現パターン文字列をそのまま格納（現在のConfigと同じ形式）
- `effectType` には既存の Enum 値をそのまま文字列として格納（例: `"HEART_CAPTURE"`）
- `displayOrder` で1つの効果タイプ内でのキーワードの順序を管理

### 1-2. GraphQL スキーマ追加

**`src/presentation/graphql/schema/effectKeyword.graphql`（新規作成）**

```graphql
type SkillEffectKeyword {
  id: ID!
  effectType: String!
  keyword: String!
  displayOrder: Int!
}

type TraitEffectKeyword {
  id: ID!
  effectType: String!
  keyword: String!
  displayOrder: Int!
}

type SkillEffectKeywordGroup {
  effectType: String!
  keywords: [String!]!
}

type TraitEffectKeywordGroup {
  effectType: String!
  keywords: [String!]!
}
```

**`src/presentation/graphql/schema/query.graphql` に追記**

```graphql
type Query {
  # 既存クエリ...

  # スキル効果キーワード一覧（effectType ごとにグループ化）
  skillEffectKeywords: [SkillEffectKeywordGroup!]!

  # 特性効果キーワード一覧（effectType ごとにグループ化）
  traitEffectKeywords: [TraitEffectKeywordGroup!]!
}
```

### 1-3. Repository 追加

**`src/infrastructure/database/repositories/EffectKeywordRepository.ts`（新規作成）**

```typescript
import type { PrismaClient } from '@prisma/client';

export interface EffectKeywordGroup {
  effectType: string;
  keywords: string[];
}

export class EffectKeywordRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getSkillEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const rows = await this.prisma.skillEffectKeyword.findMany({
      orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
    });
    return this.groupByEffectType(rows);
  }

  async getTraitEffectKeywords(): Promise<EffectKeywordGroup[]> {
    const rows = await this.prisma.traitEffectKeyword.findMany({
      orderBy: [{ effectType: 'asc' }, { displayOrder: 'asc' }],
    });
    return this.groupByEffectType(rows);
  }

  private groupByEffectType(
    rows: { effectType: string; keyword: string }[]
  ): EffectKeywordGroup[] {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.effectType) ?? [];
      list.push(row.keyword);
      map.set(row.effectType, list);
    }
    return Array.from(map.entries()).map(([effectType, keywords]) => ({
      effectType,
      keywords,
    }));
  }
}
```

### 1-4. Resolver 追加

**`src/presentation/graphql/resolvers/effectKeywordResolver.ts`（新規作成）**

```typescript
import type { EffectKeywordRepository } from '@/infrastructure/database/repositories/EffectKeywordRepository';

export const effectKeywordResolver = {
  Query: {
    skillEffectKeywords: async (
      _: unknown,
      __: unknown,
      {
        effectKeywordRepository,
      }: { effectKeywordRepository: EffectKeywordRepository }
    ) => {
      return effectKeywordRepository.getSkillEffectKeywords();
    },

    traitEffectKeywords: async (
      _: unknown,
      __: unknown,
      {
        effectKeywordRepository,
      }: { effectKeywordRepository: EffectKeywordRepository }
    ) => {
      return effectKeywordRepository.getTraitEffectKeywords();
    },
  },
};
```

### 1-5. 初期データ（マイグレーションシード）

既存の `config/skillEffects.ts` と `config/traitEffects.ts` の内容を SQL に変換してシードデータを作成する。

**シード例 (`prisma/seed.ts` に追記)**

```typescript
// スキル効果キーワードのシードデータ
const skillEffectKeywords = [
  {
    effectType: 'HEART_CAPTURE',
    keyword: 'スキルハートを獲得',
    displayOrder: 0,
  },
  {
    effectType: 'HEART_CAPTURE',
    keyword: 'ビートハート\\d+回分のスキルハートを獲得',
    displayOrder: 1,
  },
  { effectType: 'WIDE_HEART', keyword: 'ハート上限を\\+\\d+', displayOrder: 0 },
  // ... 全エントリを移行
];

await prisma.skillEffectKeyword.createMany({ data: skillEffectKeywords });

// 特性効果キーワードのシードデータ
const traitEffectKeywords = [
  { effectType: 'HEART_COLLECT', keyword: 'ハートコレクト', displayOrder: 0 },
  {
    effectType: 'HEART_COLLECT',
    keyword: 'ハートを\\d+個回収したとき',
    displayOrder: 1,
  },
  // ... 全エントリを移行
];

await prisma.traitEffectKeyword.createMany({ data: traitEffectKeywords });
```

---

## Phase 2: フロントエンド変更

### 2-1. GraphQL クエリ追加

**`repositories/graphql/queries/effectKeywords.ts`（新規作成）**

```typescript
import { gql } from '@apollo/client';

export const GET_SKILL_EFFECT_KEYWORDS = gql`
  query GetSkillEffectKeywords {
    skillEffectKeywords {
      effectType
      keywords
    }
  }
`;

export const GET_TRAIT_EFFECT_KEYWORDS = gql`
  query GetTraitEffectKeywords {
    traitEffectKeywords {
      effectType
      keywords
    }
  }
`;
```

### 2-2. 型定義追加

**`types/graphql/effectKeywords.ts`（新規作成）**

```typescript
export interface EffectKeywordGroup {
  effectType: string;
  keywords: string[];
}

export interface SkillEffectKeywordsQueryData {
  skillEffectKeywords: EffectKeywordGroup[];
}

export interface TraitEffectKeywordsQueryData {
  traitEffectKeywords: EffectKeywordGroup[];
}
```

### 2-3. Zustand ストア追加

**`store/effectKeywordsStore.ts`（新規作成）**

```typescript
import { create } from 'zustand';
import { SkillEffectType, TraitEffectType } from '@/models/shared/enums';

interface EffectKeywordsState {
  skillEffectKeywords: Record<string, string[]>;
  traitEffectKeywords: Record<string, string[]>;
  isLoaded: boolean;
  setSkillEffectKeywords: (keywords: Record<string, string[]>) => void;
  setTraitEffectKeywords: (keywords: Record<string, string[]>) => void;
  setLoaded: () => void;
  getSkillKeywords: (effectType: SkillEffectType) => string[];
  getTraitKeywords: (effectType: TraitEffectType) => string[];
}

export const useEffectKeywordsStore = create<EffectKeywordsState>(
  (set, get) => ({
    skillEffectKeywords: {},
    traitEffectKeywords: {},
    isLoaded: false,

    setSkillEffectKeywords: (keywords) =>
      set({ skillEffectKeywords: keywords }),

    setTraitEffectKeywords: (keywords) =>
      set({ traitEffectKeywords: keywords }),

    setLoaded: () => set({ isLoaded: true }),

    getSkillKeywords: (effectType) =>
      get().skillEffectKeywords[effectType] ?? [],

    getTraitKeywords: (effectType) =>
      get().traitEffectKeywords[effectType] ?? [],
  })
);
```

### 2-4. カスタムフック追加

**`hooks/card/useEffectKeywords.ts`（新規作成）**

```typescript
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_SKILL_EFFECT_KEYWORDS,
  GET_TRAIT_EFFECT_KEYWORDS,
} from '@/repositories/graphql/queries/effectKeywords';
import type {
  SkillEffectKeywordsQueryData,
  TraitEffectKeywordsQueryData,
} from '@/types/graphql/effectKeywords';
import { useEffectKeywordsStore } from '@/store/effectKeywordsStore';

/**
 * アプリ起動時にスキル効果・特性効果のキーワードをDBから取得してStoreに保存する
 * Apollo Client の cache-first により初回以降はキャッシュから返る
 */
export function useEffectKeywordsLoader() {
  const { setSkillEffectKeywords, setTraitEffectKeywords, setLoaded } =
    useEffectKeywordsStore();

  const { data: skillData } = useQuery<SkillEffectKeywordsQueryData>(
    GET_SKILL_EFFECT_KEYWORDS,
    { fetchPolicy: 'cache-first' }
  );

  const { data: traitData } = useQuery<TraitEffectKeywordsQueryData>(
    GET_TRAIT_EFFECT_KEYWORDS,
    { fetchPolicy: 'cache-first' }
  );

  useEffect(() => {
    if (!skillData || !traitData) return;

    const skillMap: Record<string, string[]> = {};
    for (const group of skillData.skillEffectKeywords) {
      skillMap[group.effectType] = group.keywords;
    }

    const traitMap: Record<string, string[]> = {};
    for (const group of traitData.traitEffectKeywords) {
      traitMap[group.effectType] = group.keywords;
    }

    setSkillEffectKeywords(skillMap);
    setTraitEffectKeywords(traitMap);
    setLoaded();
  }, [
    skillData,
    traitData,
    setSkillEffectKeywords,
    setTraitEffectKeywords,
    setLoaded,
  ]);
}
```

### 2-5. サービス層の変更

**`services/game/skillEffectService.ts`（変更）**

変更前:

```typescript
import { SKILL_EFFECT_KEYWORDS } from '@/config/skillEffects';

export function getSkillEffectKeyword(effectType: SkillEffectType): string[] {
  return SKILL_EFFECT_KEYWORDS[effectType];
}
```

変更後:

```typescript
import { useEffectKeywordsStore } from '@/store/effectKeywordsStore';

// React コンポーネント外から安全にstoreにアクセス
export function getSkillEffectKeyword(effectType: SkillEffectType): string[] {
  return useEffectKeywordsStore.getState().getSkillKeywords(effectType);
}
```

**`services/game/traitEffectService.ts`（変更）**

変更前:

```typescript
import { TRAIT_EFFECT_KEYWORDS } from '@/config/traitEffects';

export function getTraitEffectKeyword(effectType: TraitEffectType): string[] {
  return TRAIT_EFFECT_KEYWORDS[effectType];
}
```

変更後:

```typescript
import { useEffectKeywordsStore } from '@/store/effectKeywordsStore';

export function getTraitEffectKeyword(effectType: TraitEffectType): string[] {
  return useEffectKeywordsStore.getState().getTraitKeywords(effectType);
}
```

**`config/traitConditions.ts`（変更）**

`TRAIT_CONDITION_PATTERNS` はモジュールロード時に `TRAIT_EFFECT_KEYWORDS` から生成されているため、DB非同期取得に対応させる必要がある。

変更後: `TRAIT_CONDITION_PATTERNS` をモジュール定数ではなく関数（遅延評価）に変更する。

```typescript
// 変更前: モジュールロード時に生成（Config依存）
export const TRAIT_CONDITION_PATTERNS: Record<TraitConditionType, RegExp[]> = {...}

// 変更後: 呼び出し時にStoreから生成（Store依存）
export function getTraitConditionPatterns(): Record<TraitConditionType, RegExp[]> {
  const getKeywords = (effectType: TraitEffectType) =>
    useEffectKeywordsStore.getState().getTraitKeywords(effectType);

  const toRegexPatterns = (keywords: string[]): RegExp[] =>
    keywords.map((keyword) => new RegExp(keyword));

  return {
    [TraitConditionType.NONE]: [],
    [TraitConditionType.DRAW]: toRegexPatterns(getKeywords(TraitEffectType.DRAW)),
    [TraitConditionType.HEART_COLLECT]: toRegexPatterns(getKeywords(TraitEffectType.HEART_COLLECT)),
    [TraitConditionType.SHOT]: toRegexPatterns(getKeywords(TraitEffectType.SHOT)),
    [TraitConditionType.OVER_SECTION]: toRegexPatterns(getKeywords(TraitEffectType.OVER_SECTION)),
    [TraitConditionType.ACCUMULATE]: toRegexPatterns(getKeywords(TraitEffectType.ACCUMULATE)),
  };
}
```

### 2-6. アプリ初期化処理

**`app/providers.tsx`（変更）**

アプリ全体で `useEffectKeywordsLoader` を呼び出すコンポーネントを追加して、起動時にキーワードをプリフェッチする。

```typescript
// providers.tsx 内のルートコンポーネントに追加
function EffectKeywordsInitializer() {
  useEffectKeywordsLoader();
  return null;
}

// <ApolloProvider> 内に追加
<>
  <EffectKeywordsInitializer />
  {children}
</>
```

---

## キャッシュ戦略

```
アプリ起動
  ↓
useEffectKeywordsLoader が並列でGraphQL呼び出し
  ├── GET_SKILL_EFFECT_KEYWORDS  (fetchPolicy: cache-first)
  └── GET_TRAIT_EFFECT_KEYWORDS  (fetchPolicy: cache-first)
  ↓
Apollo Client がレスポンスをインメモリキャッシュに保存
  ↓
Zustand Store に effectType → keywords[] のマップとして格納
  ↓
以降のフィルタリングはZustand Store からO(1)でキーワード取得
  （APIコールなし＝リアルタイム性に影響なし）
```

**ポイント**

- `cache-first` ポリシーなのでページ遷移・コンポーネント再マウントでも再フェッチしない
- ゲームアップデート時はブラウザのリロードで新しいキーワードが反映される
- キーワードの変化頻度は低いのでキャッシュ無効化ポリシーは不要

---

## Phase 3: 整理・削除

キーワードDBへの完全移行確認後、以下を削除する。

| ファイル                    | 削除対象                           | 残すもの                                                            |
| --------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `config/skillEffects.ts`    | `SKILL_EFFECT_KEYWORDS`            | `SKILL_EFFECT_DESCRIPTIONS`（UI表示用）                             |
| `config/traitEffects.ts`    | `TRAIT_EFFECT_KEYWORDS`            | `TRAIT_EFFECT_DESCRIPTIONS`（UI表示用）                             |
| `config/traitConditions.ts` | `TRAIT_CONDITION_PATTERNS`（定数） | `TRAIT_CONDITION_LABELS`、`getTraitConditionPatterns`（関数に変換） |

---

## 変更ファイル一覧

### バックエンド（新規）

- `prisma/schema.prisma` — `SkillEffectKeyword` / `TraitEffectKeyword` モデル追加
- `prisma/migrations/xxx_add_effect_keywords/` — マイグレーション
- `prisma/seed.ts` — 初期データ
- `src/presentation/graphql/schema/effectKeyword.graphql` — スキーマ定義
- `src/infrastructure/database/repositories/EffectKeywordRepository.ts` — リポジトリ
- `src/presentation/graphql/resolvers/effectKeywordResolver.ts` — リゾルバ
- `src/presentation/graphql/resolvers/index.ts` — リゾルバ統合

### フロントエンド（新規）

- `repositories/graphql/queries/effectKeywords.ts` — クエリ定義
- `types/graphql/effectKeywords.ts` — 型定義
- `store/effectKeywordsStore.ts` — Zustandストア
- `hooks/card/useEffectKeywords.ts` — 初期化フック

### フロントエンド（変更）

- `services/game/skillEffectService.ts` — Store参照に変更
- `services/game/traitEffectService.ts` — Store参照に変更
- `config/traitConditions.ts` — 定数→関数に変更
- `app/providers.tsx` — 初期化処理追加

### フロントエンド（削除）

- `config/skillEffects.ts` から `SKILL_EFFECT_KEYWORDS` を削除（`SKILL_EFFECT_DESCRIPTIONS` は残す）
- `config/traitEffects.ts` から `TRAIT_EFFECT_KEYWORDS` を削除（`TRAIT_EFFECT_DESCRIPTIONS` は残す）

---

## 注意事項

1. **Store未ロード時の挙動**: アプリ初期化完了前にフィルタリングした場合、キーワードが空になりスキル効果フィルタが0件ヒットになる。`isLoaded` フラグを見てフィルタUIをロード中表示にするか、フォールバックとしてConfigから静的に取得する仕組みを一時的に残すことを検討する。

2. **正規表現の安全性**: `keyword` フィールドに格納されている正規表現パターンはDB管理者が編集する。誤った正規表現が保存されると `keywordMatcher.ts` の `try/catch` でフォールバックするが、意図しない動作になる可能性がある。

3. **既存の `TRAIT_CONDITION_PATTERNS` 参照箇所**: `services/game/traitConditionService.ts` が `TRAIT_CONDITION_PATTERNS` を直接importしているため、関数化後は呼び出し方の変更が必要になる点に注意。
