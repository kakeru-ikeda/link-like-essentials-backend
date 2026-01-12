import { CardDetailService } from '@/application/services/CardDetailService';
import type { CardDetail } from '@/domain/entities/CardDetail';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ICardDetailRepository } from '@/domain/repositories/ICardDetailRepository';
import type { DetailCacheStrategy } from '@/infrastructure/cache/strategies/DetailCacheStrategy';

describe('CardDetailService', () => {
  let cardDetailService: CardDetailService;
  let mockRepository: jest.Mocked<ICardDetailRepository>;
  let mockCacheStrategy: jest.Mocked<DetailCacheStrategy>;

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
    mockRepository = {
      findByCardId: jest.fn(),
      findByCardIds: jest.fn(),
    } as unknown as jest.Mocked<ICardDetailRepository>;

    mockCacheStrategy = {
      getDetail: jest.fn(),
      setDetail: jest.fn(),
      invalidateDetail: jest.fn(),
      invalidateAllDetails: jest.fn(),
    } as unknown as jest.Mocked<DetailCacheStrategy>;

    cardDetailService = new CardDetailService(mockRepository, mockCacheStrategy);
  });

  describe('findByCardId', () => {
    it('should return detail from cache if available', async () => {
      mockCacheStrategy.getDetail.mockResolvedValue(mockDetail);

      const result = await cardDetailService.findByCardId(1);

      expect(result).toEqual(mockDetail);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledWith(1);
      expect(mockRepository.findByCardId).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getDetail.mockResolvedValue(null);
      mockRepository.findByCardId.mockResolvedValue(mockDetail);

      const result = await cardDetailService.findByCardId(1);

      expect(result).toEqual(mockDetail);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledWith(1);
      expect(mockRepository.findByCardId).toHaveBeenCalledWith(1);
      expect(mockCacheStrategy.setDetail).toHaveBeenCalledWith(mockDetail);
    });

    it('should throw NotFoundError if detail does not exist', async () => {
      mockCacheStrategy.getDetail.mockResolvedValue(null);
      mockRepository.findByCardId.mockResolvedValue(null);

      await expect(cardDetailService.findByCardId(999)).rejects.toThrow(
        NotFoundError
      );
      await expect(cardDetailService.findByCardId(999)).rejects.toThrow(
        'CardDetail for cardId 999 not found'
      );
    });
  });

  describe('buildStats', () => {
    it('should build stats from detail', () => {
      const result = cardDetailService.buildStats(mockDetail);

      expect(result).toEqual({
        smile: 60,
        pure: 55,
        cool: 50,
        mental: 45,
      });
    });

    it('should return null values for null level strings', () => {
      const detailWithNullLevels: CardDetail = {
        ...mockDetail,
        smileMaxLevel: null,
        pureMaxLevel: null,
        coolMaxLevel: null,
        mentalMaxLevel: null,
      };

      const result = cardDetailService.buildStats(detailWithNullLevels);

      expect(result).toEqual({
        smile: null,
        pure: null,
        cool: null,
        mental: null,
      });
    });

    it('should return null for invalid number strings', () => {
      const detailWithInvalidLevels: CardDetail = {
        ...mockDetail,
        smileMaxLevel: 'invalid',
        pureMaxLevel: 'abc',
        coolMaxLevel: '',
        mentalMaxLevel: '100',
      };

      const result = cardDetailService.buildStats(detailWithInvalidLevels);

      expect(result).toEqual({
        smile: null,
        pure: null,
        cool: null,
        mental: 100,
      });
    });
  });

  describe('buildSpecialAppeal', () => {
    it('should build special appeal from detail', () => {
      const result = cardDetailService.buildSpecialAppeal(mockDetail);

      expect(result).toEqual({
        name: 'Special Appeal',
        ap: '10',
        effect: 'Special Effect',
      });
    });

    it('should return null if specialAppealName is null', () => {
      const detailWithoutSpecialAppeal: CardDetail = {
        ...mockDetail,
        specialAppealName: null,
        specialAppealAp: null,
        specialAppealEffect: null,
      };

      const result = cardDetailService.buildSpecialAppeal(
        detailWithoutSpecialAppeal
      );

      expect(result).toBeNull();
    });
  });

  describe('buildSkill', () => {
    it('should build skill from detail', () => {
      const result = cardDetailService.buildSkill(mockDetail);

      expect(result).toEqual({
        name: 'Skill Name',
        ap: '5',
        effect: 'Skill Effect',
      });
    });

    it('should return null if skillName is null', () => {
      const detailWithoutSkill: CardDetail = {
        ...mockDetail,
        skillName: null,
        skillAp: null,
        skillEffect: null,
      };

      const result = cardDetailService.buildSkill(detailWithoutSkill);

      expect(result).toBeNull();
    });
  });

  describe('buildTrait', () => {
    it('should build trait from detail', () => {
      const result = cardDetailService.buildTrait(mockDetail);

      expect(result).toEqual({
        name: 'Trait Name',
        effect: 'Trait Effect',
      });
    });

    it('should return null if traitName is null', () => {
      const detailWithoutTrait: CardDetail = {
        ...mockDetail,
        traitName: null,
        traitEffect: null,
      };

      const result = cardDetailService.buildTrait(detailWithoutTrait);

      expect(result).toBeNull();
    });
  });

  describe('findByCardIds', () => {
    const mockDetail2: CardDetail = {
      ...mockDetail,
      id: 2,
      cardId: 2,
      favoriteMode: 'メロウ',
    };

    const mockDetail3: CardDetail = {
      ...mockDetail,
      id: 3,
      cardId: 3,
      favoriteMode: 'ニュートラル',
    };

    it('should return all details from cache if all are cached', async () => {
      mockCacheStrategy.getDetail
        .mockResolvedValueOnce(mockDetail)
        .mockResolvedValueOnce(mockDetail2)
        .mockResolvedValueOnce(mockDetail3);

      const result = await cardDetailService.findByCardIds([1, 2, 3]);

      expect(result).toEqual([mockDetail, mockDetail2, mockDetail3]);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledTimes(3);
      expect(mockRepository.findByCardIds).not.toHaveBeenCalled();
      expect(mockCacheStrategy.setDetail).not.toHaveBeenCalled();
    });

    it('should fetch from repository for cache misses and cache them', async () => {
      // cardId 1: cached, cardId 2: not cached, cardId 3: cached
      mockCacheStrategy.getDetail
        .mockResolvedValueOnce(mockDetail)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockDetail3);
      mockRepository.findByCardIds.mockResolvedValue([mockDetail2]);

      const result = await cardDetailService.findByCardIds([1, 2, 3]);

      expect(result).toHaveLength(3);
      expect(result).toContainEqual(mockDetail);
      expect(result).toContainEqual(mockDetail2);
      expect(result).toContainEqual(mockDetail3);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledTimes(3);
      expect(mockRepository.findByCardIds).toHaveBeenCalledWith([2]);
      expect(mockCacheStrategy.setDetail).toHaveBeenCalledWith(mockDetail2);
    });

    it('should fetch all from repository if none are cached', async () => {
      mockCacheStrategy.getDetail
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockRepository.findByCardIds.mockResolvedValue([
        mockDetail,
        mockDetail2,
        mockDetail3,
      ]);

      const result = await cardDetailService.findByCardIds([1, 2, 3]);

      expect(result).toEqual([mockDetail, mockDetail2, mockDetail3]);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledTimes(3);
      expect(mockRepository.findByCardIds).toHaveBeenCalledWith([1, 2, 3]);
      expect(mockCacheStrategy.setDetail).toHaveBeenCalledTimes(3);
    });

    it('should return only cached details if no cache misses', async () => {
      mockCacheStrategy.getDetail
        .mockResolvedValueOnce(mockDetail)
        .mockResolvedValueOnce(mockDetail2);

      const result = await cardDetailService.findByCardIds([1, 2]);

      expect(result).toEqual([mockDetail, mockDetail2]);
      expect(mockRepository.findByCardIds).not.toHaveBeenCalled();
    });

    it('should handle empty array', async () => {
      const result = await cardDetailService.findByCardIds([]);

      expect(result).toEqual([]);
      expect(mockCacheStrategy.getDetail).not.toHaveBeenCalled();
      expect(mockRepository.findByCardIds).not.toHaveBeenCalled();
    });

    it('should handle single ID', async () => {
      mockCacheStrategy.getDetail.mockResolvedValue(null);
      mockRepository.findByCardIds.mockResolvedValue([mockDetail]);

      const result = await cardDetailService.findByCardIds([1]);

      expect(result).toEqual([mockDetail]);
      expect(mockCacheStrategy.getDetail).toHaveBeenCalledWith(1);
      expect(mockRepository.findByCardIds).toHaveBeenCalledWith([1]);
      expect(mockCacheStrategy.setDetail).toHaveBeenCalledWith(mockDetail);
    });
  });
});
