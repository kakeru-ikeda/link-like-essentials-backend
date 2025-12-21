import type { LiveGrandPrix } from '@/domain/entities/LiveGrandPrix';

import type { CacheService } from '../CacheService';

export const LIVE_GRAND_PRIX_TTL = {
  LIVE_GRAND_PRIX: 24 * 60 * 60, // 24時間
  LIVE_GRAND_PRIX_LIST: 60 * 60, // 1時間
  STATS: 30 * 60, // 30分
} as const;

export class LiveGrandPrixCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getLiveGrandPrix(id: number): Promise<LiveGrandPrix | null> {
    return await this.cache.get<LiveGrandPrix>(`liveGrandPrix:${id}`);
  }

  async setLiveGrandPrix(liveGrandPrix: LiveGrandPrix): Promise<void> {
    await this.cache.set(
      `liveGrandPrix:${liveGrandPrix.id}`,
      liveGrandPrix,
      LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX
    );
  }

  async getLiveGrandPrixByEventName(
    eventName: string
  ): Promise<LiveGrandPrix | null> {
    const key = `liveGrandPrix:eventName:${eventName}`;
    return await this.cache.get<LiveGrandPrix>(key);
  }

  async setLiveGrandPrixByEventName(
    liveGrandPrix: LiveGrandPrix
  ): Promise<void> {
    const key = `liveGrandPrix:eventName:${liveGrandPrix.eventName}`;
    await this.cache.set(
      key,
      liveGrandPrix,
      LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX
    );
  }

  async getLiveGrandPrixList(
    filterHash: string
  ): Promise<LiveGrandPrix[] | null> {
    return await this.cache.get<LiveGrandPrix[]>(
      `liveGrandPrix:list:${filterHash}`
    );
  }

  async setLiveGrandPrixList(
    filterHash: string,
    liveGrandPrixList: LiveGrandPrix[]
  ): Promise<void> {
    await this.cache.set(
      `liveGrandPrix:list:${filterHash}`,
      liveGrandPrixList,
      LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX_LIST
    );
  }

  async invalidateLiveGrandPrix(id: number): Promise<void> {
    await this.cache.del(`liveGrandPrix:${id}`);
    // 一覧キャッシュも無効化
    await this.cache.invalidatePattern('liveGrandPrix:list:*');
  }

  async invalidateAllLiveGrandPrix(): Promise<void> {
    await this.cache.invalidatePattern('liveGrandPrix:*');
  }

  async getStats<T>(): Promise<T | null> {
    return await this.cache.get<T>('liveGrandPrix:stats');
  }

  async setStats<T>(stats: T): Promise<void> {
    await this.cache.set(
      'liveGrandPrix:stats',
      stats,
      LIVE_GRAND_PRIX_TTL.STATS
    );
  }
}
