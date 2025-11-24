import type { Card as PrismaCard, PrismaClient } from '@prisma/client';

import type { Card } from '@/domain/entities/Card';
import type {
    CardFilterInput,
    CardListResult,
    CardSortInput,
    CardStats,
    ICardRepository,
    PaginationInput,
} from '@/domain/repositories/ICardRepository';

export class CardRepository implements ICardRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findById(id: number): Promise<Card | null> {
        const card = await this.prisma.card.findUnique({
            where: { id },
            include: {
                detail: true,
            },
        });

        return card ? this.mapToEntity(card) : null;
    }

    async findByCardNameAndCharacter(
        cardName: string,
        characterName: string
    ): Promise<Card | null> {
        const card = await this.prisma.card.findUnique({
            where: {
                cardName_characterName: {
                    cardName,
                    characterName,
                },
            },
            include: {
                detail: true,
            },
        });

        return card ? this.mapToEntity(card) : null;
    }

    async findAll(
        filter?: CardFilterInput,
        sort?: CardSortInput,
        pagination?: PaginationInput
    ): Promise<CardListResult> {
        const where = this.buildWhereClause(filter);
        const orderBy = this.buildOrderByClause(sort);
        const take = pagination?.first || 20;
        const cursor = pagination?.after
            ? { id: parseInt(pagination.after, 10) }
            : undefined;

        const [cards, totalCount] = await Promise.all([
            this.prisma.card.findMany({
                where,
                orderBy,
                take: take + 1, // +1 for hasNextPage check
                skip: cursor ? 1 : 0,
                cursor,
                include: {
                    detail: true,
                },
            }),
            this.prisma.card.count({ where }),
        ]);

        const hasNextPage = cards.length > take;
        const resultCards = hasNextPage ? cards.slice(0, take) : cards;

        return {
            cards: resultCards.map((card) => this.mapToEntity(card)),
            totalCount,
            hasNextPage,
        };
    }

    async findByIds(ids: number[]): Promise<Card[]> {
        const cards = await this.prisma.card.findMany({
            where: {
                id: { in: ids },
            },
            include: {
                detail: true,
            },
        });

        return cards.map((card) => this.mapToEntity(card));
    }

    async getStats(): Promise<CardStats> {
        const [totalCards, byRarity, byStyleType, byCharacter] = await Promise.all([
            this.prisma.card.count(),
            this.prisma.card.groupBy({
                by: ['rarity'],
                _count: true,
                where: {
                    rarity: { not: null },
                },
            }),
            this.prisma.card.groupBy({
                by: ['styleType'],
                _count: true,
                where: {
                    styleType: { not: null },
                },
            }),
            this.prisma.card.groupBy({
                by: ['characterName'],
                _count: true,
                orderBy: {
                    _count: {
                        characterName: 'desc',
                    },
                },
                take: 20,
            }),
        ]);

        return {
            totalCards,
            byRarity: byRarity.map((r) => ({
                rarity: r.rarity || '',
                count: r._count,
            })),
            byStyleType: byStyleType.map((s) => ({
                styleType: s.styleType || '',
                count: s._count,
            })),
            byCharacter: byCharacter.map((c) => ({
                characterName: c.characterName,
                count: c._count,
            })),
        };
    }

    private buildWhereClause(filter?: CardFilterInput): Record<string, unknown> {
        if (!filter) return {};

        type WhereCondition = {
            rarity?: string;
            limited?: string;
            styleType?: string;
            characterName?: { contains: string; mode: string };
            cardName?: { contains: string; mode: string };
            detail?: {
                skillEffect?: { contains: string; mode: string };
                traitEffect?: { contains: string; mode: string };
                specialAppealEffect?: { contains: string; mode: string };
            };
            accessories?: {
                some: {
                    OR: Array<{
                        effect?: { contains: string; mode: string };
                        traitEffect?: { contains: string; mode: string };
                    }>;
                };
            };
        };

        const conditions: WhereCondition = {
            ...(filter.rarity && { rarity: filter.rarity }),
            ...(filter.limited && { limited: filter.limited }),
            ...(filter.styleType && { styleType: filter.styleType }),
            ...(filter.characterName && {
                characterName: { contains: filter.characterName, mode: 'insensitive' },
            }),
            ...(filter.cardName && {
                cardName: { contains: filter.cardName, mode: 'insensitive' },
            }),
        };

        // カード詳細の効果検索
        if (
            filter.skillEffectContains ||
            filter.traitEffectContains ||
            filter.specialAppealEffectContains
        ) {
            conditions.detail = {
                ...(filter.skillEffectContains && {
                    skillEffect: {
                        contains: filter.skillEffectContains,
                        mode: 'insensitive',
                    },
                }),
                ...(filter.traitEffectContains && {
                    traitEffect: {
                        contains: filter.traitEffectContains,
                        mode: 'insensitive',
                    },
                }),
                ...(filter.specialAppealEffectContains && {
                    specialAppealEffect: {
                        contains: filter.specialAppealEffectContains,
                        mode: 'insensitive',
                    },
                }),
            };
        }

        // アクセサリー効果検索（Cardから直接アクセス）
        // effectとtraitEffectの両方を検索
        if (filter.accessoryEffectContains) {
            conditions.accessories = {
                some: {
                    OR: [
                        {
                            effect: {
                                contains: filter.accessoryEffectContains,
                                mode: 'insensitive',
                            },
                        },
                        {
                            traitEffect: {
                                contains: filter.accessoryEffectContains,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            };
        }

        return conditions;
    }

    private buildOrderByClause(
        sort?: CardSortInput
    ): Record<string, 'asc' | 'desc'> {
        if (!sort) return { id: 'desc' };

        const fieldMap: Record<string, string> = {
            ID: 'id',
            CARD_NAME: 'cardName',
            CHARACTER_NAME: 'characterName',
            CREATED_AT: 'createdAt',
            UPDATED_AT: 'updatedAt',
        };

        const field = fieldMap[sort.field] || 'id';
        const direction = sort.direction.toLowerCase() as 'asc' | 'desc';

        return { [field]: direction };
    }

    private mapToEntity(card: PrismaCard & { detail?: unknown }): Card {
        return {
            id: card.id,
            rarity: card.rarity,
            limited: card.limited,
            cardName: card.cardName,
            cardUrl: card.cardUrl,
            characterName: card.characterName,
            styleType: card.styleType,
            isLocked: card.isLocked,
            createdAt: card.createdAt,
            updatedAt: card.updatedAt,
            detail: card.detail as Card['detail'],
        };
    }
}
