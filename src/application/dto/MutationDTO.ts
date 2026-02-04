// Card Mutation DTOs
export interface CreateCardInput {
  cardName: string;
  characterName: string;
  rarity?: string;
  limited?: string;
  styleType?: string;
  cardUrl?: string;
  releaseDate?: Date;
  isLocked?: boolean;
}

export interface UpdateCardInput {
  cardName?: string;
  characterName?: string;
  rarity?: string;
  limited?: string;
  styleType?: string;
  cardUrl?: string;
  releaseDate?: Date;
  isLocked?: boolean;
}

// CardDetail Mutation DTOs
export interface UpsertCardDetailInput {
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

// Accessory Mutation DTOs
export interface CreateAccessoryInput {
  cardId: number;
  parentType: string;
  name: string;
  ap?: string;
  effect?: string;
  traitName?: string;
  traitEffect?: string;
  displayOrder?: number;
  isLocked?: boolean;
}

export interface UpdateAccessoryInput {
  parentType?: string;
  name?: string;
  ap?: string;
  effect?: string;
  traitName?: string;
  traitEffect?: string;
  displayOrder?: number;
  isLocked?: boolean;
}

// Response DTOs
export interface DeleteResponse {
  success: boolean;
  message: string;
}
