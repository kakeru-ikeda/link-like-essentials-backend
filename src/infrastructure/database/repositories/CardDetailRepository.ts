import type { CardDetail as PrismaCardDetail, PrismaClient } from '@prisma/client';

import type { CardDetail } from '@/domain/entities/CardDetail';
import type { ICardDetailRepository } from '@/domain/repositories/ICardDetailRepository';

export class CardDetailRepository implements ICardDetailRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByCardId(cardId: number): Promise<CardDetail | null> {
        const detail = await this.prisma.cardDetail.findUnique({
            where: { cardId },
            include: {
                card: true,
            },
        });

        return detail ? this.mapToEntity(detail) : null;
    }

    async findByCardIds(cardIds: number[]): Promise<CardDetail[]> {
        const details = await this.prisma.cardDetail.findMany({
            where: {
                cardId: { in: cardIds },
            },
            include: {
                card: true,
            },
        });

        return details.map((detail) => this.mapToEntity(detail));
    }

    private mapToEntity(detail: PrismaCardDetail & { card?: unknown }): CardDetail {
        return {
            id: detail.id,
            cardId: detail.cardId,
            favoriteMode: detail.favoriteMode,
            acquisitionMethod: detail.acquisitionMethod,
            awakeBeforeUrl: detail.awakeBeforeUrl,
            awakeAfterUrl: detail.awakeAfterUrl,
            awakeBeforeStorageUrl: detail.awakeBeforeStorageUrl,
            awakeAfterStorageUrl: detail.awakeAfterStorageUrl,
            smileMaxLevel: detail.smileMaxLevel,
            pureMaxLevel: detail.pureMaxLevel,
            coolMaxLevel: detail.coolMaxLevel,
            mentalMaxLevel: detail.mentalMaxLevel,
            specialAppealName: detail.specialAppealName,
            specialAppealAp: detail.specialAppealAp,
            specialAppealEffect: detail.specialAppealEffect,
            skillName: detail.skillName,
            skillAp: detail.skillAp,
            skillEffect: detail.skillEffect,
            traitName: detail.traitName,
            traitEffect: detail.traitEffect,
            isLocked: detail.isLocked,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
            card: detail.card as CardDetail['card'],
        };
    }
}
