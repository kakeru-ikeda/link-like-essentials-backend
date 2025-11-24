# キャッシュパフォーマンス評価ガイド

## 概要

このガイドでは、Prisma + Redisのキャッシュ効果を正しく評価する方法を説明します。

## 📊 評価方法

### 1. GraphQLクエリによる手動評価

サーバーを起動後、以下のクエリでメトリクスを確認できます。

```bash
# サーバー起動
npm run dev
```

#### キャッシュメトリクスを確認

```graphql
query {
  cacheMetrics {
    hits
    misses
    hitRate
    totalRequests
  }
}
```

#### クエリごとのパフォーマンスを確認

```graphql
query {
  queryMetrics {
    queryName
    count
    avgDuration
    minDuration
    maxDuration
    cacheHits
    cacheMisses
  }
}
```

#### サマリーをテキストで確認

```graphql
query {
  metricsSummary
}
```

#### メトリクスをリセット

```graphql
query {
  resetMetrics {
    success
    message
  }
}
```

### 2. ベンチマークスクリプトによる自動評価

専用のベンチマークスクリプトで自動的にキャッシュ効果を計測できます。

```bash
# 別ターミナルでサーバーを起動
npm run dev

# ベンチマーク実行
npm run benchmark:cache
```

#### 出力例

```
═══════════════════════════════════════════════════════
📊 BENCHMARK RESULTS
═══════════════════════════════════════════════════════
Test                               Requests  Avg(ms)   Min(ms)   Max(ms)
───────────────────────────────────────────────────────────────────────
1. Cold Start (First Request)      1         45.23     45.23     45.23
2. Cache Hit (Same Query)          50        2.15      1.89      3.45
3. Different Card (Cold)           1         42.87     42.87     42.87
4. List Query (Cold)               1         78.34     78.34     78.34
5. List Query (Cached)             30        3.21      2.67      4.12
═══════════════════════════════════════════════════════

🚀 Cache Improvement: 95.24% faster
   Cold Start Avg: 45.23ms → Cached Avg: 2.15ms

═══════════════════════════════════════════════════════
📊 CACHE & PERFORMANCE METRICS
═══════════════════════════════════════════════════════

🎯 Cache Statistics:
   Total Requests: 83
   Cache Hits:     80 (96.39%)
   Cache Misses:   3

⚡ Query Performance:
───────────────────────────────────────────────────────
Query                    Count   Avg(ms)   Min(ms)   Max(ms)   Hit%
───────────────────────────────────────────────────────────────────────
findById                 51      3.45      1.89      45.23     98.0%
findAll                  31      5.67      2.67      78.34     96.8%
───────────────────────────────────────────────────────────────────────
═══════════════════════════════════════════════════════
```

## 🔍 評価指標

### 1. キャッシュヒット率 (Hit Rate)

**目標**: 80%以上

- **90%以上**: 優秀 - キャッシュが非常に効いている
- **70-89%**: 良好 - キャッシュが適切に機能している
- **50-69%**: 要改善 - キャッシュ戦略の見直しを検討
- **50%未満**: 問題あり - キャッシュTTLや戦略を再設計

### 2. レスポンスタイム改善率

**目標**: 80%以上の高速化

- Cold Start（初回）vs Cache Hit（2回目以降）の比較
- **10倍以上の高速化**: 理想的
- **5-10倍**: 良好
- **2-5倍**: 改善の余地あり
- **2倍未満**: キャッシュ効果が薄い

### 3. 平均レスポンスタイム

**目標値**:
- **単一カード取得 (findById)**: <5ms (キャッシュヒット時)
- **リスト検索 (findAll)**: <10ms (キャッシュヒット時)
- **詳細情報含む**: <15ms (キャッシュヒット時)

## 🧪 テスト手順

### A. 基本的なキャッシュ効果テスト

```bash
# 1. メトリクスリセット
query { resetMetrics { success } }

# 2. 同じクエリを3回実行
query { card(id: "1") { id cardName } }
query { card(id: "1") { id cardName } }
query { card(id: "1") { id cardName } }

# 3. 結果確認
query { metricsSummary }
```

