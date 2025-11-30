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
