import type {
  CardAccessory as PrismaAccessory,
  PrismaClient,
} from '@prisma/client';

import type { Accessory } from '@/domain/entities/Accessory';
import { NotFoundError } from '@/domain/errors/AppError';
import type {
  AccessoryFilterInput,
  CreateAccessoryData,
  UpdateAccessoryData,
  IAccessoryRepository,
} from '@/domain/repositories/IAccessoryRepository';

export class AccessoryRepository implements IAccessoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCardId(
    cardId: number,
    filter?: AccessoryFilterInput
  ): Promise<Accessory[]> {
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

  private buildWhereClause(
    cardId: number,
    filter?: AccessoryFilterInput
  ): Record<string, unknown> {
    type WhereCondition = {
      cardId: number;
      parentType?: string;
      name?: { contains: string; mode: string };
      OR?: Array<{
        effect?: { contains: string; mode: string };
        traitEffect?: { contains: string; mode: string };
      }>;
    };

    const conditions: WhereCondition = {
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

  private mapToEntity(
    accessory: PrismaAccessory & {
      card?: unknown;
      heartCollectAnalysis?: unknown;
      unDrawAnalysis?: unknown;
    }
  ): Accessory {
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
      heartCollectAnalysis:
        accessory.heartCollectAnalysis as Accessory['heartCollectAnalysis'],
      unDrawAnalysis: accessory.unDrawAnalysis as Accessory['unDrawAnalysis'],
    };
  }

  async findById(id: number): Promise<Accessory | null> {
    const accessory = await this.prisma.cardAccessory.findUnique({
      where: { id },
      include: {
        card: true,
      },
    });

    return accessory ? this.mapToEntity(accessory) : null;
  }

  async create(data: CreateAccessoryData): Promise<Accessory> {
    const accessory = await this.prisma.cardAccessory.create({
      data: {
        cardId: data.cardId,
        parentType: data.parentType,
        name: data.name,
        ap: data.ap,
        effect: data.effect,
        traitName: data.traitName,
        traitEffect: data.traitEffect,
        displayOrder: data.displayOrder ?? 0,
        isLocked: data.isLocked ?? false,
      },
      include: {
        card: true,
      },
    });

    return this.mapToEntity(accessory);
  }

  async update(id: number, data: UpdateAccessoryData): Promise<Accessory> {
    const accessory = await this.prisma.cardAccessory.update({
      where: { id },
      data: {
        ...(data.parentType !== undefined && { parentType: data.parentType }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.ap !== undefined && { ap: data.ap }),
        ...(data.effect !== undefined && { effect: data.effect }),
        ...(data.traitName !== undefined && { traitName: data.traitName }),
        ...(data.traitEffect !== undefined && { traitEffect: data.traitEffect }),
        ...(data.displayOrder !== undefined && {
          displayOrder: data.displayOrder,
        }),
        ...(data.isLocked !== undefined && { isLocked: data.isLocked }),
      },
      include: {
        card: true,
      },
    });

    return this.mapToEntity(accessory);
  }

  async delete(id: number): Promise<void> {
    const accessory = await this.prisma.cardAccessory.findUnique({
      where: { id },
    });
    if (!accessory) {
      throw new NotFoundError(`Accessory with id ${id} not found`);
    }

    await this.prisma.cardAccessory.delete({
      where: { id },
    });
  }
}
