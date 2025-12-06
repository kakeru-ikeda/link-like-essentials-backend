import { CardService } from '@/application/services/CardService';
import type { Card } from '@/domain/entities/Card';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ICardRepository } from '@/domain/repositories/ICardRepository';
import type { CardCacheStrategy } from '@/infrastructure/cache/strategies/CardCacheStrategy';

describe('CardService', () => {
  let cardService: CardService;
  let mockRepository: jest.Mocked<ICardRepository>;
  let mockCacheStrategy: jest.Mocked<CardCacheStrategy>;

  const mockCard: Card = {
    id: 1,
    rarity: 'UR',
    limited: 'LIMITED',
    cardName: 'Test Card',
    cardUrl: 'https://example.com/card.jpg',
    characterName: 'Test Character',
    styleType: 'CHEERLEADER',
    releaseDate: null,
    isLocked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    // モックリポジトリの作成
    mockRepository = {
      findById: jest.fn(),
      findByCardNameAndCharacter: jest.fn(),
      findAll: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<ICardRepository>;

    // モックキャッシュの作成
    mockCacheStrategy = {
      getCard: jest.fn(),
      setCard: jest.fn(),
      getCardByName: jest.fn(),
      setCardByName: jest.fn(),
      getCardList: jest.fn(),
      setCardList: jest.fn(),
      getStats: jest.fn(),
      setStats: jest.fn(),
    } as unknown as jest.Mocked<CardCacheStrategy>;

    cardService = new CardService(mockRepository, mockCacheStrategy);
  });

  describe('findById', () => {
    it('should return card from cache if available', async () => {
      mockCacheStrategy.getCard.mockResolvedValue(mockCard);

      const result = await cardService.findById(1);

      expect(result).toEqual(mockCard);
      expect(mockCacheStrategy.getCard).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getCard.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockCard);

      const result = await cardService.findById(1);

      expect(result).toEqual(mockCard);
      expect(mockCacheStrategy.getCard).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCacheStrategy.setCard).toHaveBeenCalledWith(mockCard);
    });

    it('should throw NotFoundError if card does not exist', async () => {
      mockCacheStrategy.getCard.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      await expect(cardService.findById(999)).rejects.toThrow(NotFoundError);
      await expect(cardService.findById(999)).rejects.toThrow(
        'Card with id 999 not found'
      );
    });
  });

  describe('findByName', () => {
    it('should return card from cache if available', async () => {
      mockCacheStrategy.getCardByName.mockResolvedValue(mockCard);

      const result = await cardService.findByName(
        'Test Card',
        'Test Character'
      );

      expect(result).toEqual(mockCard);
      expect(mockCacheStrategy.getCardByName).toHaveBeenCalledWith(
        'Test Card',
        'Test Character'
      );
      expect(mockRepository.findByCardNameAndCharacter).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheStrategy.getCardByName.mockResolvedValue(null);
      mockRepository.findByCardNameAndCharacter.mockResolvedValue(mockCard);

      const result = await cardService.findByName(
        'Test Card',
        'Test Character'
      );

      expect(result).toEqual(mockCard);
      expect(mockRepository.findByCardNameAndCharacter).toHaveBeenCalledWith(
        'Test Card',
        'Test Character'
      );
      expect(mockCacheStrategy.setCardByName).toHaveBeenCalledWith(mockCard);
    });

    it('should return null if card does not exist', async () => {
      mockCacheStrategy.getCardByName.mockResolvedValue(null);
      mockRepository.findByCardNameAndCharacter.mockResolvedValue(null);

      const result = await cardService.findByName('Unknown', 'Unknown');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return card statistics from cache if available', async () => {
      const mockStats = {
        totalCards: 100,
        byRarity: [
          { rarity: 'UR', count: 10 },
          { rarity: 'SR', count: 20 },
          { rarity: 'R', count: 70 },
        ],
        byStyleType: [
          { styleType: 'CHEERLEADER', count: 30 },
          { styleType: 'TRICKSTER', count: 40 },
        ],
        byCharacter: [
          { characterName: 'Character 1', count: 50 },
          { characterName: 'Character 2', count: 50 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(mockStats);

      const result = await cardService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const mockStats = {
        totalCards: 100,
        byRarity: [
          { rarity: 'UR', count: 10 },
          { rarity: 'SR', count: 20 },
          { rarity: 'R', count: 70 },
        ],
        byStyleType: [
          { styleType: 'CHEERLEADER', count: 30 },
          { styleType: 'TRICKSTER', count: 40 },
        ],
        byCharacter: [
          { characterName: 'Character 1', count: 50 },
          { characterName: 'Character 2', count: 50 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(null);
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await cardService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).toHaveBeenCalled();
      expect(mockCacheStrategy.setStats).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('findAll', () => {
    it('should return cards from cache if available', async () => {
      const mockCards = [mockCard];
      mockCacheStrategy.getCardList.mockResolvedValue(mockCards);

      const result = await cardService.findAll();

      expect(result).toEqual(mockCards);
      expect(mockCacheStrategy.getCardList).toHaveBeenCalled();
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const mockCards = [mockCard];
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockCards);

      const result = await cardService.findAll();

      expect(result).toEqual(mockCards);
      expect(mockCacheStrategy.getCardList).toHaveBeenCalled();
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(mockCacheStrategy.setCardList).toHaveBeenCalled();
    });

    it('should fetch from repository with filter if cache returns non-array', async () => {
      const mockCards = [mockCard];
      mockCacheStrategy.getCardList.mockResolvedValue({} as unknown as null);
      mockRepository.findAll.mockResolvedValue(mockCards);

      const filter = { rarity: 'UR' };
      const result = await cardService.findAll(filter);

      expect(result).toEqual(mockCards);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should pass filter to repository', async () => {
      const mockCards = [mockCard];
      const filter = { rarity: 'UR', characterName: 'Test' };
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockCards);

      await cardService.findAll(filter);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should generate consistent hash for same filter', async () => {
      mockCacheStrategy.getCardList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([]);

      const filter = { rarity: 'UR' };
      await cardService.findAll(filter);
      const firstCall = mockCacheStrategy.getCardList.mock.calls[0]?.[0];

      await cardService.findAll(filter);
      const secondCall = mockCacheStrategy.getCardList.mock.calls[1]?.[0];

      expect(firstCall).toBe(secondCall);
    });
  });
});
