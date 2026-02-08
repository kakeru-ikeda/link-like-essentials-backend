import { UnDrawAnalysisService } from '@/application/services/UnDrawAnalysisService';
import type { UnDrawAnalysis } from '@/domain/entities/TraitAnalysis';
import type { IUnDrawAnalysisRepository } from '@/domain/repositories/ITraitAnalysisRepository';
import type { UnDrawAnalysisCacheStrategy } from '@/infrastructure/cache/strategies/UnDrawAnalysisCacheStrategy';

describe('UnDrawAnalysisService', () => {
  let service: UnDrawAnalysisService;
  let mockRepository: jest.Mocked<IUnDrawAnalysisRepository>;
  let mockCacheStrategy: jest.Mocked<UnDrawAnalysisCacheStrategy>;

  const mockAnalysis: UnDrawAnalysis = {
    id: 1,
    cardId: 100,
    accessoryId: null,
    section1: true,
    section2: false,
    section3: true,
    section4: false,
    section5: true,
    sectionFever: false,
    conditionDetail: { condition: 'test' },
    analyzedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockRepository = {
      findByCardId: jest.fn(),
      findByAccessoryId: jest.fn(),
    } as unknown as jest.Mocked<IUnDrawAnalysisRepository>;

    mockCacheStrategy = {
      getByCardId: jest.fn(),
      setByCardId: jest.fn(),
      getByAccessoryId: jest.fn(),
      setByAccessoryId: jest.fn(),
      invalidateByCardId: jest.fn(),
      invalidateByAccessoryId: jest.fn(),
    } as unknown as jest.Mocked<UnDrawAnalysisCacheStrategy>;

    service = new UnDrawAnalysisService(mockRepository, mockCacheStrategy);
  });

  describe('findByCardId', () => {
    it('should return analysis from cache if available', async () => {
      mockCacheStrategy.getByCardId.mockResolvedValue(mockAnalysis);

      const result = await service.findByCardId(100);

      expect(result).toEqual(mockAnalysis);
      expect(mockCacheStrategy.getByCardId).toHaveBeenCalledWith(100);
      expect(mockRepository.findByCardId).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getByCardId.mockResolvedValue(null);
      mockRepository.findByCardId.mockResolvedValue(mockAnalysis);

      const result = await service.findByCardId(100);

      expect(result).toEqual(mockAnalysis);
      expect(mockCacheStrategy.getByCardId).toHaveBeenCalledWith(100);
      expect(mockRepository.findByCardId).toHaveBeenCalledWith(100);
      expect(mockCacheStrategy.setByCardId).toHaveBeenCalledWith(
        100,
        mockAnalysis
      );
    });

    it('should return null if analysis does not exist', async () => {
      mockCacheStrategy.getByCardId.mockResolvedValue(null);
      mockRepository.findByCardId.mockResolvedValue(null);

      const result = await service.findByCardId(999);

      expect(result).toBeNull();
      expect(mockCacheStrategy.getByCardId).toHaveBeenCalledWith(999);
      expect(mockRepository.findByCardId).toHaveBeenCalledWith(999);
      expect(mockCacheStrategy.setByCardId).not.toHaveBeenCalled();
    });
  });

  describe('findByAccessoryId', () => {
    const mockAccessoryAnalysis: UnDrawAnalysis = {
      ...mockAnalysis,
      id: 2,
      cardId: null,
      accessoryId: 200,
    };

    it('should return analysis from cache if available', async () => {
      mockCacheStrategy.getByAccessoryId.mockResolvedValue(
        mockAccessoryAnalysis
      );

      const result = await service.findByAccessoryId(200);

      expect(result).toEqual(mockAccessoryAnalysis);
      expect(mockCacheStrategy.getByAccessoryId).toHaveBeenCalledWith(200);
      expect(mockRepository.findByAccessoryId).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getByAccessoryId.mockResolvedValue(null);
      mockRepository.findByAccessoryId.mockResolvedValue(mockAccessoryAnalysis);

      const result = await service.findByAccessoryId(200);

      expect(result).toEqual(mockAccessoryAnalysis);
      expect(mockCacheStrategy.getByAccessoryId).toHaveBeenCalledWith(200);
      expect(mockRepository.findByAccessoryId).toHaveBeenCalledWith(200);
      expect(mockCacheStrategy.setByAccessoryId).toHaveBeenCalledWith(
        200,
        mockAccessoryAnalysis
      );
    });

    it('should return null if analysis does not exist', async () => {
      mockCacheStrategy.getByAccessoryId.mockResolvedValue(null);
      mockRepository.findByAccessoryId.mockResolvedValue(null);

      const result = await service.findByAccessoryId(999);

      expect(result).toBeNull();
      expect(mockCacheStrategy.getByAccessoryId).toHaveBeenCalledWith(999);
      expect(mockRepository.findByAccessoryId).toHaveBeenCalledWith(999);
      expect(mockCacheStrategy.setByAccessoryId).not.toHaveBeenCalled();
    });
  });
});
