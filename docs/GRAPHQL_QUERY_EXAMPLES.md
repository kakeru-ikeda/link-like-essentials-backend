# GraphQL クエリ例

Link Like Essentials Backend で使用できるGraphQLクエリの例を示します。

## 目次

- [認証](#認証)
- [基本的なクエリ](#基本的なクエリ)
- [カード検索](#カード検索)
- [効果検索（テキスト検索）](#効果検索テキスト検索)
- [複合検索](#複合検索)
- [アクセサリー検索](#アクセサリー検索)
- [特性分析データ検索](#特性分析データ検索)
- [統計情報](#統計情報)

---

## 認証

### 環境別の認証要件

| 環境   | NODE_ENV    | 認証要否 | 備考                       |
| ------ | ----------- | -------- | -------------------------- |
| 開発   | development | ❌ 不要  | トークンなしでアクセス可能 |
| テスト | test        | ✅ 必要  | テスト用トークンが必要     |
| 本番   | production  | ✅ 必要  | 必須                       |

**開発環境（NODE_ENV=development）**: すべてのGraphQLクエリは認証なしで実行可能です。

**本番環境（NODE_ENV=production）**: すべてのGraphQLクエリにFirebase Authenticationトークンが必要です。

### リクエストヘッダー

本番環境またはテスト環境では、すべてのGraphQLリクエストにFirebase Authenticationトークンを含むAuthorizationヘッダーが必要です:

```http
Authorization: Bearer <Firebase_ID_Token>
```

### 認証エラー

認証トークンが無効、期限切れ、または提供されていない場合（本番環境のみ）、以下のエラーが返されます:

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

### curlでの例

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{"query": "{ cards(first: 10) { edges { node { id cardName } } } }"}'
```

### GraphQL Playgroundでの設定

HTTP Headersセクションに以下を追加:

```json
{
  "Authorization": "Bearer YOUR_FIREBASE_TOKEN"
}
```

---

## 基本的なクエリ

### 接続テスト

```graphql
query TestConnection {
  __typename
}
```

### カード一覧取得（ページネーション）

```graphql
query GetCards {
  cards(first: 10) {
    edges {
      node {
        id
        cardName
        characterName
        rarity
        styleType
        limited
        cardUrl
      }
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

### ページネーション（次のページ）

```graphql
query GetNextPage {
  cards(
    first: 10
    after: "カーソル文字列" # 前のページのendCursorを指定
  ) {
    edges {
      node {
        id
        cardName
        characterName
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

### 単一カード取得（ID指定）

```graphql
query GetCard {
  card(id: "1") {
    id
    cardName
    characterName
    rarity
    limited
    styleType
    detail {
      favoriteMode
      acquisitionMethod
      stats {
        smile
        pure
        cool
        mental
      }
      specialAppeal {
        name
        ap
        effect
      }
      skill {
        name
        ap
        effect
      }
      trait {
        name
        effect
      }
      accessories {
        id
        parentType
        name
        ap
        effect
        traitName
        traitEffect
      }
    }
  }
}
```

### カード名とキャラ名で検索

```graphql
query GetCardByName {
  cardByName(cardName: "【スターティングメンバー】", characterName: "月雫") {
    id
    cardName
    characterName
    rarity
  }
}
```

---

## カード検索

### レアリティで検索

```graphql
query SearchByRarity {
  cards(first: 20, filter: { rarity: UR }) {
    edges {
      node {
        id
        cardName
        characterName
        rarity
      }
    }
    totalCount
  }
}
```

**利用可能なレアリティ**: `UR`, `SR`, `R`, `DR`, `BR`, `LR`

### キャラクター名で検索

```graphql
query SearchByCharacter {
  cards(first: 20, filter: { characterName: "月雫" }) {
    edges {
      node {
        id
        cardName
        characterName
      }
    }
    totalCount
  }
}
```

### スタイルタイプで検索

```graphql
query SearchByStyleType {
  cards(first: 20, filter: { styleType: CHEERLEADER }) {
    edges {
      node {
        id
        cardName
        characterName
        styleType
      }
    }
    totalCount
  }
}
```

**利用可能なスタイルタイプ**: `CHEERLEADER`, `TRICKSTER`, `PERFORMER`, `MOODMAKER`, `MOODOMAKER`

### 限定区分で検索

```graphql
query SearchByLimited {
  cards(first: 20, filter: { limited: BIRTHDAY_LIMITED }) {
    edges {
      node {
        id
        cardName
        characterName
        limited
      }
    }
    totalCount
  }
}
```

**利用可能な限定区分**: `PERMANENT`, `LIMITED`, `SPRING_LIMITED`, `SUMMER_LIMITED`, `AUTUMN_LIMITED`, `WINTER_LIMITED`, `BIRTHDAY_LIMITED`, `LEG_LIMITED`, `SHUFFLE_LIMITED`, `BATTLE_LIMITED`, `PARTY_LIMITED`, `ACTIVITY_LIMITED`, `BANGDREAM_LIMITED`, `GRADUATE_LIMITED`, `LOGIN_BONUS`, `REWARD`

### カード名（部分一致）で検索

```graphql
query SearchByCardName {
  cards(first: 20, filter: { cardName: "スターティング" }) {
    edges {
      node {
        id
        cardName
        characterName
      }
    }
    totalCount
  }
}
```

---

## 効果検索（テキスト検索）

### スキル効果で検索

```graphql
query SearchBySkillEffect {
  cards(first: 20, filter: { skillEffectContains: "アトラクト" }) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          skill {
            name
            effect
          }
        }
      }
    }
    totalCount
  }
}
```

### 特性効果で検索

```graphql
query SearchByTraitEffect {
  cards(first: 20, filter: { traitEffectContains: "ダメージ" }) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          trait {
            name
            effect
          }
        }
      }
    }
    totalCount
  }
}
```

### スペシャルアピール効果で検索

```graphql
query SearchBySpecialAppealEffect {
  cards(first: 20, filter: { specialAppealEffectContains: "全体" }) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          specialAppeal {
            name
            effect
          }
        }
      }
    }
    totalCount
  }
}
```

### アクセサリー効果で検索（スキル効果 OR 特性効果）

```graphql
query SearchByAccessoryEffect {
  cards(first: 20, filter: { accessoryEffectContains: "回復" }) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          accessories {
            id
            parentType
            name
            effect # スキル効果
            traitName # 特性名
            traitEffect # 特性効果
          }
        }
      }
    }
    totalCount
  }
}
```

### すべての効果から検索（OR検索）

```graphql
query SearchAttractEverywhere {
  # スキル効果
  skillAttract: cards(
    first: 20
    filter: { skillEffectContains: "アトラクト" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          skill {
            name
            effect
          }
        }
      }
    }
    totalCount
  }

  # 特性効果
  traitAttract: cards(
    first: 20
    filter: { traitEffectContains: "アトラクト" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          trait {
            name
            effect
          }
        }
      }
    }
    totalCount
  }

  # スペシャルアピール効果
  specialAttract: cards(
    first: 20
    filter: { specialAppealEffectContains: "アトラクト" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          specialAppeal {
            name
            effect
          }
        }
      }
    }
    totalCount
  }

  # アクセサリー効果（スキル・特性）
  accessoryAttract: cards(
    first: 20
    filter: { accessoryEffectContains: "アトラクト" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          accessories {
            id
            name
            effect
            traitEffect
          }
        }
      }
    }
    totalCount
  }
}
```

---

## 複合検索

### レアリティ + キャラクター

```graphql
query SearchURByCharacter {
  cards(first: 20, filter: { rarity: UR, characterName: "月雫" }) {
    edges {
      node {
        id
        cardName
        characterName
        rarity
      }
    }
    totalCount
  }
}
```

### レアリティ + スタイルタイプ + キャラクター

```graphql
query SearchComplexFilter {
  cards(
    first: 20
    filter: { rarity: UR, styleType: CHEERLEADER, characterName: "月雫" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        rarity
        styleType
      }
    }
    totalCount
  }
}
```

### キャラクター + 効果検索

```graphql
query SearchCharacterWithEffect {
  cards(
    first: 20
    filter: { characterName: "月雫", skillEffectContains: "アトラクト" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          skill {
            name
            effect
          }
        }
      }
    }
    totalCount
  }
}
```

### レアリティ + キャラ + 効果（3条件）

```graphql
query SearchThreeConditions {
  cards(
    first: 20
    filter: { rarity: UR, characterName: "月雫", skillEffectContains: "回復" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        rarity
        detail {
          skill {
            name
            effect
          }
        }
      }
    }
    totalCount
  }
}
```

### 複数のフィルターを組み合わせた実用例

```graphql
query FindDamageURCards {
  # スキルでダメージを与えるURカード
  skillDamage: cards(
    first: 10
    filter: { rarity: UR, skillEffectContains: "ダメージ" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          skill {
            name
            effect
          }
        }
      }
    }
    totalCount
  }

  # アクセサリーでダメージを与えるURカード
  accessoryDamage: cards(
    first: 10
    filter: { rarity: UR, accessoryEffectContains: "ダメージ" }
  ) {
    edges {
      node {
        id
        cardName
        characterName
        detail {
          accessories {
            name
            effect
            traitEffect
          }
        }
      }
    }
    totalCount
  }
}
```

---

## アクセサリー検索

### カードのアクセサリー一覧取得

```graphql
query GetAccessories {
  accessories(cardId: "1") {
    id
    cardId
    parentType
    name
    ap
    effect
    traitName
    traitEffect
    displayOrder
  }
}
```

### 親タイプでフィルタリング

```graphql
query GetAccessoriesByParentType {
  accessories(cardId: "1", filter: { parentType: SKILL }) {
    id
    parentType
    name
    effect
  }
}
```

**利用可能な親タイプ**: `SPECIAL_APPEAL`, `SKILL`, `TRAIT`

### アクセサリー名で検索

```graphql
query SearchAccessoriesByName {
  accessories(cardId: "1", filter: { nameContains: "スキル" }) {
    id
    name
    effect
  }
}
```

### アクセサリー効果で検索（スキル効果 OR 特性効果）

```graphql
query SearchAccessoriesByEffect {
  accessories(cardId: "1", filter: { effectContains: "ダメージ" }) {
    id
    parentType
    name
    effect # スキル効果
    traitEffect # 特性効果
  }
}
```

### 親タイプ + 効果で検索

```graphql
query SearchAccessoriesByTypeAndEffect {
  accessories(
    cardId: "1"
    filter: { parentType: SKILL, effectContains: "回復" }
  ) {
    id
    parentType
    name
    ap
    effect
  }
}
```

---

## 統計情報

### カード統計取得

```graphql
query GetCardStats {
  cardStats {
    totalCards
    byRarity {
      rarity
      count
    }
    byStyleType {
      styleType
      count
    }
    byCharacter {
      characterName
      count
    }
  }
}
```

---

## ソート

### 作成日時順（降順）

```graphql
query SortByCreatedAt {
  cards(first: 20, sort: { field: CREATED_AT, direction: DESC }) {
    edges {
      node {
        id
        cardName
        createdAt
      }
    }
  }
}
```

### カード名順（昇順）

```graphql
query SortByCardName {
  cards(first: 20, sort: { field: CARD_NAME, direction: ASC }) {
    edges {
      node {
        id
        cardName
      }
    }
  }
}
```

**利用可能なソートフィールド**: `ID`, `CARD_NAME`, `CHARACTER_NAME`, `CREATED_AT`, `UPDATED_AT`

**ソート方向**: `ASC`（昇順）, `DESC`（降順）

---

## 複数カードを同時取得

### 複数カードの詳細情報を一度に取得

```graphql
query GetMultipleCardDetails {
  cardDetails(cardIds: ["1", "2", "3"]) {
    id
    cardId
    favoriteMode
    acquisitionMethod
    stats {
      smile
      pure
      cool
      mental
    }
    specialAppeal {
      name
      ap
      effect
    }
    skill {
      name
      ap
      effect
    }
    trait {
      name
      effect
    }
    accessories {
      id
      parentType
      name
      ap
      effect
      traitName
      traitEffect
    }
    card {
      cardName
      characterName
      rarity
    }
  }
}
```

### エイリアスを使用した複数クエリ

```graphql
query GetMultipleCards {
  card1: card(id: "1") {
    cardName
    characterName
    rarity
  }
  card2: card(id: "2") {
    cardName
    characterName
    rarity
  }
  card3: card(id: "3") {
    cardName
    characterName
    rarity
  }
}
```

---

## 特性分析データ検索

### カードのハート獲得特性分析

カードが持つハート獲得系特性がどのセクションで発動するかの分析データを取得します。

```graphql
query GetCardWithHeartCollectAnalysis {
  card(id: "123") {
    id
    cardName
    characterName
    heartCollectAnalysis {
      id
      cardId
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
  }
}
```

### カードを引いてこない特性分析

カードが持つ「カードを引いてこない」特性（アンドロー）がどのセクションで発動するかの分析データを取得します。

```graphql
query GetCardWithUnDrawAnalysis {
  card(id: "123") {
    id
    cardName
    characterName
    unDrawAnalysis {
      id
      cardId
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
  }
}
```

### 両方の分析データを同時取得

```graphql
query GetCardWithAllAnalysis {
  card(id: "123") {
    id
    cardName
    characterName
    # ハート獲得特性分析
    heartCollectAnalysis {
      id
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
    # カードを引いてこない特性分析
    unDrawAnalysis {
      id
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
  }
}
```

### アクセサリーの特性分析データ

アクセサリーカードの特性分析データも同様に取得できます。

```graphql
query GetAccessoryWithAnalysis {
  card(id: "123") {
    id
    cardName
    detail {
      accessories {
        id
        name
        parentType
        # ハート獲得特性分析
        heartCollectAnalysis {
          id
          accessoryId
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
          conditionDetail
          analyzedAt
        }
        # カードを引いてこない特性分析
        unDrawAnalysis {
          id
          accessoryId
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
          conditionDetail
          analyzedAt
        }
      }
    }
  }
}
```

### 複数カードの特性分析データを一括取得（バッチクエリ）

編成されている複数のカードに対して、特性分析データを効率的に一括取得できます。
フロントエンドでカード編成画面などを表示する際に有用です。

**使用例：編成されている5枚のカードの特性分析を取得**

```graphql
query GetTraitAnalysisBatch {
  traitAnalysisBatch(
    inputs: [
      { cardId: 422 }
      { cardId: 423 }
      { cardId: 424 }
      { cardId: 104 }
      { cardId: 105 }
    ]
  ) {
    cardId
    heartCollect {
      id
      cardId
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
    unDraw {
      id
      cardId
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
  }
}
```

**レスポンス例:**

```json
{
  "data": {
    "traitAnalysisBatch": [
      {
        "cardId": 422,
        "heartCollect": {
          "id": "1",
          "cardId": 422,
          "sections": {
            "section1": true,
            "section2": false,
            "section3": true,
            "section4": false,
            "section5": true,
            "sectionFever": false
          },
          "conditionDetail": { "condition": "..." },
          "analyzedAt": "2024-01-01T00:00:00.000Z"
        },
        "unDraw": {
          "id": "2",
          "cardId": 422,
          "sections": {
            "section1": false,
            "section2": true,
            "section3": false,
            "section4": true,
            "section5": false,
            "sectionFever": true
          },
          "conditionDetail": { "condition": "..." },
          "analyzedAt": "2024-01-01T00:00:00.000Z"
        }
      },
      {
        "cardId": 423,
        "heartCollect": null,
        "unDraw": {
          "id": "3",
          "cardId": 423,
          "sections": {
            "section1": true,
            "section2": true,
            "section3": false,
            "section4": false,
            "section5": true,
            "sectionFever": false
          },
          "conditionDetail": null,
          "analyzedAt": "2024-01-01T00:00:00.000Z"
        }
      },
      {
        "cardId": 104,
        "heartCollect": null,
        "unDraw": null
      }
    ]
  }
}
```

**特徴：**

- **並列処理**: 複数カードのデータを効率的に並列取得
- **Null対応**: 分析データが存在しない場合は`null`を返却
- **キャッシュ活用**: Redis経由でキャッシュされたデータを優先利用
- **用途**: カード編成画面、チーム編成シミュレーター、特性効果一覧表示などに最適

**使い方のヒント：**

編成画面では、まず通常のカード情報を`cards`クエリで取得し、その後`traitAnalysisBatch`で特性分析データを追加取得することで、既存のカード取得APIとの分離を保ちつつ、必要に応じて特性分析データを効率的に取得できます。

```graphql
# 1. カード基本情報を取得
query GetCards {
  cards(filter: { rarity: UR }) {
    id
    cardName
    characterName
  }
}

# 2. 取得したカードIDで特性分析データを一括取得
query GetTraitAnalyses {
  traitAnalysisBatch(inputs: [{ cardId: 1 }, { cardId: 2 }, { cardId: 3 }]) {
    cardId
    heartCollect {
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
    }
    unDraw {
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
    }
  }
}
```

### 特定セクションで発動する特性を持つカードを検索

Section 3でハート獲得特性が発動するカードを検索する例：

```graphql
query FindSection3HeartCollectCards {
  cards(first: 20) {
    edges {
      node {
        id
        cardName
        characterName
        heartCollectAnalysis {
          sections {
            section1
            section2
            section3 # ここがtrueのカードを探す
            section4
            section5
            sectionFever
          }
        }
      }
    }
  }
}
```

### Feverセクションで発動するカードを引いてこない特性

```graphql
query FindFeverUnDrawCards {
  cards(first: 20) {
    edges {
      node {
        id
        cardName
        characterName
        unDrawAnalysis {
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever # ここがtrueのカードを探す
          }
        }
      }
    }
  }
}
```

### カード詳細と特性分析を含む完全な情報取得

```graphql
query GetCompleteCardWithAnalysis {
  card(id: "123") {
    # 基本情報
    id
    cardName
    characterName
    rarity
    limited
    styleType

    # カード詳細
    detail {
      specialAppeal {
        name
        effect
      }
      skill {
        name
        effect
      }
      trait {
        name
        effect
      }
      accessories {
        id
        name
        effect
        traitEffect
        # アクセサリーの分析データ
        heartCollectAnalysis {
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
        }
        unDrawAnalysis {
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
        }
      }
    }

    # カード本体の分析データ
    heartCollectAnalysis {
      id
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
    unDrawAnalysis {
      id
      sections {
        section1
        section2
        section3
        section4
        section5
        sectionFever
      }
      conditionDetail
      analyzedAt
    }
  }
}
```

**分析データの説明**:

- `heartCollectAnalysis`: ハート獲得系特性の発動セクション分析
- `unDrawAnalysis`: カードを引いてこない特性（アンドロー）の発動セクション分析
- `sections`: 各セクション（1〜5 + Fever）での発動有無
- `conditionDetail`: AI分析による詳細条件（JSON形式）
- `analyzedAt`: 分析実行日時
- `cardId`: カード本体に紐づく場合
- `accessoryId`: アクセサリーに紐づく場合

---

## 完全な情報取得

### すべてのフィールドを含む完全なカード情報

```graphql
query GetCompleteCardInfo {
  cards(first: 10) {
    edges {
      node {
        # 基本情報
        id
        cardName
        characterName
        rarity
        limited
        styleType
        cardUrl
        isLocked
        createdAt
        updatedAt

        # カード詳細
        detail {
          id
          favoriteMode
          acquisitionMethod
          awakeBeforeUrl
          awakeAfterUrl

          # ステータス
          stats {
            smile
            pure
            cool
            mental
          }

          # スペシャルアピール
          specialAppeal {
            name
            ap
            effect
          }

          # スキル
          skill {
            name
            ap
            effect
          }

          # 特性
          trait {
            name
            effect
          }

          # アクセサリー
          accessories {
            id
            parentType
            name
            ap
            effect
            traitName
            traitEffect
            displayOrder
            isLocked
            createdAt
            updatedAt

            # 特性分析データ
            heartCollectAnalysis {
              id
              accessoryId
              sections {
                section1
                section2
                section3
                section4
                section5
                sectionFever
              }
              conditionDetail
              analyzedAt
            }
            unDrawAnalysis {
              id
              accessoryId
              sections {
                section1
                section2
                section3
                section4
                section5
                sectionFever
              }
              conditionDetail
              analyzedAt
            }
          }
        }

        # カード本体の特性分析データ
        heartCollectAnalysis {
          id
          cardId
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
          conditionDetail
          analyzedAt
        }
        unDrawAnalysis {
          id
          cardId
          sections {
            section1
            section2
            section3
            section4
            section5
            sectionFever
          }
          conditionDetail
          analyzedAt
        }
      }
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

---

## 注意事項

- テキスト検索（`*Contains`フィルター）は大文字小文字を区別しません（case-insensitive）
- アクセサリー効果検索（`accessoryEffectContains`）は、`effect`（スキル効果）と`traitEffect`（特性効果）の両方を検索します
- ページネーションには`first`パラメータ（最大100）を指定してください
- カーソルベースのページネーションを使用する場合は、前のページの`endCursor`を`after`パラメータに渡してください
- 特性分析データ（`heartCollectAnalysis`, `unDrawAnalysis`）は、対応するデータが存在する場合のみ返却されます
- 分析データの`conditionDetail`はJSON形式で、AI分析による詳細条件が格納されています

---

## エンドポイント

```
http://localhost:4000/graphql
```

開発環境では、GraphQL Playgroundが利用可能です。
