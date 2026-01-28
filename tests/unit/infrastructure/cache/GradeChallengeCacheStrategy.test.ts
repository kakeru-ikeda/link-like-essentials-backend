/* eslint-disable @typescript-eslint/unbound-method */
import type { GradeChallenge } from '../../../../src/domain/entities/GradeChallenge';
import type { CacheService } from '../../../../src/infrastructure/cache/CacheService';
import {
  GradeChallengeCacheStrategy,
  GRADE_CHALLENGE_TTL,
} from '../../../../src/infrastructure/cache/strategies/GradeChallengeCacheStrategy';

describe('GradeChallengeCacheStrategy', () => {
  let gradeChallengeCacheStrategy: GradeChallengeCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

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

    gradeChallengeCacheStrategy = new GradeChallengeCacheStrategy(
      mockCacheService
    );
  });

  describe('getGradeChallenge', () => {
    it('should get gradeChallenge by id', async () => {
      mockCacheService.get.mockResolvedValue(mockGradeChallenge);

      const result = await gradeChallengeCacheStrategy.getGradeChallenge(1);

      expect(result).toEqual(mockGradeChallenge);
      expect(mockCacheService.get).toHaveBeenCalledWith('gradeChallenge:1');
    });
  });

  describe('setGradeChallenge', () => {
    it('should set gradeChallenge with TTL', async () => {
      await gradeChallengeCacheStrategy.setGradeChallenge(mockGradeChallenge);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'gradeChallenge:1',
        mockGradeChallenge,
        GRADE_CHALLENGE_TTL.GRADE_CHALLENGE
      );
    });
  });

  describe('getGradeChallengeByTitle', () => {
    it('should get gradeChallenge by title', async () => {
      mockCacheService.get.mockResolvedValue(mockGradeChallenge);

      const result = await gradeChallengeCacheStrategy.getGradeChallengeByTitle(
        '2026年1月'
      );

      expect(result).toEqual(mockGradeChallenge);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'gradeChallenge:title:2026年1月'
      );
    });
  });

  describe('setGradeChallengeByTitle', () => {
    it('should set gradeChallenge by title with TTL', async () => {
      await gradeChallengeCacheStrategy.setGradeChallengeByTitle(
        mockGradeChallenge
      );

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'gradeChallenge:title:2026年1月',
        mockGradeChallenge,
        GRADE_CHALLENGE_TTL.GRADE_CHALLENGE
      );
    });
  });

  describe('getGradeChallengeList', () => {
    it('should get gradeChallenge list by filter hash', async () => {
      const mockList = [mockGradeChallenge];
      mockCacheService.get.mockResolvedValue(mockList);

      const result = await gradeChallengeCacheStrategy.getGradeChallengeList(
        'abc123'
      );

      expect(result).toEqual(mockList);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'gradeChallenge:list:abc123'
      );
    });
  });

  describe('setGradeChallengeList', () => {
    it('should set gradeChallenge list with TTL', async () => {
      const mockList = [mockGradeChallenge];

      await gradeChallengeCacheStrategy.setGradeChallengeList(
        'abc123',
        mockList
      );

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'gradeChallenge:list:abc123',
        mockList,
        GRADE_CHALLENGE_TTL.GRADE_CHALLENGE_LIST
      );
    });
  });

  describe('invalidateGradeChallenge', () => {
    it('should invalidate gradeChallenge and list cache', async () => {
      await gradeChallengeCacheStrategy.invalidateGradeChallenge(1);

      expect(mockCacheService.del).toHaveBeenCalledWith('gradeChallenge:1');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'gradeChallenge:list:*'
      );
    });
  });

  describe('invalidateAllGradeChallenges', () => {
    it('should invalidate all gradeChallenge caches', async () => {
      await gradeChallengeCacheStrategy.invalidateAllGradeChallenges();

      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'gradeChallenge:*'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats', async () => {
      const mockStats = { totalEvents: 12 };
      mockCacheService.get.mockResolvedValue(mockStats);

      const result = await gradeChallengeCacheStrategy.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheService.get).toHaveBeenCalledWith('gradeChallenge:stats');
    });
  });

  describe('setStats', () => {
    it('should set stats with TTL', async () => {
      const mockStats = { totalEvents: 12 };

      await gradeChallengeCacheStrategy.setStats(mockStats);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'gradeChallenge:stats',
        mockStats,
        GRADE_CHALLENGE_TTL.STATS
      );
    });
  });
});
