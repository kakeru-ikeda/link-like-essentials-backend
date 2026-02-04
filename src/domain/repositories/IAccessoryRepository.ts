import type { Accessory } from '../entities/Accessory';

export interface AccessoryFilterInput {
  parentType?: string;
  nameContains?: string;
  effectContains?: string;
}

export interface CreateAccessoryData {
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

export interface UpdateAccessoryData {
  parentType?: string;
  name?: string;
  ap?: string;
  effect?: string;
  traitName?: string;
  traitEffect?: string;
  displayOrder?: number;
  isLocked?: boolean;
}

export interface IAccessoryRepository {
  findByCardId(
    cardId: number,
    filter?: AccessoryFilterInput
  ): Promise<Accessory[]>;
  findByCardIds(cardIds: number[]): Promise<Accessory[]>;
  findById(id: number): Promise<Accessory | null>;
  create(data: CreateAccessoryData): Promise<Accessory>;
  update(id: number, data: UpdateAccessoryData): Promise<Accessory>;
  delete(id: number): Promise<void>;
}
