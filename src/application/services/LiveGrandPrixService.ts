import crypto from 'crypto';

import type { LiveGrandPrix } from '@/domain/entities/LiveGrandPrix';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ILiveGrandPrixRepository } from '@/domain/repositories/ILiveGrandPrixRepository';
import type { LiveGrandPrixCacheStrategy } from '@/infrastructure/cache/strategies/LiveGrandPrixCacheStrategy';

import type {
  LiveGrandPrixFilterInput,
  LiveGrandPrixStatsResult,
} from '../dto/LiveGrandPrixDTO';

export class LiveGrandPrixService {
  constructor(
    private readonly liveGrandPrixRepository: ILiveGrandPrixRepository,
    private readonly cacheStrategy: LiveGrandPrixCacheStrategy
  ) {}

  async findById(id: number): Promise<LiveGrandPrix> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getLiveGrandPrix(id);
    if (cached) {
      return cached;
    }

    // DBから取得
    const liveGrandPrix = await this.liveGrandPrixRepository.findById(id);
    if (!liveGrandPrix) {
      throw new NotFoundError(`LiveGrandPrix with id ${id} not found`);
    }

    // キャッシュに保存
    await this.cacheStrategy.setLiveGrandPrix(liveGrandPrix);

    return liveGrandPrix;
  }

  async findByEventName(eventName: string): Promise<LiveGrandPrix | null> {
    // キャッシュチェック
    const cached =
      await this.cacheStrategy.getLiveGrandPrixByEventName(eventName);
    if (cached) {
      return cached;
    }

    // DBから取得
    const liveGrandPrix =
      await this.liveGrandPrixRepository.findByEventName(eventName);

    // キャッシュに保存
    if (liveGrandPrix) {
      await this.cacheStrategy.setLiveGrandPrixByEventName(liveGrandPrix);
    }

    return liveGrandPrix;
  }

  async findAll(filter?: LiveGrandPrixFilterInput): Promise<LiveGrandPrix[]> {
    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter);

    // キャッシュチェック
    const cached = await this.cacheStrategy.getLiveGrandPrixList(filterHash);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // DBから取得
    const liveGrandPrixList =
      await this.liveGrandPrixRepository.findAll(filter);

    // キャッシュに保存
    await this.cacheStrategy.setLiveGrandPrixList(
      filterHash,
      liveGrandPrixList
    );

    return liveGrandPrixList;
  }

  async findOngoing(): Promise<LiveGrandPrix[]> {
    // キャッシュキー
    const cacheKey = 'ongoing';

    // キャッシュチェック
    const cached = await this.cacheStrategy.getLiveGrandPrixList(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // DBから取得
    const ongoingEvents = await this.liveGrandPrixRepository.findOngoing();

    // キャッシュに保存（開催中のイベントは頻繁に変わらないので1時間キャッシュ）
    await this.cacheStrategy.setLiveGrandPrixList(cacheKey, ongoingEvents);

    return ongoingEvents;
  }

  async getStats(): Promise<LiveGrandPrixStatsResult> {
    // キャッシュチェック
    const cached =
      await this.cacheStrategy.getStats<LiveGrandPrixStatsResult>();
    if (cached) {
      return cached;
    }

    // DBから取得
    const stats = await this.liveGrandPrixRepository.getStats();

    const result: LiveGrandPrixStatsResult = {
      totalEvents: stats.totalEvents,
      byYearTerm: stats.byYearTerm,
    };

    // キャッシュに保存
    await this.cacheStrategy.setStats<LiveGrandPrixStatsResult>(result);

    return result;
  }

  private generateFilterHash(filter?: LiveGrandPrixFilterInput): string {
    const data = JSON.stringify({ filter });
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
