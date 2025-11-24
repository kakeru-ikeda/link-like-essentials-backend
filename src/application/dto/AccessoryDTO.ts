import type { Accessory } from '@/domain/entities/Accessory';

export type AccessoryResult = Accessory;

export interface AccessoryFilterInput {
  parentType?: string;
}
