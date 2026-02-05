import type {
  CardDetail as PrismaCardDetail,
  PrismaClient,
} from '@prisma/client';

import type { CardDetail } from '@/domain/entities/CardDetail';
import type {
  ICardDetailRepository,
  UpsertCardDetailData,
} from '@/domain/repositories/ICardDetailRepository';

export class CardDetailRepository implements ICardDetailRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCardId(cardId: number): Promise<CardDetail | null> {
    const detail = await this.prisma.cardDetail.findUnique({
      where: { cardId },
      include: {
        card: {
          include: {
            accessories: true,
          },
        },
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
        card: {
          include: {
            accessories: true,
          },
        },
      },
    });

    return details.map((detail) => this.mapToEntity(detail));
  }

  private mapToEntity(
    detail: PrismaCardDetail & { card?: { accessories?: unknown[] } }
  ): CardDetail {
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
      accessories: detail.card?.accessories as CardDetail['accessories'],
    };
  }

  async upsert(data: UpsertCardDetailData): Promise<CardDetail> {
    const detail = await this.prisma.cardDetail.upsert({
      where: { cardId: data.cardId },
      create: {
        cardId: data.cardId,
        favoriteMode: data.favoriteMode,
        acquisitionMethod: data.acquisitionMethod,
        awakeBeforeUrl: data.awakeBeforeUrl,
        awakeAfterUrl: data.awakeAfterUrl,
        awakeBeforeStorageUrl: data.awakeBeforeStorageUrl,
        awakeAfterStorageUrl: data.awakeAfterStorageUrl,
        smileMaxLevel: data.smileMaxLevel,
        pureMaxLevel: data.pureMaxLevel,
        coolMaxLevel: data.coolMaxLevel,
        mentalMaxLevel: data.mentalMaxLevel,
        specialAppealName: data.specialAppealName,
        specialAppealAp: data.specialAppealAp,
        specialAppealEffect: data.specialAppealEffect,
        skillName: data.skillName,
        skillAp: data.skillAp,
        skillEffect: data.skillEffect,
        traitName: data.traitName,
        traitEffect: data.traitEffect,
        isLocked: data.isLocked ?? false,
      },
      update: {
        ...(data.favoriteMode !== undefined && {
          favoriteMode: data.favoriteMode,
        }),
        ...(data.acquisitionMethod !== undefined && {
          acquisitionMethod: data.acquisitionMethod,
        }),
        ...(data.awakeBeforeUrl !== undefined && {
          awakeBeforeUrl: data.awakeBeforeUrl,
        }),
        ...(data.awakeAfterUrl !== undefined && {
          awakeAfterUrl: data.awakeAfterUrl,
        }),
        ...(data.awakeBeforeStorageUrl !== undefined && {
          awakeBeforeStorageUrl: data.awakeBeforeStorageUrl,
        }),
        ...(data.awakeAfterStorageUrl !== undefined && {
          awakeAfterStorageUrl: data.awakeAfterStorageUrl,
        }),
        ...(data.smileMaxLevel !== undefined && {
          smileMaxLevel: data.smileMaxLevel,
        }),
        ...(data.pureMaxLevel !== undefined && {
          pureMaxLevel: data.pureMaxLevel,
        }),
        ...(data.coolMaxLevel !== undefined && {
          coolMaxLevel: data.coolMaxLevel,
        }),
        ...(data.mentalMaxLevel !== undefined && {
          mentalMaxLevel: data.mentalMaxLevel,
        }),
        ...(data.specialAppealName !== undefined && {
          specialAppealName: data.specialAppealName,
        }),
        ...(data.specialAppealAp !== undefined && {
          specialAppealAp: data.specialAppealAp,
        }),
        ...(data.specialAppealEffect !== undefined && {
          specialAppealEffect: data.specialAppealEffect,
        }),
        ...(data.skillName !== undefined && { skillName: data.skillName }),
        ...(data.skillAp !== undefined && { skillAp: data.skillAp }),
        ...(data.skillEffect !== undefined && {
          skillEffect: data.skillEffect,
        }),
        ...(data.traitName !== undefined && { traitName: data.traitName }),
        ...(data.traitEffect !== undefined && {
          traitEffect: data.traitEffect,
        }),
        ...(data.isLocked !== undefined && { isLocked: data.isLocked }),
      },
      include: {
        card: {
          include: {
            accessories: true,
          },
        },
      },
    });

    return this.mapToEntity(detail);
  }
}
