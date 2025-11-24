import type { Card } from '@/domain/entities/Card';

export interface CardFilterInput {
    rarity?: string;
    limited?: string;
    characterName?: string;
    styleType?: string;
    cardName?: string;
}

export interface CardSortInput {
    field: 'ID' | 'CARD_NAME' | 'CHARACTER_NAME' | 'CREATED_AT' | 'UPDATED_AT';
    direction: 'ASC' | 'DESC';
}

export interface PaginationInput {
    first?: number;
    after?: string;
}

export interface CardConnectionResult {
    edges: CardEdge[];
    pageInfo: PageInfo;
    totalCount: number;
}

export interface CardEdge {
    node: Card;
    cursor: string;
}

export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
}

export interface CardStatsResult {
    totalCards: number;
    byRarity: RarityCount[];
    byStyleType: StyleTypeCount[];
    byCharacter: CharacterCount[];
}

export interface RarityCount {
    rarity: string;
    count: number;
}

export interface StyleTypeCount {
    styleType: string;
    count: number;
}

export interface CharacterCount {
    characterName: string;
    count: number;
}
