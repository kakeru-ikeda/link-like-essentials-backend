# GraphQL Mutation Examples for Admin Panel

このドキュメントは、管理画面から使用できるGraphQL Mutation操作の例を示します。

## 認証・認可

すべてのMutation操作には**管理者権限**が必要です。

### 要件
1. **認証**: 有効なFirebase IDトークンをリクエストヘッダーに含める
2. **認可**: Firebase Authのカスタムクレームで `admin: true` が設定されている必要があります

```
Authorization: Bearer <Firebase-ID-Token>
```

### 管理者権限の設定

Firebase Authのカスタムクレームで管理者権限を設定する必要があります：

```javascript
// Firebase Admin SDK を使用して管理者権限を設定
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### エラーレスポンス

- **認証エラー (401)**: トークンが無効または欠落している場合
- **認可エラー (403)**: 管理者権限がない場合

```json
{
  "errors": [
    {
      "message": "管理者権限が必要です。この操作は管理者のみ実行できます。",
      "extensions": {
        "code": "FORBIDDEN"
      }
    }
  ]
}
```

---

## Card Mutations

### カード作成 (createCard)

```graphql
mutation CreateCard {
  createCard(
    input: {
      cardName: "新しいカード"
      characterName: "キャラクター名"
      rarity: UR
      limited: LIMITED
      styleType: CHEERLEADER
      cardUrl: "https://example.com/card.jpg"
      releaseDate: "2024-01-01"
      isLocked: false
    }
  ) {
    id
    cardName
    characterName
    rarity
    limited
    styleType
    cardUrl
    releaseDate
    isLocked
    createdAt
    updatedAt
  }
}
```

### カード更新 (updateCard)

```graphql
mutation UpdateCard {
  updateCard(
    id: "1"
    input: {
      cardName: "更新されたカード名"
      rarity: SR
      isLocked: true
    }
  ) {
    id
    cardName
    characterName
    rarity
    limited
    styleType
    isLocked
    updatedAt
  }
}
```

### カード削除 (deleteCard)

```graphql
mutation DeleteCard {
  deleteCard(id: "1") {
    success
    message
  }
}
```

---

## CardDetail Mutations

### カード詳細作成・更新 (upsertCardDetail)

upsertは、カード詳細が存在しない場合は作成、存在する場合は更新します。

```graphql
mutation UpsertCardDetail {
  upsertCardDetail(
    input: {
      cardId: "1"
      favoriteMode: HAPPY
      acquisitionMethod: "ガチャ"
      awakeBeforeUrl: "https://example.com/before.jpg"
      awakeAfterUrl: "https://example.com/after.jpg"
      smileMaxLevel: "60"
      pureMaxLevel: "55"
      coolMaxLevel: "50"
      mentalMaxLevel: "45"
      specialAppealName: "スペシャルアピール名"
      specialAppealAp: "10"
      specialAppealEffect: "スペシャルアピール効果説明"
      skillName: "スキル名"
      skillAp: "5"
      skillEffect: "スキル効果説明"
      traitName: "特性名"
      traitEffect: "特性効果説明"
      isLocked: false
    }
  ) {
    id
    cardId
    favoriteMode
    acquisitionMethod
    smileMaxLevel
    pureMaxLevel
    coolMaxLevel
    mentalMaxLevel
    specialAppealName
    specialAppealEffect
    skillName
    skillEffect
    traitName
    traitEffect
    updatedAt
  }
}
```

### 一部フィールドのみ更新

```graphql
mutation UpdateCardDetailPartial {
  upsertCardDetail(
    input: {
      cardId: "1"
      skillName: "新しいスキル名"
      skillEffect: "新しいスキル効果"
    }
  ) {
    id
    cardId
    skillName
    skillEffect
    updatedAt
  }
}
```

---

## Accessory Mutations

### アクセサリー作成 (createAccessory)

```graphql
mutation CreateAccessory {
  createAccessory(
    input: {
      cardId: "1"
      parentType: SPECIAL_APPEAL
      name: "アクセサリー名"
      ap: "10"
      effect: "効果説明"
      traitName: "特性名"
      traitEffect: "特性効果説明"
      displayOrder: 1
      isLocked: false
    }
  ) {
    id
    cardId
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
```

### アクセサリー更新 (updateAccessory)

```graphql
mutation UpdateAccessory {
  updateAccessory(
    id: "1"
    input: {
      name: "更新されたアクセサリー名"
      effect: "更新された効果説明"
      displayOrder: 2
    }
  ) {
    id
    name
    effect
    displayOrder
    updatedAt
  }
}
```

### アクセサリー削除 (deleteAccessory)

```graphql
mutation DeleteAccessory {
  deleteAccessory(id: "1") {
    success
    message
  }
}
```

---

## 利用可能なENUM値

### Rarity (レアリティ)
- `UR`
- `SR`
- `R`
- `DR`
- `BR`
- `LR`

### LimitedType (限定区分)
- `PERMANENT` (恒常)
- `LIMITED` (限定)
- `SPRING_LIMITED` (春限定)
- `SUMMER_LIMITED` (夏限定)
- `AUTUMN_LIMITED` (秋限定)
- `WINTER_LIMITED` (冬限定)
- `BIRTHDAY_LIMITED` (誕限定)
- `LEG_LIMITED` (LEG限定)
- `BATTLE_LIMITED` (撃限定)
- `PARTY_LIMITED` (宴限定)
- `ACTIVITY_LIMITED` (活限定)
- `BANGDREAM_LIMITED` (団限定)
- `GRADUATE_LIMITED` (卒限定)
- `LOGIN_BONUS` (ログボ)
- `REWARD` (報酬)

### StyleType (スタイルタイプ)
- `CHEERLEADER` (チアリーダー)
- `TRICKSTER` (トリックスター)
- `PERFORMER` (パフォーマー)
- `MOODMAKER` (ムードメーカー)
- `MOODOMAKER` (ムードーメーカー - 誤字版)

### FavoriteMode (お気に入りモード)
- `HAPPY` (ハッピー)
- `MELLOW` (メロウ)
- `NEUTRAL` (ニュートラル)
- `NONE` (--)

### ParentType (アクセサリーの親タイプ)
- `SPECIAL_APPEAL` (special_appeal)
- `SKILL` (skill)
- `TRAIT` (trait)

---

## エラーハンドリング

### 認証エラー
認証トークンが無効または欠落している場合：
```json
{
  "errors": [
    {
      "message": "Authentication required",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### バリデーションエラー
必須フィールドが欠落している場合：
```json
{
  "errors": [
    {
      "message": "Field \"cardName\" of required type \"String!\" was not provided.",
      "extensions": {
        "code": "GRAPHQL_VALIDATION_FAILED"
      }
    }
  ]
}
```

### NotFoundエラー
存在しないIDで更新・削除を試みた場合：
```json
{
  "errors": [
    {
      "message": "Card with id 999 not found",
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

---

## 複合操作の例

### カード新規登録（カード + 詳細 + アクセサリー）

```graphql
# Step 1: カード作成
mutation Step1_CreateCard {
  createCard(
    input: {
      cardName: "新カード"
      characterName: "キャラA"
      rarity: UR
      limited: LIMITED
    }
  ) {
    id
  }
}

# Step 2: カード詳細追加（返されたidを使用）
mutation Step2_AddDetail {
  upsertCardDetail(
    input: {
      cardId: "123"  # Step 1で返されたid
      favoriteMode: HAPPY
      skillName: "スキルA"
      skillEffect: "効果A"
    }
  ) {
    id
  }
}

# Step 3: アクセサリー追加
mutation Step3_AddAccessory {
  createAccessory(
    input: {
      cardId: "123"  # Step 1で返されたid
      parentType: SKILL
      name: "スキルアクセサリー"
      effect: "効果説明"
      displayOrder: 1
    }
  ) {
    id
  }
}
```

---

## キャッシュ動作

すべてのMutation操作は以下のキャッシュ戦略を適用します：

1. **Create操作**
   - 全キャッシュを無効化
   - 新規作成されたデータをキャッシュに保存

2. **Update操作**
   - 全キャッシュを無効化
   - 更新されたデータをキャッシュに保存

3. **Delete操作**
   - 全キャッシュを無効化

これにより、常に最新のデータが取得されることが保証されます。

---

## 注意事項

1. すべてのMutation操作には認証が必須です
2. データベース制約（ユニーク制約など）に違反する操作はエラーになります
3. `isLocked`フィールドで管理画面からの編集をロックできます
4. ENUM値は大文字で指定してください（例: `PERMANENT`, `UR`）
5. 日付フィールドはISO 8601形式で指定してください（例: `"2024-01-01"`）
