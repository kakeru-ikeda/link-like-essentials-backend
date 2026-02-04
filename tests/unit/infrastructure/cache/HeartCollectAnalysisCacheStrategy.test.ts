import type { HeartCollectAnalysis } from '@/domain/entities/TraitAnalysis';
import type { CacheService } from '@/infrastructure/cache/CacheService';
import { HeartCollectAnalysisCacheStrategy } from '@/infrastructure/cache/strategies/HeartCollectAnalysisCacheStrategy';

describe('HeartCollectAnalysisCacheStrategy', () => {
  let cacheStrategy: HeartCollectAnalysisCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockAnalysis: HeartCollectAnalysis = {
    id: 1,
    cardId: 123,
    accessoryId: null,
    section1: true,
    section2: false,
    section3: true,
    section4: false,
    section5: true,
    sectionFever: false,
    conditionDetail: { type: 'heart_collect', conditions: ['section1'] },
    analyzedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    cacheStrategy = new HeartCollectAnalysisCacheStrategy(mockCacheService);
  });

  describe('getByCardId', () => {
    it('should get analysis by card id', async () => {
      mockCacheService.get.mockResolvedValue(mockAnalysis);

      const result = await cacheStrategy.getByCardId(123);

      expect(result).toEqual(mockAnalysis);
      expect(mockCacheService.get).toHaveBeenCalledWith('heart_collect:card:123');
    });

    it('should return null when not found', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const result = await cacheStrategy.getByCardId(999);

      expect(result).toBeNull();
      expect(mockCacheService.get).toHaveBeenCalledWith('heart_collect:card:999');
    });
  });

  describe('setByCardId', () => {
    it('should set analysis by card id with TTL', async () => {
      await cacheStrategy.setByCardId(123, mockAnalysis);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'heart_collect:card:123',
        mockAnalysis,
        12 * 60 * 60 // 12 hours
      );
    });
  });

  describe('getByAccessoryId', () => {
    it('should get analysis by accessory id', async () => {
      const accessoryAnalysis: HeartCollectAnalysis = {
        ...mockAnalysis,
        cardId: null,
        accessoryId: 456,
      };
      mockCacheService.get.mockResolvedValue(accessoryAnalysis);

      const result = await cacheStrategy.getByAccessoryId(456);

      expect(result).toEqual(accessoryAnalysis);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'heart_collect:accessory:456'
      );
    });

    it('should return null when not found', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const result = await cacheStrategy.getByAccessoryId(999);

      expect(result).toBeNull();
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'heart_collect:accessory:999'
      );
    });
  });

  describe('setByAccessoryId', () => {
    it('should set analysis by accessory id with TTL', async () => {
      const accessoryAnalysis: HeartCollectAnalysis = {
        ...mockAnalysis,
        cardId: null,
        accessoryId: 456,
      };

      await cacheStrategy.setByAccessoryId(456, accessoryAnalysis);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'heart_collect:accessory:456',
        accessoryAnalysis,
        12 * 60 * 60 // 12 hours
      );
    });
  });
});
