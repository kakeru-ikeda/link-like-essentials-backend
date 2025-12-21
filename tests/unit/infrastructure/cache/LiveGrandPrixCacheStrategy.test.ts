import type { LiveGrandPrix } from '@/domain/entities/LiveGrandPrix';
import type { CacheService } from '@/infrastructure/cache/CacheService';
import {
  LiveGrandPrixCacheStrategy,
  LIVE_GRAND_PRIX_TTL,
} from '@/infrastructure/cache/strategies/LiveGrandPrixCacheStrategy';

describe('LiveGrandPrixCacheStrategy', () => {
  let liveGrandPrixCacheStrategy: LiveGrandPrixCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockLiveGrandPrix: LiveGrandPrix = {
    id: 1,
    startDate: new Date('2024-06-11T12:00:00.000Z'),
    endDate: new Date('2024-06-17T03:59:00.000Z'),
    eventName: '104期 1stTerm 第3回個人戦',
    eventUrl: 'https://example.com/event',
    yearTerm: '104期',
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

    liveGrandPrixCacheStrategy = new LiveGrandPrixCacheStrategy(
      mockCacheService
    );
  });

  describe('getLiveGrandPrix', () => {
    it('should get liveGrandPrix by id', async () => {
      mockCacheService.get.mockResolvedValue(mockLiveGrandPrix);

      const result = await liveGrandPrixCacheStrategy.getLiveGrandPrix(1);

      expect(result).toEqual(mockLiveGrandPrix);
      expect(mockCacheService.get).toHaveBeenCalledWith('liveGrandPrix:1');
    });
  });

  describe('setLiveGrandPrix', () => {
    it('should set liveGrandPrix with TTL', async () => {
      await liveGrandPrixCacheStrategy.setLiveGrandPrix(mockLiveGrandPrix);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'liveGrandPrix:1',
        mockLiveGrandPrix,
        LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX
      );
    });
  });

  describe('getLiveGrandPrixByEventName', () => {
    it('should get liveGrandPrix by event name', async () => {
      mockCacheService.get.mockResolvedValue(mockLiveGrandPrix);

      const result =
        await liveGrandPrixCacheStrategy.getLiveGrandPrixByEventName(
          '104期 1stTerm 第3回個人戦'
        );

      expect(result).toEqual(mockLiveGrandPrix);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'liveGrandPrix:eventName:104期 1stTerm 第3回個人戦'
      );
    });
  });

  describe('setLiveGrandPrixByEventName', () => {
    it('should set liveGrandPrix by event name with TTL', async () => {
      await liveGrandPrixCacheStrategy.setLiveGrandPrixByEventName(
        mockLiveGrandPrix
      );

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'liveGrandPrix:eventName:104期 1stTerm 第3回個人戦',
        mockLiveGrandPrix,
        LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX
      );
    });
  });

  describe('getLiveGrandPrixList', () => {
    it('should get liveGrandPrix list by filter hash', async () => {
      const mockList = [mockLiveGrandPrix];
      mockCacheService.get.mockResolvedValue(mockList);

      const result =
        await liveGrandPrixCacheStrategy.getLiveGrandPrixList('abc123');

      expect(result).toEqual(mockList);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'liveGrandPrix:list:abc123'
      );
    });
  });

  describe('setLiveGrandPrixList', () => {
    it('should set liveGrandPrix list with TTL', async () => {
      const mockList = [mockLiveGrandPrix];

      await liveGrandPrixCacheStrategy.setLiveGrandPrixList('abc123', mockList);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'liveGrandPrix:list:abc123',
        mockList,
        LIVE_GRAND_PRIX_TTL.LIVE_GRAND_PRIX_LIST
      );
    });
  });

  describe('invalidateLiveGrandPrix', () => {
    it('should invalidate liveGrandPrix and list cache', async () => {
      await liveGrandPrixCacheStrategy.invalidateLiveGrandPrix(1);

      expect(mockCacheService.del).toHaveBeenCalledWith('liveGrandPrix:1');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'liveGrandPrix:list:*'
      );
    });
  });

  describe('invalidateAllLiveGrandPrix', () => {
    it('should invalidate all liveGrandPrix caches', async () => {
      await liveGrandPrixCacheStrategy.invalidateAllLiveGrandPrix();

      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'liveGrandPrix:*'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats', async () => {
      const mockStats = { totalEvents: 50 };
      mockCacheService.get.mockResolvedValue(mockStats);

      const result = await liveGrandPrixCacheStrategy.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheService.get).toHaveBeenCalledWith('liveGrandPrix:stats');
    });
  });

  describe('setStats', () => {
    it('should set stats with TTL', async () => {
      const mockStats = { totalEvents: 50 };

      await liveGrandPrixCacheStrategy.setStats(mockStats);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'liveGrandPrix:stats',
        mockStats,
        LIVE_GRAND_PRIX_TTL.STATS
      );
    });
  });
});
