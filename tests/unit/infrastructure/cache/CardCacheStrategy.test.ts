import type { Card } from '@/domain/entities/Card';
import type { CacheService } from '@/infrastructure/cache/CacheService';
import {
  CardCacheStrategy,
  TTL,
} from '@/infrastructure/cache/strategies/CardCacheStrategy';

describe('CardCacheStrategy', () => {
  let cardCacheStrategy: CardCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

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
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      invalidatePattern: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    cardCacheStrategy = new CardCacheStrategy(mockCacheService);
  });

  describe('getCard', () => {
    it('should get card by id', async () => {
      mockCacheService.get.mockResolvedValue(mockCard);

      const result = await cardCacheStrategy.getCard(1);

      expect(result).toEqual(mockCard);
      expect(mockCacheService.get).toHaveBeenCalledWith('card:1');
    });
  });

  describe('setCard', () => {
    it('should set card with TTL', async () => {
      await cardCacheStrategy.setCard(mockCard);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'card:1',
        mockCard,
        TTL.CARD
      );
    });
  });

  describe('getCardByName', () => {
    it('should get card by name and character', async () => {
      mockCacheService.get.mockResolvedValue(mockCard);

      const result = await cardCacheStrategy.getCardByName(
        'Test Card',
        'Test Character'
      );

      expect(result).toEqual(mockCard);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'card:name:Test Card:Test Character'
      );
    });
  });

  describe('setCardByName', () => {
    it('should set card by name with TTL', async () => {
      await cardCacheStrategy.setCardByName(mockCard);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'card:name:Test Card:Test Character',
        mockCard,
        TTL.CARD
      );
    });
  });

  describe('getCardList', () => {
    it('should get card list by filter hash', async () => {
      const mockCards = [mockCard];
      mockCacheService.get.mockResolvedValue(mockCards);

      const result = await cardCacheStrategy.getCardList('abc123');

      expect(result).toEqual(mockCards);
      expect(mockCacheService.get).toHaveBeenCalledWith('cards:list:abc123');
    });
  });

  describe('setCardList', () => {
    it('should set card list with TTL', async () => {
      const mockCards = [mockCard];

      await cardCacheStrategy.setCardList('abc123', mockCards);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'cards:list:abc123',
        mockCards,
        TTL.CARD_LIST
      );
    });
  });

  describe('invalidateCard', () => {
    it('should invalidate card and list cache', async () => {
      await cardCacheStrategy.invalidateCard(1);

      expect(mockCacheService.del).toHaveBeenCalledWith('card:1');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'cards:list:*'
      );
    });
  });

  describe('invalidateAllCards', () => {
    it('should invalidate all card caches', async () => {
      await cardCacheStrategy.invalidateAllCards();

      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('card:*');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'cards:*'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats', async () => {
      const mockStats = { totalCards: 100 };
      mockCacheService.get.mockResolvedValue(mockStats);

      const result = await cardCacheStrategy.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheService.get).toHaveBeenCalledWith('cards:stats');
    });
  });

  describe('setStats', () => {
    it('should set stats with TTL', async () => {
      const mockStats = { totalCards: 100 };

      await cardCacheStrategy.setStats(mockStats);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'cards:stats',
        mockStats,
        TTL.STATS
      );
    });
  });

  describe('TTL constants', () => {
    it('should have correct TTL values', () => {
      expect(TTL.CARD).toBe(24 * 60 * 60); // 24 hours
      expect(TTL.CARD_LIST).toBe(60 * 60); // 1 hour
      expect(TTL.CARD_DETAIL).toBe(6 * 60 * 60); // 6 hours
      expect(TTL.STATS).toBe(30 * 60); // 30 minutes
    });
  });
});
