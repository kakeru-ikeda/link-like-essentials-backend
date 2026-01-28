# グレードチャレンジ GraphQL クエリ例

このドキュメントでは、グレードチャレンジデータにアクセスするためのGraphQLクエリ例を示します。

## 認証

すべてのクエリには、Firebaseの認証トークンが必要です。

```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

---

## クエリ例

### 1. 全グレードチャレンジ取得

```graphql
query {
  gradeChallenges {
    id
    title
    termName
    startDate
    endDate
    detailUrl
    isLocked
    createdAt
    updatedAt
    details {
      id
      stageName
      specialEffect
      songId
      song {
        id
        songName
        category
        attribute
      }
      sectionEffects {
        id
        sectionName
        effect
        sectionOrder
      }
    }
  }
}
```

### 2. 期別フィルタリング

```graphql
query {
  gradeChallenges(filter: { termName: "104期 2nd Term" }) {
    id
    title
    termName
    startDate
    endDate
    details {
      stageName
      specialEffect
      song {
        songName
      }
    }
  }
}
```

### 3. タイトル検索（部分一致）

```graphql
query {
  gradeChallenges(filter: { title: "2026年" }) {
    id
    title
    termName
    startDate
    endDate
  }
}
```

### 4. 開催日フィルタリング

```graphql
query {
  gradeChallenges(
    filter: {
      startDateFrom: "2026-01-01T00:00:00.000Z"
      startDateTo: "2026-01-31T23:59:59.999Z"
    }
  ) {
    id
    title
    termName
    startDate
    endDate
  }
}
```

### 5. デッキタイプの曲を含むグレードチャレンジ取得

```graphql
query {
  gradeChallenges(filter: { hasSongWithDeckType: "105期" }) {
    id
    title
    termName
    startDate
    endDate
    details {
      stageName
      song {
        songName
        category
      }
    }
  }
}
```

### 6. ID指定取得

```graphql
query {
  gradeChallengeById(id: "1") {
    id
    title
    termName
    startDate
    endDate
    detailUrl
    details {
      id
      stageName
      specialEffect
      song {
        id
        songName
        category
        attribute
        centerCharacter
      }
      sectionEffects {
        id
        sectionName
        effect
        sectionOrder
        isLocked
      }
    }
  }
}
```

### 7. タイトル指定取得

```graphql
query {
  gradeChallengeByTitle(title: "2026年1月") {
    id
    title
    termName
    startDate
    endDate
    detailUrl
    details {
      stageName
      specialEffect
      song {
        songName
        category
      }
      sectionEffects {
        sectionName
        effect
        sectionOrder
      }
    }
  }
}
```

### 8. 開催中のグレードチャレンジ取得

```graphql
query {
  ongoingGradeChallenges {
    id
    title
    termName
    startDate
    endDate
    detailUrl
    details {
      stageName
      specialEffect
      song {
        id
        songName
        category
        attribute
      }
      sectionEffects {
        sectionName
        effect
        sectionOrder
      }
    }
  }
}
```

### 9. 統計情報取得

```graphql
query {
  gradeChallengeStats {
    totalEvents
    byTermName {
      termName
      count
    }
  }
}
```

### 10. 楽曲とのリレーション込みで取得

```graphql
query {
  gradeChallenges {
    id
    title
    termName
    details {
      stageName
      specialEffect
      song {
        id
        songName
        category
        attribute
        centerCharacter
        singers
        jacketImageUrl
        moodProgressions {
          section
          progression
          sectionOrder
        }
      }
      sectionEffects {
        sectionName
        effect
        sectionOrder
      }
    }
  }
}
```

---

## エラーハンドリング

### 存在しないIDの場合

```graphql
query {
  gradeChallengeById(id: "999999") {
    id
    title
  }
}
```

レスポンス:

```json
{
  "errors": [
    {
      "message": "GradeChallenge with id 999999 not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": null
}
```

---

## 注意事項

- すべてのクエリで認証が必須です
- `isLocked: true`のデータも取得可能です
- N+1問題対策のため、関連データは事前ロード済みです
- `ongoingGradeChallenges`は現在開催中（`startDate <= 現在時刻 <= endDate`）のイベントのみを返却します
- キャッシュ機能により、同一クエリは高速に応答します
  - 単一イベント: 24時間
  - 一覧: 1時間
  - 開催中イベント: 1時間
  - 統計情報: 30分
