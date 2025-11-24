import type { Card } from '../entities/Card';

export interface CardFilterInput {
  rarity?: string;
  limited?: string;
  characterName?: string;
  styleType?: string;
  cardName?: string;
  skillEffectContains?: string;
  traitEffectContains?: string;
  specialAppealEffectContains?: string;
  accessoryEffectContains?: string;
}

export interface CardSortInput {
  field: 'ID' | 'CARD_NAME' | 'CHARACTER_NAME' | 'CREATED_AT' | 'UPDATED_AT';
  direction: 'ASC' | 'DESC';
}

export interface PaginationInput {
  first?: number;
  after?: string;
}

export interface CardListResult {
  cards: Card[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface CardStats {
  totalCards: number;
  byRarity: Array<{ rarity: string; count: number }>;
  byStyleType: Array<{ styleType: string; count: number }>;
  byCharacter: Array<{ characterName: string; count: number }>;
}

export interface ICardRepository {
  findById(id: number): Promise<Card | null>;
  findByCardNameAndCharacter(
    cardName: string,
    characterName: string
  ): Promise<Card | null>;
  findAll(
    filter?: CardFilterInput,
    sort?: CardSortInput,
    pagination?: PaginationInput
  ): Promise<CardListResult>;
  findByIds(ids: number[]): Promise<Card[]>;
  getStats(): Promise<CardStats>;
}
