import type { CardAccessory as PrismaAccessory, PrismaClient } from '@prisma/client';

import type { Accessory } from '@/domain/entities/Accessory';
import type { AccessoryFilterInput, IAccessoryRepository } from '@/domain/repositories/IAccessoryRepository';

export class AccessoryRepository implements IAccessoryRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async findByCardId(cardId: number, filter?: AccessoryFilterInput): Promise<Accessory[]> {
        const where = this.buildWhereClause(cardId, filter);

        const accessories = await this.prisma.cardAccessory.findMany({
            where,
            orderBy: {
                displayOrder: 'asc',
            },
            include: {
                card: true,
            },
        });

        return accessories.map((accessory) => this.mapToEntity(accessory));
    }

    async findByCardIds(cardIds: number[]): Promise<Accessory[]> {
        const accessories = await this.prisma.cardAccessory.findMany({
            where: {
                cardId: { in: cardIds },
            },
            orderBy: {
                displayOrder: 'asc',
            },
            include: {
                card: true,
            },
        });

        return accessories.map((accessory) => this.mapToEntity(accessory));
    }

    private buildWhereClause(cardId: number, filter?: AccessoryFilterInput): object {
        const conditions: any = {
            cardId,
            ...(filter?.parentType && { parentType: filter.parentType }),
            ...(filter?.nameContains && {
                name: { contains: filter.nameContains, mode: 'insensitive' },
            }),
        };

        // effectContainsが指定されている場合、effectまたはtraitEffectを検索
        if (filter?.effectContains) {
            conditions.OR = [
                {
                    effect: {
                        contains: filter.effectContains,
                        mode: 'insensitive',
                    },
                },
                {
                    traitEffect: {
                        contains: filter.effectContains,
                        mode: 'insensitive',
                    },
                },
            ];
        }

        return conditions;
    }

    private mapToEntity(accessory: PrismaAccessory & { card?: unknown }): Accessory {
        return {
            id: accessory.id,
            cardId: accessory.cardId,
            parentType: accessory.parentType,
            name: accessory.name,
            ap: accessory.ap,
            effect: accessory.effect,
            traitName: accessory.traitName,
            traitEffect: accessory.traitEffect,
            displayOrder: accessory.displayOrder,
            isLocked: accessory.isLocked,
            createdAt: accessory.createdAt,
            updatedAt: accessory.updatedAt,
            card: accessory.card as Accessory['card'],
        };
    }
}
