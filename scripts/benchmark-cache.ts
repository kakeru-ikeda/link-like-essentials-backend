#!/usr/bin/env ts-node-dev
/**
 * キャッシュパフォーマンス評価スクリプト
 *
 * 使い方:
 * 1. サーバーを起動
 * 2. npm run benchmark:cache
 *
 * このスクリプトは以下を実行:
 * - 同じクエリを複数回実行してキャッシュヒット率を計測
 * - キャッシュなし vs キャッシュありの比較
 */

interface BenchmarkResult {
  test: string;
  totalRequests: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:4001/graphql';

async function executeQuery(query: string, variables?: Record<string, unknown>): Promise<number> {
  const startTime = performance.now();

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  await response.json();
  const duration = performance.now() - startTime;

  return duration;
}

async function runBenchmark(
  name: string,
  query: string,
  variables: Record<string, unknown> | undefined,
  iterations: number
): Promise<BenchmarkResult> {
  console.log(`\n🔄 Running: ${name} (${iterations} iterations)...`);

  const durations: number[] = [];

  for (let i = 0; i < iterations; i++) {
    try {
      const duration = await executeQuery(query, variables);
      durations.push(duration);

      // プログレス表示
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`  Progress: ${i + 1}/${iterations}\r`);
      }
    } catch (error) {
      console.error(`  ❌ Error at iteration ${i + 1}:`, error);
    }

    // レート制限対策（10ms待機）
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const totalDuration = durations.reduce((sum, d) => sum + d, 0);
  const avgDuration = totalDuration / durations.length;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  return {
    test: name,
    totalRequests: iterations,
    totalDuration,
    avgDuration,
    minDuration,
    maxDuration,
  };
}

async function resetMetrics(): Promise<void> {
  const query = `
    query {
      resetMetrics {
        success
        message
      }
    }
  `;

  await executeQuery(query);
  console.log('✅ Metrics reset');
}

async function getMetricsSummary(): Promise<string> {
  const query = `
    query {
      metricsSummary
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const result = (await response.json()) as { data: { metricsSummary: string } };
  return result.data.metricsSummary;
}

function printResults(results: BenchmarkResult[]): void {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 BENCHMARK RESULTS');
  console.log('═══════════════════════════════════════════════════════');
  console.log(
    String(
      'Test'.padEnd(35) +
        'Requests'.padEnd(10) +
        'Avg(ms)'.padEnd(10) +
        'Min(ms)'.padEnd(10) +
        'Max(ms)'.padEnd(10)
    )
  );
  console.log('───────────────────────────────────────────────────────');

  for (const result of results) {
    console.log(
      String(
        result.test.padEnd(35) +
          result.totalRequests.toString().padEnd(10) +
          result.avgDuration.toFixed(2).padEnd(10) +
          result.minDuration.toFixed(2).padEnd(10) +
          result.maxDuration.toFixed(2).padEnd(10)
      )
    );
  }

  console.log('═══════════════════════════════════════════════════════\n');

  // 改善率を計算
  if (results.length >= 2) {
    const coldStart = results[0];
    const cached = results[1];

    if (coldStart && cached) {
      const improvement = ((coldStart.avgDuration - cached.avgDuration) / coldStart.avgDuration) * 100;
      console.log(`🚀 Cache Improvement: ${improvement.toFixed(2)}% faster`);
      console.log(
        `   Cold Start Avg: ${coldStart.avgDuration.toFixed(2)}ms → Cached Avg: ${cached.avgDuration.toFixed(2)}ms\n`
      );
    }
  }
}

async function main(): Promise<void> {
  console.log('🎯 Starting Cache Performance Benchmark...\n');

  const results: BenchmarkResult[] = [];

  // テスト1: Cold Start（キャッシュなし）
  await resetMetrics();
  const coldStart = await runBenchmark(
    '1. Cold Start (First Request)',
    `
      query {
        card(id: "1") {
          id
          cardName
          characterName
          rarity
        }
      }
    `,
    undefined,
    1
  );
  results.push(coldStart);

  // テスト2: Cache Hit（同じクエリを複数回）
  const cacheHit = await runBenchmark(
    '2. Cache Hit (Same Query)',
    `
      query {
        card(id: "1") {
          id
          cardName
          characterName
          rarity
        }
      }
    `,
    undefined,
    50
  );
  results.push(cacheHit);

  // テスト3: 異なるカードでの Cold Start
  await resetMetrics();
  const coldStart2 = await runBenchmark(
    '3. Different Card (Cold)',
    `
      query {
        card(id: "10") {
          id
          cardName
          characterName
          rarity
        }
      }
    `,
    undefined,
    1
  );
  results.push(coldStart2);

  // テスト4: リスト検索（Cold）
  const listCold = await runBenchmark(
    '4. List Query (Cold)',
    `
      query {
        cards(first: 10) {
          edges {
            node {
              id
              cardName
              characterName
            }
          }
        }
      }
    `,
    undefined,
    1
  );
  results.push(listCold);

  // テスト5: リスト検索（Cached）
  const listCached = await runBenchmark(
    '5. List Query (Cached)',
    `
      query {
        cards(first: 10) {
          edges {
            node {
              id
              cardName
              characterName
            }
          }
        }
      }
    `,
    undefined,
    30
  );
  results.push(listCached);

  // 結果表示
  printResults(results);

  // サーバー側のメトリクスを表示
  console.log('Fetching server-side metrics...\n');
  const serverMetrics = await getMetricsSummary();
  console.log(serverMetrics);

  console.log('\n✅ Benchmark Complete!');
  console.log('\n💡 Tips:');
  console.log('   - 1回目と2回目以降の差が大きいほど、キャッシュが効いています');
  console.log('   - Cache Hit Rateが高いほど、キャッシュが有効活用されています');
  console.log('   - Avg(ms)が小さいほど、レスポンスが速いです');
}

main().catch((error) => {
  console.error('❌ Benchmark failed:', error);
  process.exit(1);
});
