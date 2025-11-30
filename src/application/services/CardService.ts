import crypto from 'crypto';

import type { Card } from '@/domain/entities/Card';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ICardRepository } from '@/domain/repositories/ICardRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

import type { CardFilterInput, CardStatsResult } from '../dto/CardDTO';

export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number): Promise<Card> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getCard(id);
    if (cached) {
      return cached;
    }

    // DBから取得
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundError(`Card with id ${id} not found`);
    }

    // キャッシュに保存
    await this.cacheStrategy.setCard(card);

    return card;
  }

  async findByName(
    cardName: string,
    characterName: string
  ): Promise<Card | null> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getCardByName(
      cardName,
      characterName
    );
    if (cached) {
      return cached;
    }

    // DBから取得
    const card = await this.cardRepository.findByCardNameAndCharacter(
      cardName,
      characterName
    );

    // キャッシュに保存
    if (card) {
      await this.cacheStrategy.setCardByName(card);
    }

    return card;
  }

  async findAll(filter?: CardFilterInput): Promise<Card[]> {
    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter);

    // キャッシュチェック
    const cached = await this.cacheStrategy.getCardList(filterHash);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // DBから取得
    const cards = await this.cardRepository.findAll(filter);

    // キャッシュに保存
    await this.cacheStrategy.setCardList(filterHash, cards);

    return cards;
  }

  async getStats(): Promise<CardStatsResult> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getStats<CardStatsResult>();
    if (cached) {
      return cached;
    }

    // DBから取得
    const stats = await this.cardRepository.getStats();

    const result: CardStatsResult = {
      totalCards: stats.totalCards,
      byRarity: stats.byRarity,
      byStyleType: stats.byStyleType,
      byCharacter: stats.byCharacter,
    };

    // キャッシュに保存
    await this.cacheStrategy.setStats<CardStatsResult>(result);

    return result;
  }

  private generateFilterHash(filter?: CardFilterInput): string {
    const data = JSON.stringify({ filter });
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
