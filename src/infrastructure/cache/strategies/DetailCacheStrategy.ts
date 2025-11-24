
import type { CardDetail } from '@/domain/entities/CardDetail';

import type { CacheService } from '../CacheService';
import { TTL } from './CardCacheStrategy';


export class DetailCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getDetail(cardId: number): Promise<CardDetail | null> {
    return await this.cache.get<CardDetail>(`cardDetail:${cardId}`);
  }

  async setDetail(detail: CardDetail): Promise<void> {
    await this.cache.set(
      `cardDetail:${detail.cardId}`,
      detail,
      TTL.CARD_DETAIL
    );
  }

  async invalidateDetail(cardId: number): Promise<void> {
    await this.cache.del(`cardDetail:${cardId}`);
  }

  async invalidateAllDetails(): Promise<void> {
    await this.cache.invalidatePattern('cardDetail:*');
  }
}
