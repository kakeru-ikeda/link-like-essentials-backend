import type { CardDetail } from '@/domain/entities/CardDetail';
import type { CacheService } from '@/infrastructure/cache/CacheService';
import { TTL } from '@/infrastructure/cache/strategies/CardCacheStrategy';
import { DetailCacheStrategy } from '@/infrastructure/cache/strategies/DetailCacheStrategy';

describe('DetailCacheStrategy', () => {
  let detailCacheStrategy: DetailCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockDetail: CardDetail = {
    id: 1,
    cardId: 1,
    favoriteMode: 'ハッピー',
    acquisitionMethod: 'ガチャ',
    awakeBeforeUrl: 'https://example.com/before.jpg',
    awakeAfterUrl: 'https://example.com/after.jpg',
    awakeBeforeStorageUrl: null,
    awakeAfterStorageUrl: null,
    smileMaxLevel: '60',
    pureMaxLevel: '55',
    coolMaxLevel: '50',
    mentalMaxLevel: '45',
    specialAppealName: 'Special Appeal',
    specialAppealAp: '10',
    specialAppealEffect: 'Special Effect',
    skillName: 'Skill Name',
    skillAp: '5',
    skillEffect: 'Skill Effect',
    traitName: 'Trait Name',
    traitEffect: 'Trait Effect',
    isLocked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
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

    detailCacheStrategy = new DetailCacheStrategy(mockCacheService);
  });

  describe('getDetail', () => {
    it('should get detail by cardId', async () => {
      mockCacheService.get.mockResolvedValue(mockDetail);

      const result = await detailCacheStrategy.getDetail(1);

      expect(result).toEqual(mockDetail);
      expect(mockCacheService.get).toHaveBeenCalledWith('cardDetail:1');
    });

    it('should return null when detail not found', async () => {
      mockCacheService.get.mockResolvedValue(null);

      const result = await detailCacheStrategy.getDetail(999);

      expect(result).toBeNull();
    });
  });

  describe('setDetail', () => {
    it('should set detail with TTL', async () => {
      await detailCacheStrategy.setDetail(mockDetail);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'cardDetail:1',
        mockDetail,
        TTL.CARD_DETAIL
      );
    });
  });

  describe('invalidateDetail', () => {
    it('should invalidate detail cache', async () => {
      await detailCacheStrategy.invalidateDetail(1);

      expect(mockCacheService.del).toHaveBeenCalledWith('cardDetail:1');
    });
  });

  describe('invalidateAllDetails', () => {
    it('should invalidate all detail caches', async () => {
      await detailCacheStrategy.invalidateAllDetails();

      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'cardDetail:*'
      );
    });
  });
});
