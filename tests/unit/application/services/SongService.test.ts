import { SongService } from '@/application/services/SongService';
import type { Song } from '@/domain/entities/Song';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ISongRepository } from '@/domain/repositories/ISongRepository';
import type { SongCacheStrategy } from '@/infrastructure/cache/strategies/SongCacheStrategy';

describe('SongService', () => {
  let songService: SongService;
  let mockRepository: jest.Mocked<ISongRepository>;
  let mockCacheStrategy: jest.Mocked<SongCacheStrategy>;

  const mockSong: Song = {
    id: 1,
    songName: 'Test Song',
    songUrl: 'https://example.com/song',
    category: '103期',
    attribute: 'クール',
    centerCharacter: 'Test Character',
    singers: 'Singer1,Singer2',
    liveAnalyzerImageUrl: 'https://example.com/live.png',
    jacketImageUrl: 'https://example.com/jacket.png',
    isLocked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    moodProgressions: [
      {
        id: 1,
        songId: 1,
        section: '1',
        progression: '0 → +50',
        sectionOrder: 1,
        isLocked: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
  };

  beforeEach(() => {
    // モックリポジトリの作成
    mockRepository = {
      findById: jest.fn(),
      findBySongName: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
      getStats: jest.fn(),
    } as unknown as jest.Mocked<ISongRepository>;

    // モックキャッシュの作成
    mockCacheStrategy = {
      getSong: jest.fn(),
      setSong: jest.fn(),
      getSongByName: jest.fn(),
      setSongByName: jest.fn(),
      getSongList: jest.fn(),
      setSongList: jest.fn(),
      getStats: jest.fn(),
      setStats: jest.fn(),
    } as unknown as jest.Mocked<SongCacheStrategy>;

    songService = new SongService(mockRepository, mockCacheStrategy);
  });

  describe('findById', () => {
    it('should return song from cache if available', async () => {
      mockCacheStrategy.getSong.mockResolvedValue(mockSong);

      const result = await songService.findById(1);

      expect(result).toEqual(mockSong);
      expect(mockCacheStrategy.getSong).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      mockCacheStrategy.getSong.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockSong);

      const result = await songService.findById(1);

      expect(result).toEqual(mockSong);
      expect(mockCacheStrategy.getSong).toHaveBeenCalledWith(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockCacheStrategy.setSong).toHaveBeenCalledWith(mockSong);
    });

    it('should throw NotFoundError if song does not exist', async () => {
      mockCacheStrategy.getSong.mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      await expect(songService.findById(999)).rejects.toThrow(NotFoundError);
      await expect(songService.findById(999)).rejects.toThrow(
        'Song with id 999 not found'
      );
    });
  });

  describe('findBySongName', () => {
    it('should return song from cache if available', async () => {
      mockCacheStrategy.getSongByName.mockResolvedValue(mockSong);

      const result = await songService.findBySongName('Test Song');

      expect(result).toEqual(mockSong);
      expect(mockCacheStrategy.getSongByName).toHaveBeenCalledWith('Test Song');
      expect(mockRepository.findBySongName).not.toHaveBeenCalled();
    });

    it('should fetch from repository if not in cache', async () => {
      mockCacheStrategy.getSongByName.mockResolvedValue(null);
      mockRepository.findBySongName.mockResolvedValue(mockSong);

      const result = await songService.findBySongName('Test Song');

      expect(result).toEqual(mockSong);
      expect(mockRepository.findBySongName).toHaveBeenCalledWith('Test Song');
      expect(mockCacheStrategy.setSongByName).toHaveBeenCalledWith(mockSong);
    });

    it('should return null if song does not exist', async () => {
      mockCacheStrategy.getSongByName.mockResolvedValue(null);
      mockRepository.findBySongName.mockResolvedValue(null);

      const result = await songService.findBySongName('Unknown Song');

      expect(result).toBeNull();
    });
  });

  describe('getStats', () => {
    it('should return song statistics from cache if available', async () => {
      const mockStats = {
        totalSongs: 210,
        byCategory: [
          { category: '103期', count: 81 },
          { category: '104期', count: 77 },
          { category: '105期', count: 49 },
        ],
        byAttribute: [
          { attribute: 'クール', count: 68 },
          { attribute: 'スマイル', count: 70 },
          { attribute: 'ピュア', count: 72 },
        ],
        byCenterCharacter: [
          { centerCharacter: '日野下花帆', count: 28 },
          { centerCharacter: '村野さやか', count: 28 },
        ],
      };

      mockCacheStrategy.getStats.mockResolvedValue(mockStats);

      const result = await songService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const mockStats = {
        totalSongs: 210,
        byCategory: [{ category: '103期', count: 81 }],
        byAttribute: [{ attribute: 'クール', count: 68 }],
        byCenterCharacter: [{ centerCharacter: '日野下花帆', count: 28 }],
      };

      mockCacheStrategy.getStats.mockResolvedValue(null);
      mockRepository.getStats.mockResolvedValue(mockStats);

      const result = await songService.getStats();

      expect(result).toEqual(mockStats);
      expect(mockCacheStrategy.getStats).toHaveBeenCalled();
      expect(mockRepository.getStats).toHaveBeenCalled();
      expect(mockCacheStrategy.setStats).toHaveBeenCalledWith(mockStats);
    });
  });

  describe('findAll', () => {
    it('should return songs from cache if available', async () => {
      const mockSongs = [mockSong];
      mockCacheStrategy.getSongList.mockResolvedValue(mockSongs);

      const result = await songService.findAll();

      expect(result).toEqual(mockSongs);
      expect(mockCacheStrategy.getSongList).toHaveBeenCalled();
      expect(mockRepository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const mockSongs = [mockSong];
      mockCacheStrategy.getSongList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockSongs);

      const result = await songService.findAll();

      expect(result).toEqual(mockSongs);
      expect(mockCacheStrategy.getSongList).toHaveBeenCalled();
      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(mockCacheStrategy.setSongList).toHaveBeenCalled();
    });

    it('should fetch from repository with filter if cache returns non-array', async () => {
      const mockSongs = [mockSong];
      mockCacheStrategy.getSongList.mockResolvedValue({} as unknown as null);
      mockRepository.findAll.mockResolvedValue(mockSongs);

      const filter = { category: '103期' };
      const result = await songService.findAll(filter);

      expect(result).toEqual(mockSongs);
      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should pass filter to repository', async () => {
      const mockSongs = [mockSong];
      const filter = {
        category: '103期',
        attribute: 'クール',
        singersContains: 'Singer1',
      };
      mockCacheStrategy.getSongList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue(mockSongs);

      await songService.findAll(filter);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should generate consistent hash for same filter', async () => {
      mockCacheStrategy.getSongList.mockResolvedValue(null);
      mockRepository.findAll.mockResolvedValue([]);

      const filter = { category: '103期' };
      await songService.findAll(filter);
      const firstCall = mockCacheStrategy.getSongList.mock.calls[0]?.[0];

      await songService.findAll(filter);
      const secondCall = mockCacheStrategy.getSongList.mock.calls[1]?.[0];

      expect(firstCall).toBe(secondCall);
    });
  });
});
