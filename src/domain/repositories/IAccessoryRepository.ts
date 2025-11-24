import type { Accessory } from '../entities/Accessory';

export interface AccessoryFilterInput {
    parentType?: string;
    nameContains?: string;
    effectContains?: string;
}

export interface IAccessoryRepository {
    findByCardId(cardId: number, filter?: AccessoryFilterInput): Promise<Accessory[]>;
    findByCardIds(cardIds: number[]): Promise<Accessory[]>;
}
