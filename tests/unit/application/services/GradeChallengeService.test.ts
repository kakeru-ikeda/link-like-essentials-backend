/* eslint-disable @typescript-eslint/unbound-method */
import { GradeChallengeService } from '../../../../src/application/services/GradeChallengeService';
import type { GradeChallenge } from '../../../../src/domain/entities/GradeChallenge';
import { NotFoundError } from '../../../../src/domain/errors/AppError';
import type { IGradeChallengeRepository } from '../../../../src/domain/repositories/IGradeChallengeRepository';
import type { GradeChallengeCacheStrategy } from '../../../../src/infrastructure/cache/strategies/GradeChallengeCacheStrategy';

describe('GradeChallengeService', () => {
  let gradeChallengeService: GradeChallengeService;
  let mockRepository: jest.Mocked<IGradeChallengeRepository>;
  let mockCacheStrategy: jest.Mocked<GradeChallengeCacheStrategy>;

  const mockGradeChallenge: GradeChallenge = {
    id: 1,
    title: '2026年1月',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-31T23:59:59.000Z'),
    detailUrl: 'https://example.com/grade-challenge',
    termName: '104期 2nd Term',
    isLocked: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    details: [
      {
        id: 10,
        gradeChallengeId: 1,
        stageName: 'A',
        specialEffect: 'スキルを10回使用するたび、APが5回復',
        songId: 31,
        isLocked: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
        sectionEffects: [
          {
            id: 100,
            detailId: 10,
            sectionName: 'セクション1',
            effect: 'メンタルの減少速度を100%増加する',
            sectionOrder: 1,
            isLocked: false,
            createdAt: new Date('2026-01-01'),
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByTitle: jest.fn(),
      findAll: jest.fn(),
      findOngoing: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<IGradeChallengeRepository>;

    mockCacheStrategy = {
      getGradeChallenge: jest.fn(),
      setGradeChallenge: jest.fn(),
      getGradeChallengeByTitle: jest.fn(),
      setGradeChallengeByTitle: jest.fn(),
      getGradeChallengeList: jest.fn(),
      setGradeChallengeList: jest.fn(),
      getStats: jest.fn(),
      setStats: jest.fn(),
    } as unknown as jest.Mocked<GradeChallengeCacheStrategy>;

    gradeChallengeService = new GradeChallengeService(
      mockRepository,
      mockCacheStrategy
    );
  });

  describe('findById', () => {
    it('should return gradeChallenge from cache if available', async () => {
      mockCacheStrategy.getGradeChallenge.mockResolvedValue(mockGradeChallenge);

      const result = await gradeChallengeService.findById(1);

      expect(result).toEqual(mockGradeChallenge);
      expect(mockCacheStrategy.getGradeChallenge).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getGradeChallenge.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockGradeChallenge);

      const result = await gradeChallengeService.findById(1);

      expect(result).toEqual(mockGradeChallenge);
      expect(mockCacheStrategy.getGradeChallenge).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCacheStrategy.setGradeChallenge).toHaveBeenCalledWith(
        mockGradeChallenge
      );
    });

    it('should throw NotFoundError if gradeChallenge does not exist', async () => {
      mockCacheStrategy.getGradeChallenge.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      await expect(gradeChallengeService.findById(999)).rejects.toThrow(
        NotFoundError
      );
      await expect(gradeChallengeService.findById(999)).rejects.toThrow(
        'GradeChallenge with id 999 not found'
      );
    });
  });

  describe('findByTitle', () => {
    it('should return gradeChallenge from cache if available', async () => {
      mockCacheStrategy.getGradeChallengeByTitle.mockResolvedValue(
        mockGradeChallenge
      );

      const result = await gradeChallengeService.findByTitle('2026年1月');

      expect(result).toEqual(mockGradeChallenge);
      expect(
        mockCacheStrategy.getGradeChallengeByTitle
      ).toHaveBeenCalledWith('2026年1月');
      expect(mockRepository.findByTitle).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheStrategy.getGradeChallengeByTitle.mockResolvedValue(null);
      mockRepository.findByTitle.mockResolvedValue(mockGradeChallenge);

      const result = await gradeChallengeService.findByTitle('2026年1月');

      expect(result).toEqual(mockGradeChallenge);
      expect(mockRepository.findByTitle).toHaveBeenCalledWith('2026年1月');
      expect(
        mockCacheStrategy.setGradeChallengeByTitle
      ).toHaveBeenCalledWith(mockGradeChallenge);
    });

    it('should return null if gradeChallenge does not exist', async () => {
      mockCacheStrategy.getGradeChallengeByTitle.mockResolvedValue(null);
      mockRepository.findByTitle.mockResolvedValue(null);

      const result = await gradeChallengeService.findByTitle('Unknown');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return gradeChallenge list from cache if available', async () => {
      const mockList = [mockGradeChallenge];
      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(mockList);

      const result = await gradeChallengeService.findAll();

      expect(result).toEqual(mockList);
      expect(mockCacheStrategy.getGradeChallengeList).toHaveBeenCalled();
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      const mockList = [mockGradeChallenge];
      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await gradeChallengeService.findAll();

      expect(result).toEqual(mockList);
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(mockCacheStrategy.setGradeChallengeList).toHaveBeenCalled();
    });

    it('should use filter to generate cache key', async () => {
      const mockList = [mockGradeChallenge];
      const filter = { termName: '104期 2nd Term' };

      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await gradeChallengeService.findAll(filter);

      expect(result).toEqual(mockList);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(mockCacheStrategy.getGradeChallengeList).toHaveBeenCalled();
      expect(mockCacheStrategy.setGradeChallengeList).toHaveBeenCalled();
    });
  });

  describe('findOngoing', () => {
    it('should return ongoing gradeChallenge from cache if available', async () => {
      const mockOngoingList = [mockGradeChallenge];
      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(mockOngoingList);

      const result = await gradeChallengeService.findOngoing();

      expect(result).toEqual(mockOngoingList);
      expect(mockCacheStrategy.getGradeChallengeList).toHaveBeenCalledWith(
        'ongoing'
      );
      expect(mockRepository.findOngoing).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      const mockOngoingList = [mockGradeChallenge];
      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(null);
      mockRepository.findOngoing.mockResolvedValue(mockOngoingList);

      const result = await gradeChallengeService.findOngoing();

      expect(result).toEqual(mockOngoingList);
      expect(mockRepository.findOngoing).toHaveBeenCalled();
      expect(mockCacheStrategy.setGradeChallengeList).toHaveBeenCalledWith(
        'ongoing',
        mockOngoingList
      );
    });

    it('should return empty array if no ongoing events', async () => {
      mockCacheStrategy.getGradeChallengeList.mockResolvedValue(null);
      mockRepository.findOngoing.mockResolvedValue([]);

      const result = await gradeChallengeService.findOngoing();

      expect(result).toEqual([]);
      expect(mockRepository.findOngoing).toHaveBeenCalled();
      expect(mockCacheStrategy.setGradeChallengeList).toHaveBeenCalledWith(
        'ongoing',
        []
      );
    });
  });

  describe('getStats', () => {
    it('should return gradeChallenge statistics from cache if available', async () => {
      const mockStats = {
        totalEvents: 12,
        byTermName: [
          { termName: '104期 2nd Term', count: 5 },
          { termName: '105期 1st Term', count: 7 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(mockStats);

      const result = await gradeChallengeService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      const mockStats = {
        totalEvents: 12,
        byTermName: [
          { termName: '104期 2nd Term', count: 5 },
          { termName: '105期 1st Term', count: 7 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(null);
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await gradeChallengeService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockRepository.getStats).toHaveBeenCalled();
      expect(mockCacheStrategy.setStats).toHaveBeenCalledWith(mockStats);
    });
  });
});
