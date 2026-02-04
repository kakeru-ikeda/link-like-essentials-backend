import type { CardDetail } from '../entities/CardDetail';

export interface UpsertCardDetailData {
  cardId: number;
  favoriteMode?: string;
  acquisitionMethod?: string;
  awakeBeforeUrl?: string;
  awakeAfterUrl?: string;
  awakeBeforeStorageUrl?: string;
  awakeAfterStorageUrl?: string;
  smileMaxLevel?: string;
  pureMaxLevel?: string;
  coolMaxLevel?: string;
  mentalMaxLevel?: string;
  specialAppealName?: string;
  specialAppealAp?: string;
  specialAppealEffect?: string;
  skillName?: string;
  skillAp?: string;
  skillEffect?: string;
  traitName?: string;
  traitEffect?: string;
  isLocked?: boolean;
}

export interface ICardDetailRepository {
  findByCardId(cardId: number): Promise<CardDetail | null>;
  findByCardIds(cardIds: number[]): Promise<CardDetail[]>;
  upsert(data: UpsertCardDetailData): Promise<CardDetail>;
}
