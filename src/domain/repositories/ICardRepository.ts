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
  releaseDateFrom?: Date;
  releaseDateTo?: Date;
}

export interface PaginationResult {
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

export interface CardIncludeOptions {
  heartCollectAnalysis?: boolean;
  unDrawAnalysis?: boolean;
}

export interface ICardRepository {
  findById(id: number, options?: CardIncludeOptions): Promise<Card | null>;
  findByCardNameAndCharacter(
    cardName: string,
    characterName: string,
    options?: CardIncludeOptions
  ): Promise<Card | null>;
  findAll(
    filter?: CardFilterInput,
    options?: CardIncludeOptions
  ): Promise<Card[]>;
  findAllPaginated(
    filter?: CardFilterInput,
    first?: number,
    after?: string,
    options?: CardIncludeOptions
  ): Promise<PaginationResult>;
  findByIds(ids: number[], options?: CardIncludeOptions): Promise<Card[]>;
  getStats(): Promise<CardStats>;
}
