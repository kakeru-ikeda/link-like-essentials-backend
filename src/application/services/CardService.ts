import crypto from 'crypto';

import type { Card } from '@/domain/entities/Card';
import { NotFoundError } from '@/domain/errors/AppError';
import type {
  CardIncludeOptions,
  ICardRepository,
} from '@/domain/repositories/ICardRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

import type {
  CardFilterInput,
  CardStatsResult,
  CreateCardInput,
  UpdateCardInput,
  DeleteResponse,
} from '../dto/CardDTO';
import type {
  CreateCardInput as MutationCreateCardInput,
  UpdateCardInput as MutationUpdateCardInput,
} from '../dto/MutationDTO';

export class CardService {
  constructor(
    private readonly cardRepository: ICardRepository,
    private readonly cacheStrategy: CardCacheStrategy
  ) {}

  async findById(id: number, options?: CardIncludeOptions): Promise<Card> {
    const useCache = !options?.heartCollectAnalysis && !options?.unDrawAnalysis;
    if (useCache) {
      // キャッシュチェック
      const cached = await this.cacheStrategy.getCard(id);
      if (cached) {
        return cached;
      }
    }

    // DBから取得
    const card = await this.cardRepository.findById(id, options);
    if (!card) {
      throw new NotFoundError(`Card with id ${id} not found`);
    }

    if (useCache) {
      // キャッシュに保存
      await this.cacheStrategy.setCard(card);
    }

    return card;
  }

  async findByName(
    cardName: string,
    characterName: string,
    options?: CardIncludeOptions
  ): Promise<Card | null> {
    const useCache = !options?.heartCollectAnalysis && !options?.unDrawAnalysis;
    if (useCache) {
      // キャッシュチェック
      const cached = await this.cacheStrategy.getCardByName(
        cardName,
        characterName
      );
      if (cached) {
        return cached;
      }
    }

    // DBから取得
    const card = await this.cardRepository.findByCardNameAndCharacter(
      cardName,
      characterName,
      options
    );

    // キャッシュに保存
    if (useCache && card) {
      await this.cacheStrategy.setCardByName(card);
    }

    return card;
  }

  async findAll(
    filter?: CardFilterInput,
    options?: CardIncludeOptions
  ): Promise<Card[]> {
    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter);

    const useCache = !options?.heartCollectAnalysis && !options?.unDrawAnalysis;
    if (useCache) {
      // キャッシュチェック
      const cached = await this.cacheStrategy.getCardList(filterHash);
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    }

    // DBから取得
    const cards = await this.cardRepository.findAll(filter, options);

    if (useCache) {
      // キャッシュに保存
      await this.cacheStrategy.setCardList(filterHash, cards);
    }

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

  async create(input: MutationCreateCardInput): Promise<Card> {
    const card = await this.cardRepository.create(input);

    // キャッシュをクリア
    await this.cacheStrategy.invalidateAll();

    // 新規作成されたカードをキャッシュに保存
    await this.cacheStrategy.setCard(card);
    await this.cacheStrategy.setCardByName(card);

    return card;
  }

  async update(id: number, input: MutationUpdateCardInput): Promise<Card> {
    const card = await this.cardRepository.update(id, input);

    // キャッシュをクリア
    await this.cacheStrategy.invalidateAll();

    // 更新されたカードをキャッシュに保存
    await this.cacheStrategy.setCard(card);
    await this.cacheStrategy.setCardByName(card);

    return card;
  }

  async delete(id: number): Promise<DeleteResponse> {
    await this.cardRepository.delete(id);

    // キャッシュをクリア
    await this.cacheStrategy.invalidateAll();

    return {
      success: true,
      message: `Card with id ${id} successfully deleted`,
    };
  }
}
