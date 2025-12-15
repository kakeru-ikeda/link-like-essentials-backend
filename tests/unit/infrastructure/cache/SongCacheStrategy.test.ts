import type { Song } from '@/domain/entities/Song';
import type { CacheService } from '@/infrastructure/cache/CacheService';
import {
  SongCacheStrategy,
  SONG_TTL,
} from '@/infrastructure/cache/strategies/SongCacheStrategy';

describe('SongCacheStrategy', () => {
  let songCacheStrategy: SongCacheStrategy;
  let mockCacheService: jest.Mocked<CacheService>;

  const mockSong: Song = {
    id: 1,
    songName: 'Test Song',
    songUrl: 'https://example.com/song',
    category: '103期',
    attribute: 'クール',
    centerCharacter: 'Test Character',
    singers: 'Singer1,Singer2',
    participations: 'Character1,Character2',
    liveAnalyzerImageUrl: 'https://example.com/live.png',
    jacketImageUrl: 'https://example.com/jacket.png',
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

    songCacheStrategy = new SongCacheStrategy(mockCacheService);
  });

  describe('getSong', () => {
    it('should get song by id', async () => {
      mockCacheService.get.mockResolvedValue(mockSong);

      const result = await songCacheStrategy.getSong(1);

      expect(result).toEqual(mockSong);
      expect(mockCacheService.get).toHaveBeenCalledWith('song:1');
    });
  });

  describe('setSong', () => {
    it('should set song with TTL', async () => {
      await songCacheStrategy.setSong(mockSong);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'song:1',
        mockSong,
        SONG_TTL.SONG
      );
    });
  });

  describe('getSongByName', () => {
    it('should get song by name', async () => {
      mockCacheService.get.mockResolvedValue(mockSong);

      const result = await songCacheStrategy.getSongByName('Test Song');

      expect(result).toEqual(mockSong);
      expect(mockCacheService.get).toHaveBeenCalledWith('song:name:Test Song');
    });
  });

  describe('setSongByName', () => {
    it('should set song by name with TTL', async () => {
      await songCacheStrategy.setSongByName(mockSong);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'song:name:Test Song',
        mockSong,
        SONG_TTL.SONG
      );
    });
  });

  describe('getSongList', () => {
    it('should get song list by filter hash', async () => {
      const mockSongs = [mockSong];
      mockCacheService.get.mockResolvedValue(mockSongs);

      const result = await songCacheStrategy.getSongList('abc123');

      expect(result).toEqual(mockSongs);
      expect(mockCacheService.get).toHaveBeenCalledWith('songs:list:abc123');
    });
  });

  describe('setSongList', () => {
    it('should set song list with TTL', async () => {
      const mockSongs = [mockSong];

      await songCacheStrategy.setSongList('abc123', mockSongs);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'songs:list:abc123',
        mockSongs,
        SONG_TTL.SONG_LIST
      );
    });
  });

  describe('invalidateSong', () => {
    it('should invalidate song and list cache', async () => {
      await songCacheStrategy.invalidateSong(1);

      expect(mockCacheService.del).toHaveBeenCalledWith('song:1');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'songs:list:*'
      );
    });
  });

  describe('invalidateAllSongs', () => {
    it('should invalidate all song caches', async () => {
      await songCacheStrategy.invalidateAllSongs();

      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('song:*');
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith(
        'songs:*'
      );
    });
  });

  describe('getStats', () => {
    it('should get stats', async () => {
      const mockStats = { totalSongs: 210 };
      mockCacheService.get.mockResolvedValue(mockStats);

      const result = await songCacheStrategy.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheService.get).toHaveBeenCalledWith('songs:stats');
    });
  });

  describe('setStats', () => {
    it('should set stats with TTL', async () => {
      const mockStats = { totalSongs: 210 };

      await songCacheStrategy.setStats(mockStats);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        'songs:stats',
        mockStats,
        SONG_TTL.STATS
      );
    });
  });

  describe('TTL constants', () => {
    it('should have correct TTL values', () => {
      expect(SONG_TTL.SONG).toBe(24 * 60 * 60); // 24 hours
      expect(SONG_TTL.SONG_LIST).toBe(60 * 60); // 1 hour
      expect(SONG_TTL.STATS).toBe(30 * 60); // 30 minutes
    });
  });
});
