import { AccessoryService } from '@/application/services/AccessoryService';
import type { Accessory } from '@/domain/entities/Accessory';
import type {
  AccessoryFilterInput,
  IAccessoryRepository,
} from '@/domain/repositories/IAccessoryRepository';

describe('AccessoryService', () => {
  let accessoryService: AccessoryService;
  let mockRepository: jest.Mocked<IAccessoryRepository>;

  const mockAccessory: Accessory = {
    id: 1,
    cardId: 1,
    parentType: 'special_appeal',
    name: 'Test Accessory',
    ap: '10',
    effect: 'Test Effect',
    traitName: 'Test Trait',
    traitEffect: 'Trait Effect',
    displayOrder: 1,
    isLocked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findByCardId: jest.fn(),
      findByCardIds: jest.fn(),
    } as unknown as jest.Mocked<IAccessoryRepository>;

    accessoryService = new AccessoryService(mockRepository);
  });

  describe('findByCardId', () => {
    it('should return accessories for a card', async () => {
      const accessories = [mockAccessory];
      mockRepository.findByCardId.mockResolvedValue(accessories);

      const result = await accessoryService.findByCardId(1);

      expect(result).toEqual(accessories);
      expect(mockRepository.findByCardId).toHaveBeenCalledWith(1, undefined);
    });

    it('should return empty array if no accessories found', async () => {
      mockRepository.findByCardId.mockResolvedValue([]);

      const result = await accessoryService.findByCardId(999);

      expect(result).toEqual([]);
      expect(mockRepository.findByCardId).toHaveBeenCalledWith(999, undefined);
    });

    it('should pass filter to repository', async () => {
      const filter: AccessoryFilterInput = {
        parentType: 'skill',
        effectContains: 'damage',
      };
      mockRepository.findByCardId.mockResolvedValue([]);

      await accessoryService.findByCardId(1, filter);

      expect(mockRepository.findByCardId).toHaveBeenCalledWith(1, filter);
    });
  });

  describe('buildTrait', () => {
    it('should build trait from accessory with traitName', () => {
      const result = accessoryService.buildTrait(mockAccessory);

      expect(result).toEqual({
        name: 'Test Trait',
        effect: 'Trait Effect',
      });
    });

    it('should return null if traitName is null', () => {
      const accessoryWithoutTrait: Accessory = {
        ...mockAccessory,
        traitName: null,
        traitEffect: null,
      };

      const result = accessoryService.buildTrait(accessoryWithoutTrait);

      expect(result).toBeNull();
    });

    it('should return trait with null effect if traitEffect is null', () => {
      const accessoryWithPartialTrait: Accessory = {
        ...mockAccessory,
        traitName: 'Partial Trait',
        traitEffect: null,
      };

      const result = accessoryService.buildTrait(accessoryWithPartialTrait);

      expect(result).toEqual({
        name: 'Partial Trait',
        effect: null,
      });
    });
  });
});
