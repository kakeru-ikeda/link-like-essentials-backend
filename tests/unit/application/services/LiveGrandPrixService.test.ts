import { LiveGrandPrixService } from '@/application/services/LiveGrandPrixService';
import type { LiveGrandPrix } from '@/domain/entities/LiveGrandPrix';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ILiveGrandPrixRepository } from '@/domain/repositories/ILiveGrandPrixRepository';
import type { LiveGrandPrixCacheStrategy } from '@/infrastructure/cache/strategies/LiveGrandPrixCacheStrategy';

describe('LiveGrandPrixService', () => {
  let liveGrandPrixService: LiveGrandPrixService;
  let mockRepository: jest.Mocked<ILiveGrandPrixRepository>;
  let mockCacheStrategy: jest.Mocked<LiveGrandPrixCacheStrategy>;

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
    details: [
      {
        id: 1,
        liveGrandPrixId: 1,
        stageName: 'A',
        specialEffect: 'スキルを10回使用するたび、APが5回復',
        songId: 31,
        isLocked: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        sectionEffects: [
          {
            id: 1,
            detailId: 1,
            sectionName: 'セクション1',
            effect: 'メンタルの減少速度を100%増加する',
            sectionOrder: 1,
            isLocked: false,
            createdAt: new Date('2024-01-01'),
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    // モックリポジトリの作成
    mockRepository = {
      findById: jest.fn(),
      findByEventName: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<ILiveGrandPrixRepository>;

    // モックキャッシュの作成
    mockCacheStrategy = {
      getLiveGrandPrix: jest.fn(),
      setLiveGrandPrix: jest.fn(),
      getLiveGrandPrixByEventName: jest.fn(),
      setLiveGrandPrixByEventName: jest.fn(),
      getLiveGrandPrixList: jest.fn(),
      setLiveGrandPrixList: jest.fn(),
      getStats: jest.fn(),
      setStats: jest.fn(),
    } as unknown as jest.Mocked<LiveGrandPrixCacheStrategy>;

    liveGrandPrixService = new LiveGrandPrixService(
      mockRepository,
      mockCacheStrategy
    );
  });

  describe('findById', () => {
    it('should return liveGrandPrix from cache if available', async () => {
      mockCacheStrategy.getLiveGrandPrix.mockResolvedValue(mockLiveGrandPrix);

      const result = await liveGrandPrixService.findById(1);

      expect(result).toEqual(mockLiveGrandPrix);
      expect(mockCacheStrategy.getLiveGrandPrix).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getLiveGrandPrix.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockLiveGrandPrix);

      const result = await liveGrandPrixService.findById(1);

      expect(result).toEqual(mockLiveGrandPrix);
      expect(mockCacheStrategy.getLiveGrandPrix).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCacheStrategy.setLiveGrandPrix).toHaveBeenCalledWith(
        mockLiveGrandPrix
      );
    });

    it('should throw NotFoundError if liveGrandPrix does not exist', async () => {
      mockCacheStrategy.getLiveGrandPrix.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      await expect(liveGrandPrixService.findById(999)).rejects.toThrow(
        NotFoundError
      );
      await expect(liveGrandPrixService.findById(999)).rejects.toThrow(
        'LiveGrandPrix with id 999 not found'
      );
    });
  });

  describe('findByEventName', () => {
    it('should return liveGrandPrix from cache if available', async () => {
      mockCacheStrategy.getLiveGrandPrixByEventName.mockResolvedValue(
        mockLiveGrandPrix
      );

      const result = await liveGrandPrixService.findByEventName(
        '104期 1stTerm 第3回個人戦'
      );

      expect(result).toEqual(mockLiveGrandPrix);
      expect(
        mockCacheStrategy.getLiveGrandPrixByEventName
      ).toHaveBeenCalledWith('104期 1stTerm 第3回個人戦');
      expect(mockRepository.findByEventName).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheStrategy.getLiveGrandPrixByEventName.mockResolvedValue(null);
      mockRepository.findByEventName.mockResolvedValue(mockLiveGrandPrix);

      const result = await liveGrandPrixService.findByEventName(
        '104期 1stTerm 第3回個人戦'
      );

      expect(result).toEqual(mockLiveGrandPrix);
      expect(mockRepository.findByEventName).toHaveBeenCalledWith(
        '104期 1stTerm 第3回個人戦'
      );
      expect(
        mockCacheStrategy.setLiveGrandPrixByEventName
      ).toHaveBeenCalledWith(mockLiveGrandPrix);
    });

    it('should return null if liveGrandPrix does not exist', async () => {
      mockCacheStrategy.getLiveGrandPrixByEventName.mockResolvedValue(null);
      mockRepository.findByEventName.mockResolvedValue(null);

      const result =
        await liveGrandPrixService.findByEventName('Unknown Event');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return liveGrandPrix list from cache if available', async () => {
      const mockList = [mockLiveGrandPrix];
      mockCacheStrategy.getLiveGrandPrixList.mockResolvedValue(mockList);

      const result = await liveGrandPrixService.findAll();

      expect(result).toEqual(mockList);
      expect(mockCacheStrategy.getLiveGrandPrixList).toHaveBeenCalled();
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      const mockList = [mockLiveGrandPrix];
      mockCacheStrategy.getLiveGrandPrixList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await liveGrandPrixService.findAll();

      expect(result).toEqual(mockList);
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(mockCacheStrategy.setLiveGrandPrixList).toHaveBeenCalled();
    });

    it('should use filter to generate cache key', async () => {
      const mockList = [mockLiveGrandPrix];
      const filter = { yearTerm: '104期' };

      mockCacheStrategy.getLiveGrandPrixList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await liveGrandPrixService.findAll(filter);

      expect(result).toEqual(mockList);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(mockCacheStrategy.getLiveGrandPrixList).toHaveBeenCalled();
      expect(mockCacheStrategy.setLiveGrandPrixList).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return liveGrandPrix statistics from cache if available', async () => {
      const mockStats = {
        totalEvents: 50,
        byYearTerm: [
          { yearTerm: '104期', count: 20 },
          { yearTerm: '105期', count: 30 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(mockStats);

      const result = await liveGrandPrixService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      const mockStats = {
        totalEvents: 50,
        byYearTerm: [
          { yearTerm: '104期', count: 20 },
          { yearTerm: '105期', count: 30 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(null);
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await liveGrandPrixService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalled();
      expect(mockCacheStrategy.setStats).toHaveBeenCalledWith(mockStats);
    });
  });
});
