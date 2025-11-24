export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

export interface QueryMetrics {
  queryName: string;
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  cacheHits: number;
  cacheMisses: number;
}

export class PerformanceMetrics {
  private cacheHits = 0;
  private cacheMisses = 0;
  private queryMetrics = new Map<string, QueryMetrics>();

  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  recordQuery(queryName: string, duration: number, isCacheHit: boolean): void {
    const existing = this.queryMetrics.get(queryName);

    if (!existing) {
      this.queryMetrics.set(queryName, {
        queryName,
        count: 1,
        totalDuration: duration,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        cacheHits: isCacheHit ? 1 : 0,
        cacheMisses: isCacheHit ? 0 : 1,
      });
    } else {
      const newCount = existing.count + 1;
      const newTotal = existing.totalDuration + duration;

      this.queryMetrics.set(queryName, {
        ...existing,
        count: newCount,
        totalDuration: newTotal,
        avgDuration: newTotal / newCount,
        minDuration: Math.min(existing.minDuration, duration),
        maxDuration: Math.max(existing.maxDuration, duration),
        cacheHits: existing.cacheHits + (isCacheHit ? 1 : 0),
        cacheMisses: existing.cacheMisses + (isCacheHit ? 0 : 1),
      });
    }
  }

  getCacheMetrics(): CacheMetrics {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? (this.cacheHits / total) * 100 : 0,
      totalRequests: total,
    };
  }

  getQueryMetrics(): QueryMetrics[] {
    return Array.from(this.queryMetrics.values()).sort(
      (a, b) => b.count - a.count
    );
  }

  getMetricsSummary(): string {
    const cache = this.getCacheMetrics();
    const queries = this.getQueryMetrics();

    let summary = '\n';
    summary += '═══════════════════════════════════════════════════════\n';
    summary += '📊 CACHE & PERFORMANCE METRICS\n';
    summary += '═══════════════════════════════════════════════════════\n\n';

    summary += '🎯 Cache Statistics:\n';
    summary += `   Total Requests: ${cache.totalRequests}\n`;
    summary += `   Cache Hits:     ${cache.hits} (${cache.hitRate.toFixed(2)}%)\n`;
    summary += `   Cache Misses:   ${cache.misses}\n\n`;

    if (queries.length > 0) {
      summary += '⚡ Query Performance:\n';
      summary += '───────────────────────────────────────────────────────\n';
      summary += String(
        'Query'.padEnd(25) +
          'Count'.padEnd(8) +
          'Avg(ms)'.padEnd(10) +
          'Min(ms)'.padEnd(10) +
          'Max(ms)'.padEnd(10) +
          'Hit%\n'
      );
      summary += '───────────────────────────────────────────────────────\n';

      for (const metric of queries) {
        const hitRate =
          metric.count > 0
            ? ((metric.cacheHits / metric.count) * 100).toFixed(1)
            : '0.0';

        summary += String(
          metric.queryName.padEnd(25) +
            metric.count.toString().padEnd(8) +
            metric.avgDuration.toFixed(2).padEnd(10) +
            metric.minDuration.toFixed(2).padEnd(10) +
            metric.maxDuration.toFixed(2).padEnd(10) +
            `${hitRate}%\n`
        );
      }
    }

    summary += '═══════════════════════════════════════════════════════\n';
    return summary;
  }

  reset(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.queryMetrics.clear();
  }
}

// シングルトンインスタンス
export const performanceMetrics = new PerformanceMetrics();
