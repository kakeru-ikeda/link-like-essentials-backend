# Song GraphQL Query Examples

## 基本クエリ

### 全楽曲取得

```graphql
query GetAllSongs {
  songs {
    id
    songName
    category
    attribute
    centerCharacter
    singers
    jacketImageUrl
    liveAnalyzerImageUrl
    isLocked
    createdAt
    updatedAt
    moodProgressions {
      id
      section
      progression
      sectionOrder
    }
  }
}
```

### フィルター付き楽曲一覧取得

#### カテゴリーフィルター

```graphql
query GetSongsByCategory {
  songs(filter: { category: "103期" }) {
    id
    songName
    category
    attribute
    centerCharacter
    singers
  }
}
```

#### 属性フィルター

```graphql
query GetSongsByAttribute {
  songs(filter: { attribute: "クール" }) {
    id
    songName
    category
    attribute
    centerCharacter
  }
}
```

#### センターキャラクターフィルター

```graphql
query GetSongsByCenterCharacter {
  songs(filter: { centerCharacter: "大沢瑠璃乃" }) {
    id
    songName
    category
    attribute
    centerCharacter
    singers
  }
}
```

#### 楽曲名部分一致検索

```graphql
query SearchSongsByName {
  songs(filter: { songName: "DEEPNESS" }) {
    id
    songName
    category
    attribute
  }
}
```

#### 歌い手部分一致検索

```graphql
query SearchSongsBySingers {
  songs(filter: { singersContains: "乙宗梢" }) {
    id
    songName
    singers
    centerCharacter
  }
}
```

#### 複合フィルター

```graphql
query GetSongsWithMultipleFilters {
  songs(
    filter: {
      category: "104期"
      attribute: "ピュア"
      singersContains: "乙宗梢"
    }
  ) {
    id
    songName
    category
    attribute
    centerCharacter
    singers
  }
}
```

### 単一楽曲取得

#### IDで取得

```graphql
query GetSongById {
  song(id: "3") {
    id
    songName
    songUrl
    category
    attribute
    centerCharacter
    singers
    jacketImageUrl
    liveAnalyzerImageUrl
    isLocked
    createdAt
    updatedAt
    moodProgressions {
      id
      section
      progression
      sectionOrder
      isLocked
      createdAt
      updatedAt
    }
  }
}
```

#### 楽曲名で取得

```graphql
query GetSongByName {
  songByName(songName: "On your mark") {
    id
    songName
    songUrl
    category
    attribute
    centerCharacter
    singers
    jacketImageUrl
    liveAnalyzerImageUrl
    moodProgressions {
      id
      section
      progression
      sectionOrder
    }
  }
}
```

### 統計情報取得

```graphql
query GetSongStats {
  songStats {
    totalSongs
    byCategory {
      category
      count
    }
    byAttribute {
      attribute
      count
    }
    byCenterCharacter {
      centerCharacter
      count
    }
  }
}
```

## ムード推移詳細

### 特定楽曲のムード推移のみ取得

```graphql
query GetSongMoodProgressions {
  song(id: "3") {
    songName
    moodProgressions {
      id
      section
      progression
      sectionOrder
      isLocked
    }
  }
}
```

## 認証ヘッダー例

すべてのクエリには認証ヘッダーが必要です:

```json
{
  "Authorization": "Bearer YOUR_FIREBASE_ID_TOKEN"
}
```
