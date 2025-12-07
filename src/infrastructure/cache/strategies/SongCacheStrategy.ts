import type { Song } from '@/domain/entities/Song';

import type { CacheService } from '../CacheService';

export const SONG_TTL = {
  SONG: 24 * 60 * 60, // 24時間
  SONG_LIST: 60 * 60, // 1時間
  STATS: 30 * 60, // 30分
} as const;

export class SongCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getSong(id: number): Promise<Song | null> {
    return await this.cache.get<Song>(`song:${id}`);
  }

  async setSong(song: Song): Promise<void> {
    await this.cache.set(`song:${song.id}`, song, SONG_TTL.SONG);
  }

  async getSongByName(songName: string): Promise<Song | null> {
    const key = `song:name:${songName}`;
    return await this.cache.get<Song>(key);
  }

  async setSongByName(song: Song): Promise<void> {
    const key = `song:name:${song.songName}`;
    await this.cache.set(key, song, SONG_TTL.SONG);
  }

  async getSongList(filterHash: string): Promise<Song[] | null> {
    return await this.cache.get<Song[]>(`songs:list:${filterHash}`);
  }

  async setSongList(filterHash: string, songs: Song[]): Promise<void> {
    await this.cache.set(`songs:list:${filterHash}`, songs, SONG_TTL.SONG_LIST);
  }

  async invalidateSong(id: number): Promise<void> {
    await this.cache.del(`song:${id}`);
    // 一覧キャッシュも無効化
    await this.cache.invalidatePattern('songs:list:*');
  }

  async invalidateAllSongs(): Promise<void> {
    await this.cache.invalidatePattern('song:*');
    await this.cache.invalidatePattern('songs:*');
  }

  async getStats<T>(): Promise<T | null> {
    return await this.cache.get<T>('songs:stats');
  }

  async setStats<T>(stats: T): Promise<void> {
    await this.cache.set('songs:stats', stats, SONG_TTL.STATS);
  }
}
