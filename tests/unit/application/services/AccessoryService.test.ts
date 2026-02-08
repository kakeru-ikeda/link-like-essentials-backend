import { AccessoryService } from '@/application/services/AccessoryService';
import type { Accessory } from '@/domain/entities/Accessory';
import type {
  AccessoryFilterInput,
  IAccessoryRepository,
} from '@/domain/repositories/IAccessoryRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

describe('AccessoryService', () => {
  let accessoryService: AccessoryService;
  let mockRepository: jest.Mocked<IAccessoryRepository>;
  let mockCardCacheStrategy: jest.Mocked<CardCacheStrategy>;

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
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IAccessoryRepository>;

    mockCardCacheStrategy = {
      invalidateCard: jest.fn(),
    } as unknown as jest.Mocked<CardCacheStrategy>;

    accessoryService = new AccessoryService(
      mockRepository,
      mockCardCacheStrategy
    );
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

  describe('create', () => {
    it('should create a new accessory and invalidate parent card cache', async () => {
      const createInput = {
        cardId: 1,
        parentType: 'skill',
        name: 'New Accessory',
        ap: '5',
        effect: 'New Effect',
      };

      const createdAccessory = {
        ...mockAccessory,
        id: 2,
        parentType: 'skill',
        name: 'New Accessory',
        ap: '5',
        effect: 'New Effect',
      };

      mockRepository.create.mockResolvedValue(createdAccessory);

      const result = await accessoryService.create(createInput);

      expect(result).toEqual(createdAccessory);
      expect(mockRepository.create).toHaveBeenCalledWith(createInput);
      expect(mockCardCacheStrategy.invalidateCard).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an accessory and invalidate parent card cache', async () => {
      const updateInput = {
        name: 'Updated Accessory',
        effect: 'Updated Effect',
      };

      const updatedAccessory = {
        ...mockAccessory,
        name: 'Updated Accessory',
        effect: 'Updated Effect',
      };

      mockRepository.update.mockResolvedValue(updatedAccessory);

      const result = await accessoryService.update(1, updateInput);

      expect(result).toEqual(updatedAccessory);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateInput);
      expect(mockCardCacheStrategy.invalidateCard).toHaveBeenCalledWith(1);
    });
  });

  describe('delete', () => {
    it('should delete an accessory and invalidate parent card cache', async () => {
      mockRepository.findById.mockResolvedValue(mockAccessory);
      mockRepository.delete.mockResolvedValue();

      const result = await accessoryService.delete(1);

      expect(result).toEqual({
        success: true,
        message: 'Accessory with id 1 successfully deleted',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(mockCardCacheStrategy.invalidateCard).toHaveBeenCalledWith(1);
    });

    it('should call delete even when findById returns null', async () => {
      mockRepository.findById.mockResolvedValue(null);
      mockRepository.delete.mockResolvedValue();

      const result = await accessoryService.delete(999);

      expect(result).toEqual({
        success: true,
        message: 'Accessory with id 999 successfully deleted',
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(999);
      expect(mockRepository.delete).toHaveBeenCalledWith(999);
      expect(mockCardCacheStrategy.invalidateCard).not.toHaveBeenCalled();
    });
  });
});
