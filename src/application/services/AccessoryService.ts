import type { Accessory } from '@/domain/entities/Accessory';
import type {
  AccessoryFilterInput,
  IAccessoryRepository,
} from '@/domain/repositories/IAccessoryRepository';
import type { Trait } from '@/domain/valueObjects/Stats';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

import type {
  CreateAccessoryInput,
  UpdateAccessoryInput,
} from '../dto/MutationDTO';

export class AccessoryService {
  constructor(
    private readonly accessoryRepository: IAccessoryRepository,
    private readonly cardCacheStrategy: CardCacheStrategy
  ) {}

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
    const accessory = await this.accessoryRepository.create(input);

    // 親カードのキャッシュを無効化（アクセサリーはCardエンティティの一部）
    await this.cardCacheStrategy.invalidateCard(input.cardId);

    return accessory;
  }

  async update(id: number, input: UpdateAccessoryInput): Promise<Accessory> {
    const accessory = await this.accessoryRepository.update(id, input);

    // 親カードのキャッシュを無効化（アクセサリーはCardエンティティの一部）
    await this.cardCacheStrategy.invalidateCard(accessory.cardId);

    return accessory;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    // 削除前にアクセサリーを取得してcardIdを保持
    const accessory = await this.accessoryRepository.findById(id);
    if (accessory) {
      await this.accessoryRepository.delete(id);

      // 親カードのキャッシュを無効化（アクセサリーはCardエンティティの一部）
      await this.cardCacheStrategy.invalidateCard(accessory.cardId);
    } else {
      // findByIdがnullを返す場合、deleteでNotFoundErrorがスローされる
      await this.accessoryRepository.delete(id);
    }

    return {
      success: true,
      message: `Accessory with id ${id} successfully deleted`,
    };
  }
}
