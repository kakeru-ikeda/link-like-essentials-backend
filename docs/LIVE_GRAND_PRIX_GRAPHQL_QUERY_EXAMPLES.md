# ライブグランプリ GraphQL クエリ例

このドキュメントでは、ライブグランプリデータにアクセスするためのGraphQLクエリ例を示します。

## 認証

すべてのクエリには、Firebaseの認証トークンが必要です。

```
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

---

## クエリ例

### 1. 全ライブグランプリ取得

```graphql
query {
  liveGrandPrix {
    id
    eventName
    yearTerm
    startDate
    endDate
    eventUrl
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
  liveGrandPrix(filter: { yearTerm: "104期" }) {
    id
    eventName
    yearTerm
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

### 3. イベント名検索（部分一致）

```graphql
query {
  liveGrandPrix(filter: { eventName: "個人戦" }) {
    id
    eventName
    yearTerm
    startDate
    endDate
    details {
      stageName
      song {
        songName
      }
    }
  }
}
```

### 4. 開催日フィルタリング

```graphql
query {
  liveGrandPrix(
    filter: {
      startDateFrom: "2024-06-01T00:00:00.000Z"
      startDateTo: "2024-06-30T23:59:59.999Z"
    }
  ) {
    id
    eventName
    yearTerm
    startDate
    endDate
  }
}
```

### 5. ID指定取得

```graphql
query {
  liveGrandPrixById(id: "23") {
    id
    eventName
    yearTerm
    startDate
    endDate
    eventUrl
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

### 6. イベント名指定取得

```graphql
query {
  liveGrandPrixByEventName(eventName: "104期 1stTerm 第3回個人戦") {
    id
    eventName
    yearTerm
    startDate
    endDate
    eventUrl
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

### 7. 開催中のライブグランプリ取得

```graphql
query {
  ongoingLiveGrandPrix {
    id
    eventName
    yearTerm
    startDate
    endDate
    eventUrl
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

### 8. 統計情報取得

```graphql
query {
  liveGrandPrixStats {
    totalEvents
    byYearTerm {
      yearTerm
      count
    }
  }
}
```

### 9. 楽曲とのリレーション込みで取得

```graphql
query {
  liveGrandPrix {
    id
    eventName
    yearTerm
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

## 複合フィルタ例

### 10. 複数条件でフィルタリング

```graphql
query {
  liveGrandPrix(
    filter: {
      yearTerm: "104期"
      eventName: "個人戦"
      startDateFrom: "2024-06-01T00:00:00.000Z"
    }
  ) {
    id
    eventName
    yearTerm
    startDate
    endDate
    details {
      stageName
      song {
        songName
      }
    }
  }
}
```

---

## レスポンス例

### liveGrandPrixById のレスポンス

```json
{
  "data": {
    "liveGrandPrixById": {
      "id": "23",
      "eventName": "104期 1stTerm 第3回個人戦",
      "yearTerm": "104期",
      "startDate": "2024-06-11T12:00:00.000Z",
      "endDate": "2024-06-17T03:59:00.000Z",
      "eventUrl": "https://wikiwiki.jp/llll_wiki/...",
      "details": [
        {
          "id": "1",
          "stageName": "A",
          "specialEffect": "スキルを10回使用するたび、APが5回復し、デッキの全てのカードの消費APを+1する",
          "song": {
            "id": "31",
            "songName": "Song Title",
            "category": "Original",
            "attribute": "Smile"
          },
          "sectionEffects": [
            {
              "id": "1",
              "sectionName": "セクション1",
              "effect": "メンタルの減少速度を100%増加する",
              "sectionOrder": 1,
              "isLocked": false
            }
          ]
        }
      ]
    }
  }
}
```

---

## エラーハンドリング

### 存在しないIDの場合

```graphql
query {
  liveGrandPrixById(id: "999999") {
    id
    eventName
  }
}
```

レスポンス:

```json
{
  "errors": [
    {
      "message": "LiveGrandPrix with id 999999 not found",
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
- `ongoingLiveGrandPrix`は現在開催中（`startDate <= 現在時刻 <= endDate`）のイベントのみを返却します
- キャッシュ機能により、同一クエリは高速に応答します
  - 単一イベント: 24時間
  - 一覧: 1時間
  - 開催中イベント: 1時間
  - 統計情報: 30分
