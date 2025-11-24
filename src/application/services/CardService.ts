import { createHash } from 'crypto';
import { performance } from 'perf_hooks';

import type { Card } from '@/domain/entities/Card';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ICardRepository } from '@/domain/repositories/ICardRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';
import { performanceMetrics } from '@/infrastructure/metrics/PerformanceMetrics';

import type {
  CardFilterInput,
  CardSortInput,
  PaginationInput,
  CardConnectionResult,
  CardStatsResult,
} from '../dto/CardDTO';

export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number): Promise<Card> {
    const startTime = performance.now();
    let isCacheHit = false;

    // キャッシュチェック
    const cached = await this.cacheStrategy.getCard(id);
    if (cached) {
      isCacheHit = true;
      performanceMetrics.recordCacheHit();
      const duration = performance.now() - startTime;
      performanceMetrics.recordQuery('findById', duration, true);
      return cached;
    }

    performanceMetrics.recordCacheMiss();

    // DBから取得
    const card = await this.cardRepository.findById(id);
    if (!card) {
      throw new NotFoundError(`Card with id ${id} not found`);
    }

    // キャッシュに保存
    await this.cacheStrategy.setCard(card);

    const duration = performance.now() - startTime;
    performanceMetrics.recordQuery('findById', duration, isCacheHit);

    return card;
  }

  async findByName(
    cardName: string,
    characterName: string
  ): Promise<Card | null> {
    const startTime = performance.now();
    let isCacheHit = false;

    // キャッシュチェック
    const cached = await this.cacheStrategy.getCardByName(
      cardName,
      characterName
    );
    if (cached) {
      isCacheHit = true;
      performanceMetrics.recordCacheHit();
      const duration = performance.now() - startTime;
      performanceMetrics.recordQuery('findByName', duration, true);
      return cached;
    }

    performanceMetrics.recordCacheMiss();

    // DBから取得
    const card = await this.cardRepository.findByCardNameAndCharacter(
      cardName,
      characterName
    );

    // キャッシュに保存
    if (card) {
      await this.cacheStrategy.setCardByName(card);
    }

    const duration = performance.now() - startTime;
    performanceMetrics.recordQuery('findByName', duration, isCacheHit);

    return card;
  }

  async findAll(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: PaginationInput
  ): Promise<CardConnectionResult> {
    const startTime = performance.now();
    let isCacheHit = false;

    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter, sort, pagination);

    // キャッシュチェック
    const cached = await this.cacheStrategy.getCardList(filterHash);
    if (cached) {
      isCacheHit = true;
      performanceMetrics.recordCacheHit();
      const duration = performance.now() - startTime;
      performanceMetrics.recordQuery('findAll', duration, true);
      return this.buildConnectionResult(cached, pagination);
    }

    performanceMetrics.recordCacheMiss();

    // DBから取得
    const result = await this.cardRepository.findAll(filter, sort, pagination);

    // キャッシュに保存
    await this.cacheStrategy.setCardList(filterHash, result.cards);

    const duration = performance.now() - startTime;
    performanceMetrics.recordQuery('findAll', duration, isCacheHit);

    return this.buildConnectionResult(result.cards, pagination, result);
  }

  async getStats(): Promise<CardStatsResult> {
    const stats = await this.cardRepository.getStats();

    return {
      totalCards: stats.totalCards,
      byRarity: stats.byRarity,
      byStyleType: stats.byStyleType,
      byCharacter: stats.byCharacter,
    };
  }

  private generateFilterHash(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: PaginationInput
  ): string {
    const data = JSON.stringify({ filter, sort, pagination });
    return createHash('md5').update(data).digest('hex');
  }

  private buildConnectionResult(
    cards: Card[],
    _pagination?: PaginationInput,
    result?: { totalCount: number; hasNextPage: boolean }
  ): CardConnectionResult {
    const edges = cards.map((card) => ({
      node: card,
      cursor: Buffer.from(`${card.id}`).toString('base64'),
    }));

    const hasNextPage = result?.hasNextPage ?? false;
    const totalCount = result?.totalCount ?? cards.length;

    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: edges.length > 0 ? (edges[0]?.cursor ?? null) : null,
        endCursor:
          edges.length > 0 ? (edges[edges.length - 1]?.cursor ?? null) : null,
      },
      totalCount,
    };
  }
}
