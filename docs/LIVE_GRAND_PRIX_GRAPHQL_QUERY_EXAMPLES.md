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

### 5. デッキタイプの曲を含むライブグランプリ取得

指定したデッキタイプ（期）の曲を含むライブグランプリを取得します。
例えば、105期のライブグランプリに104期の曲が含まれている場合、`hasSongWithDeckType: "104期"`で検索すると、その105期ライブグランプリも取得できます。

```graphql
query {
  liveGrandPrix(filter: { hasSongWithDeckType: "105期" }) {
    id
    eventName
    yearTerm
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

**ユースケース例:**

- デッキタイプ「105期」を選択 → `hasSongWithDeckType: "105期"`で検索
- ステージ選択で「104期」の曲を選択 → デッキタイプが「104期」に変更
- `hasSongWithDeckType: "104期"`で再検索 → 104期の曲を含むライブグランプリ（元の105期ライブグランプリも含む）が表示される

### 6. ID指定取得

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

### 7. イベント名指定取得

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

### 8. 開催中のライブグランプリ取得

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

### 9. 統計情報取得

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

### 10. 楽曲とのリレーション込みで取得

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

### 11. 複数条件でフィルタリング

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

### 12. デッキタイプと期を組み合わせたフィルタリング

特定の期のライブグランプリの中から、指定したデッキタイプの曲を含むものだけを取得します。

```graphql
query {
  liveGrandPrix(filter: { yearTerm: "105期", hasSongWithDeckType: "104期" }) {
    id
    eventName
    yearTerm
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

**このクエリの結果:**

- 105期のライブグランプリのうち、104期の曲を含むもののみが返却されます
- 105期の曲しか含まれていないライブグランプリは除外されます

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
