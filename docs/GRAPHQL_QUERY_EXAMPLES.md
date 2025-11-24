# GraphQL クエリ例

Link Like Essentials Backend で使用できるGraphQLクエリの例を示します。

## 目次

- [基本的なクエリ](#基本的なクエリ)
- [カード検索](#カード検索)
- [効果検索（テキスト検索）](#効果検索テキスト検索)
- [複合検索](#複合検索)
- [アクセサリー検索](#アクセサリー検索)
- [統計情報](#統計情報)

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
    after: "カーソル文字列"  # 前のページのendCursorを指定
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
  cardByName(
    cardName: "【スターティングメンバー】"
    characterName: "月雫"
  ) {
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
  cards(
    first: 20
    filter: {
      rarity: UR
    }
  ) {
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
  cards(
    first: 20
    filter: {
      characterName: "月雫"
    }
  ) {
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
  cards(
    first: 20
    filter: {
      styleType: CHEERLEADER
    }
  ) {
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
  cards(
    first: 20
    filter: {
      limited: BIRTHDAY_LIMITED
    }
  ) {
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

**利用可能な限定区分**: `PERMANENT`, `LIMITED`, `SPRING_LIMITED`, `SUMMER_LIMITED`, `AUTUMN_LIMITED`, `WINTER_LIMITED`, `BIRTHDAY_LIMITED`, `LEG_LIMITED`, `BATTLE_LIMITED`, `PARTY_LIMITED`, `ACTIVITY_LIMITED`, `GRADUATE_LIMITED`, `LOGIN_BONUS`, `REWARD`

### カード名（部分一致）で検索

```graphql
query SearchByCardName {
  cards(
    first: 20
    filter: {
      cardName: "スターティング"
    }
  ) {
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
  cards(
    first: 20
    filter: {
      skillEffectContains: "アトラクト"
    }
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

### 特性効果で検索

```graphql
query SearchByTraitEffect {
  cards(
    first: 20
    filter: {
      traitEffectContains: "ダメージ"
    }
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
}
```

### スペシャルアピール効果で検索

```graphql
query SearchBySpecialAppealEffect {
  cards(
    first: 20
    filter: {
      specialAppealEffectContains: "全体"
    }
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
}
```

### アクセサリー効果で検索（スキル効果 OR 特性効果）

```graphql
query SearchByAccessoryEffect {
  cards(
    first: 20
    filter: {
      accessoryEffectContains: "回復"
    }
  ) {
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
            effect        # スキル効果
            traitName     # 特性名
            traitEffect   # 特性効果
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
  skillAttract: cards(first: 20, filter: { skillEffectContains: "アトラクト" }) {
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
  traitAttract: cards(first: 20, filter: { traitEffectContains: "アトラクト" }) {
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
  specialAttract: cards(first: 20, filter: { specialAppealEffectContains: "アトラクト" }) {
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
  accessoryAttract: cards(first: 20, filter: { accessoryEffectContains: "アトラクト" }) {
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
  cards(
    first: 20
    filter: {
      rarity: UR
      characterName: "月雫"
    }
  ) {
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
    filter: {
      rarity: UR
      styleType: CHEERLEADER
      characterName: "月雫"
    }
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
    filter: {
      characterName: "月雫"
      skillEffectContains: "アトラクト"
    }
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
    filter: {
      rarity: UR
      characterName: "月雫"
      skillEffectContains: "回復"
    }
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
    filter: {
      rarity: UR
      skillEffectContains: "ダメージ"
    }
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
    filter: {
      rarity: UR
      accessoryEffectContains: "ダメージ"
    }
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
  accessories(
    cardId: "1"
    filter: {
      parentType: SKILL
    }
  ) {
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
  accessories(
    cardId: "1"
    filter: {
      nameContains: "スキル"
    }
  ) {
    id
    name
    effect
  }
}
```

### アクセサリー効果で検索（スキル効果 OR 特性効果）

```graphql
query SearchAccessoriesByEffect {
  accessories(
    cardId: "1"
    filter: {
      effectContains: "ダメージ"
    }
  ) {
    id
    parentType
    name
    effect       # スキル効果
    traitEffect  # 特性効果
  }
}
```

### 親タイプ + 効果で検索

```graphql
query SearchAccessoriesByTypeAndEffect {
  accessories(
    cardId: "1"
    filter: {
      parentType: SKILL
      effectContains: "回復"
    }
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
  cards(
    first: 20
    sort: {
      field: CREATED_AT
      direction: DESC
    }
  ) {
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
  cards(
    first: 20
    sort: {
      field: CARD_NAME
      direction: ASC
    }
  ) {
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
          }
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

---

## エンドポイント

```
http://localhost:4000/graphql
```

開発環境では、GraphQL Playgroundが利用可能です。
