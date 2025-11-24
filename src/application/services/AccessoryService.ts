import type { Accessory } from '@/domain/entities/Accessory';
import type { AccessoryFilterInput, IAccessoryRepository } from '@/domain/repositories/IAccessoryRepository';
import type { Trait } from '@/domain/valueObjects/Stats';

export class AccessoryService {
    constructor(private readonly accessoryRepository: IAccessoryRepository) { }

    async findByCardId(cardId: number, filter?: AccessoryFilterInput): Promise<Accessory[]> {
        return await this.accessoryRepository.findByCardId(cardId, filter);
    }

    buildTrait(accessory: Accessory): Trait | null {
        if (!accessory.traitName) return null;

        return {
            name: accessory.traitName,
            effect: accessory.traitEffect,
        };
    }
}
