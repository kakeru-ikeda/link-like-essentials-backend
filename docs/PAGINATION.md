# Pagination Implementation

## Overview

カード一覧取得APIにCursor-based paginationを実装しました。既存の`cards`クエリは互換性のため維持し、新たに`cardsConnection`クエリを追加しています。

## GraphQL API

### 既存クエリ（全件取得）

```graphql
query {
  cards(filter: CardFilterInput) {
    id
    cardName
    characterName
    # ...
  }
}
```

### 新規クエリ（ページネーション対応）

```graphql
query {
  cardsConnection(
    filter: CardFilterInput
    first: Int # デフォルト: 20
    after: String # cursor
  ) {
    edges {
      node {
        id
        cardName
        characterName
        # ...
      }
      cursor
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

## 使用例

### 最初のページを取得

```graphql
query {
  cardsConnection(first: 10) {
    edges {
      node {
        id
        cardName
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### 次のページを取得

```graphql
query {
  cardsConnection(first: 10, after: "eyJpZCI6MTAsInJlbGVhc2VEYXRlIjoi...") {
    edges {
      node {
        id
        cardName
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### フィルター付きページネーション

```graphql
query {
  cardsConnection(filter: { rarity: UR }, first: 20) {
    edges {
      node {
        id
        cardName
        rarity
      }
    }
    pageInfo {
      hasNextPage
    }
    totalCount
  }
}
```

## 実装詳細

### アーキテクチャ

```
Resolver (cardsConnection)
  ↓
CardService.findAllPaginated()
  ↓
CardRepository.findAllPaginated()
  ↓
Prisma (take: first + 1)
```

### Cursor仕様

- **フォーマット**: Base64エンコードされたJSON
- **内容**: `{ id: number, releaseDate: string | null }`
- **ソート順**: releaseDate DESC, id ASC

### キャッシュ戦略

- **キーフォーマット**: `cards:list:${MD5(filter + first + after)}`
- **TTL**: 1時間
- **無効化**: CUD操作時に全キャッシュをクリア

### N+1対策

すべてのクエリで`include`を使用し、関連データを事前ロードします：

```typescript
const cards = await this.prisma.card.findMany({
  where,
  include: {
    detail: true,
    accessories: true,
    // オプショナル
    heartCollectAnalysis: options?.heartCollectAnalysis,
    unDrawAnalysis: options?.unDrawAnalysis,
  },
});
```

## テストカバレッジ

- Repository層: 6テストケース
- Service層: 8テストケース
- Resolver層: 3テストケース

**合計**: 17テストケース、すべて成功

## パフォーマンス

- **DB負荷**: `COUNT()`と`findMany()`を並列実行
- **メモリ効率**: `first + 1`件のみ取得（hasNextPage判定用）
- **キャッシュヒット率**: フィルター条件がハッシュ化されるため高効率

## 今後の拡張案

1. **backward pagination**: `last`, `before`引数の追加
2. **offset-based pagination**: 特定ページへのジャンプ機能
3. **カーソルの暗号化**: セキュリティ向上

---

**実装日**: 2026年2月6日  
**テストステータス**: ✅ All 272 tests passing
