import type { Card } from '@/domain/entities/Card';

import type { CacheService } from '../CacheService';

export const TTL = {
  CARD: 24 * 60 * 60, // 24時間
  CARD_LIST: 60 * 60, // 1時間
  CARD_DETAIL: 6 * 60 * 60, // 6時間
  STATS: 30 * 60, // 30分
} as const;

export class CardCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getCard(id: number): Promise<Card | null> {
    return await this.cache.get<Card>(`card:${id}`);
  }

  async setCard(card: Card): Promise<void> {
    await this.cache.set(`card:${card.id}`, card, TTL.CARD);
  }

  async getCardByName(
    cardName: string,
    characterName: string
  ): Promise<Card | null> {
    const key = `card:name:${cardName}:${characterName}`;
    return await this.cache.get<Card>(key);
  }

  async setCardByName(card: Card): Promise<void> {
    const key = `card:name:${card.cardName}:${card.characterName}`;
    await this.cache.set(key, card, TTL.CARD);
  }

  async getCardList(filterHash: string): Promise<Card[] | null> {
    return await this.cache.get<Card[]>(`cards:list:${filterHash}`);
  }

  async setCardList(filterHash: string, cards: Card[]): Promise<void> {
    await this.cache.set(`cards:list:${filterHash}`, cards, TTL.CARD_LIST);
  }

  async invalidateCard(id: number): Promise<void> {
    await this.cache.del(`card:${id}`);
    // 一覧キャッシュも無効化
    await this.cache.invalidatePattern('cards:list:*');
  }

  async invalidateAllCards(): Promise<void> {
    await this.cache.invalidatePattern('card:*');
    await this.cache.invalidatePattern('cards:*');
  }

  async getStats<T>(): Promise<T | null> {
    return await this.cache.get<T>('cards:stats');
  }

  async setStats<T>(stats: T): Promise<void> {
    await this.cache.set('cards:stats', stats, TTL.STATS);
  }
}
