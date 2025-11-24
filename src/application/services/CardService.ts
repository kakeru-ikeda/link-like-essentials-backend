import crypto from 'crypto';

import type { Card } from '@/domain/entities/Card';
import type { ICardRepository } from '@/domain/repositories/ICardRepository';
import { NotFoundError } from '@/domain/errors/AppError';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

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
    ) { }

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

    async findAll(
        filter?: CardFilterInput,
        sort?: CardSortInput,
        pagination?: PaginationInput
    ): Promise<CardConnectionResult> {
        // フィルター条件からハッシュを生成
        const filterHash = this.generateFilterHash(filter, sort, pagination);

        // キャッシュチェック
        const cached = await this.cacheStrategy.getCardList(filterHash);
        if (cached) {
            return this.buildConnectionResult(cached, pagination);
        }

        // DBから取得
        const result = await this.cardRepository.findAll(
            filter,
            sort,
            pagination
        );

        // キャッシュに保存
        await this.cacheStrategy.setCardList(filterHash, result.cards);

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
        return crypto.createHash('md5').update(data).digest('hex');
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
                startCursor: edges.length > 0 ? edges[0]?.cursor ?? null : null,
                endCursor:
                    edges.length > 0 ? edges[edges.length - 1]?.cursor ?? null : null,
            },
            totalCount,
        };
    }
}
