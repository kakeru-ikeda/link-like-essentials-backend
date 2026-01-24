import type { IRedisClient } from '@/infrastructure/cache/CacheService';
import { CacheService } from '@/infrastructure/cache/CacheService';

describe('CacheService', () => {
  let cacheService: CacheService;
  let mockRedis: jest.Mocked<IRedisClient>;

  beforeEach(() => {
    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      keys: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
    } as unknown as jest.Mocked<IRedisClient>;

    cacheService = new CacheService(mockRedis);
  });

  describe('get', () => {
    it('should return parsed data when key exists', async () => {
      const mockData = { id: 1, name: 'test' };
      mockRedis.get.mockResolvedValue(JSON.stringify(mockData));

      const result = await cacheService.get<typeof mockData>('test-key');

      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('non-existent-key');

      expect(result).toBeNull();
    });

    it('should return null on Error', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.get('error-key');

      expect(result).toBeNull();
    });

    it('should return null on non-Error thrown value', async () => {
      mockRedis.get.mockRejectedValue('string error');

      const result = await cacheService.get('error-key');

      expect(result).toBeNull();
    });

    it('should return object directly when redis returns non-string', async () => {
      const mockData = { id: 2, name: 'direct-object' };
      mockRedis.get.mockResolvedValue(mockData as unknown as string);

      const result = await cacheService.get<typeof mockData>('object-key');

      expect(result).toEqual(mockData);
      expect(mockRedis.get).toHaveBeenCalledWith('object-key');
    });
  });

  describe('set', () => {
    it('should set value with TTL when provided', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set('key', { data: 'value' }, 3600);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ data: 'value' }),
        { ex: 3600 }
      );
    });

    it('should set value without TTL when not provided', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set('key', { data: 'value' });

      expect(mockRedis.set).toHaveBeenCalledWith(
        'key',
        JSON.stringify({ data: 'value' })
      );
    });

    it('should handle Error gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      // Should not throw
      await expect(cacheService.set('key', 'value')).resolves.toBeUndefined();
    });

    it('should handle non-Error thrown value gracefully', async () => {
      mockRedis.set.mockRejectedValue('string error');

      await expect(cacheService.set('key', 'value')).resolves.toBeUndefined();
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await cacheService.del('key-to-delete');

      expect(mockRedis.del).toHaveBeenCalledWith('key-to-delete');
    });

    it('should handle Error gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      await expect(cacheService.del('key')).resolves.toBeUndefined();
    });

    it('should handle non-Error thrown value gracefully', async () => {
      mockRedis.del.mockRejectedValue('string error');

      await expect(cacheService.del('key')).resolves.toBeUndefined();
    });
  });

  describe('invalidatePattern', () => {
    it('should delete keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      await cacheService.invalidatePattern('card:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('card:*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
    });

    it('should not call del when no keys match', async () => {
      mockRedis.keys.mockResolvedValue([]);

      await cacheService.invalidatePattern('no-match:*');

      expect(mockRedis.keys).toHaveBeenCalledWith('no-match:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should handle Error gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      await expect(
        cacheService.invalidatePattern('error:*')
      ).resolves.toBeUndefined();
    });

    it('should handle non-Error thrown value gracefully', async () => {
      mockRedis.keys.mockRejectedValue('string error');

      await expect(
        cacheService.invalidatePattern('error:*')
      ).resolves.toBeUndefined();
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await cacheService.exists('existing-key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('existing-key');
    });

    it('should return false when key does not exist', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await cacheService.exists('non-existent-key');

      expect(result).toBe(false);
    });

    it('should return false on Error', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.exists('error-key');

      expect(result).toBe(false);
    });

    it('should return false on non-Error thrown value', async () => {
      mockRedis.exists.mockRejectedValue('string error');

      const result = await cacheService.exists('error-key');

      expect(result).toBe(false);
    });
  });

  describe('ttl', () => {
    it('should return TTL value', async () => {
      mockRedis.ttl.mockResolvedValue(3600);

      const result = await cacheService.ttl('key-with-ttl');

      expect(result).toBe(3600);
      expect(mockRedis.ttl).toHaveBeenCalledWith('key-with-ttl');
    });

    it('should return -1 on Error', async () => {
      mockRedis.ttl.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.ttl('error-key');

      expect(result).toBe(-1);
    });

    it('should return -1 on non-Error thrown value', async () => {
      mockRedis.ttl.mockRejectedValue('string error');

      const result = await cacheService.ttl('error-key');

      expect(result).toBe(-1);
    });
  });
});