**期待結果**:
- 1回目: Cache Miss（遅い）
- 2-3回目: Cache Hit（速い）
- Hit Rate: 66.7%

### B. 異なるクエリパターンのテスト

```bash
# 異なるIDで実行
query { card(id: "1") { id } }
query { card(id: "2") { id } }
query { card(id: "3") { id } }

# 各IDで2回目
query { card(id: "1") { id } }
query { card(id: "2") { id } }
query { card(id: "3") { id } }
```

**期待結果**:
- 各IDの初回: Cache Miss
- 各IDの2回目: Cache Hit
- Hit Rate: 50%

### C. リストクエリのキャッシュテスト

```bash
# 同じフィルター条件で複数回
query { cards(first: 10, filter: { rarity: UR }) { edges { node { id } } } }
query { cards(first: 10, filter: { rarity: UR }) { edges { node { id } } } }

# 異なるフィルター
query { cards(first: 10, filter: { rarity: SR }) { edges { node { id } } } }
```

**期待結果**:
- 同じフィルター: 2回目以降はCache Hit
- 異なるフィルター: Cache Miss

## 📈 キャッシュ無効化のテスト

Redisを停止してキャッシュなしの状態を比較：

```bash
# Redisを停止
docker compose -f docker/docker-compose.yml stop redis

# サーバー再起動（キャッシュなし）
npm run dev

# ベンチマーク実行
npm run benchmark:cache

# Redis再起動
docker compose -f docker/docker-compose.yml start redis
```

**比較ポイント**:
- キャッシュなし: すべてのリクエストが遅い（一定）
- キャッシュあり: 2回目以降が劇的に速い

## 🛠 トラブルシューティング

### キャッシュヒット率が低い

**原因**:
1. TTLが短すぎる → `src/infrastructure/cache/strategies/*.ts` で調整
2. クエリパラメータが微妙に異なる → ハッシュ生成ロジックを確認
3. キャッシュが満杯 → Redis maxmemory設定を確認

### レスポンスタイムの改善が小さい

**原因**:
1. ネットワークレイテンシが支配的 → ローカル環境でテスト
2. Redisのパフォーマンス問題 → Redis設定を確認
3. シリアライゼーションコスト → データサイズを削減

### ベンチマークが失敗する

**原因**:
1. サーバーが起動していない → `npm run dev` を実行
2. GraphQLエンドポイントが異なる → `GRAPHQL_ENDPOINT` 環境変数を設定
3. データが存在しない → DBにテストデータを投入

```bash
# エンドポイント指定（デフォルトは http://localhost:4001/graphql）
GRAPHQL_ENDPOINT=http://localhost:4001/graphql npm run benchmark:cache
```

## 💡 最適化のヒント

### 1. TTLの調整

```typescript
// src/infrastructure/cache/strategies/CardCacheStrategy.ts
export const TTL = {
  CARD: 24 * 60 * 60,      // 更新頻度が低い → 長め
  CARD_LIST: 60 * 60,      // 更新頻度が中 → 中程度
  CARD_DETAIL: 6 * 60 * 60, // 更新頻度が低い → 長め
  STATS: 30 * 60,          // 更新頻度が高い → 短め
};
```

### 2. キャッシュウォーミング

起動時に頻繁にアクセスされるデータを事前キャッシュ：

```typescript
// サーバー起動時に実行
async function warmupCache() {
  await cardService.findAll({ first: 100 }); // 人気カード100件
  await cardService.getStats(); // 統計情報
}
```

### 3. キャッシュ無効化戦略

データ更新時にキャッシュを適切に無効化：

```typescript
// カード更新時
await cardRepository.update(cardId, data);
await cacheStrategy.invalidateCard(cardId);
```

## 📊 継続的なモニタリング

本番環境では定期的にメトリクスを確認：

```bash
# 毎日実行
npm run benchmark:cache > logs/cache-metrics-$(date +%Y%m%d).log
```

Grafana + Prometheusでリアルタイム監視も推奨。
