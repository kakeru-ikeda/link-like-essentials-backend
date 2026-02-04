import type { Accessory } from '@/domain/entities/Accessory';
import type {
  AccessoryFilterInput,
  IAccessoryRepository,
} from '@/domain/repositories/IAccessoryRepository';
import type { Trait } from '@/domain/valueObjects/Stats';

import type {
  CreateAccessoryInput,
  UpdateAccessoryInput,
  DeleteResponse,
} from '../dto/MutationDTO';

export class AccessoryService {
  constructor(private readonly accessoryRepository: IAccessoryRepository) {}

  async findByCardId(
    cardId: number,
    filter?: AccessoryFilterInput
  ): Promise<Accessory[]> {
    return await this.accessoryRepository.findByCardId(cardId, filter);
  }

  buildTrait(accessory: Accessory): Trait | null {
    if (!accessory.traitName) return null;

    return {
      name: accessory.traitName,
      effect: accessory.traitEffect,
    };
  }

  async create(input: CreateAccessoryInput): Promise<Accessory> {
    return await this.accessoryRepository.create(input);
  }

  async update(id: number, input: UpdateAccessoryInput): Promise<Accessory> {
    return await this.accessoryRepository.update(id, input);
  }

  async delete(id: number): Promise<DeleteResponse> {
    await this.accessoryRepository.delete(id);

    return {
      success: true,
      message: `Accessory with id ${id} successfully deleted`,
    };
  }
}
