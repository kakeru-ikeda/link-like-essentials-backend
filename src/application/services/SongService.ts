import crypto from 'crypto';

import type { Song } from '@/domain/entities/Song';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ISongRepository } from '@/domain/repositories/ISongRepository';
import type { SongCacheStrategy } from '@/infrastructure/cache/strategies/SongCacheStrategy';

import type { SongFilterInput, SongStatsResult } from '../dto/SongDTO';

export class SongService {
  constructor(
    private readonly songRepository: ISongRepository,
    private readonly cacheStrategy: SongCacheStrategy
  ) {}

  async findById(id: number): Promise<Song> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getSong(id);
    if (cached) {
      return cached;
    }

    // DBから取得
    const song = await this.songRepository.findById(id);
    if (!song) {
      throw new NotFoundError(`Song with id ${id} not found`);
    }

    // キャッシュに保存
    await this.cacheStrategy.setSong(song);

    return song;
  }

  async findBySongName(songName: string): Promise<Song | null> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getSongByName(songName);
    if (cached) {
      return cached;
    }

    // DBから取得
    const song = await this.songRepository.findBySongName(songName);

    // キャッシュに保存
    if (song) {
      await this.cacheStrategy.setSongByName(song);
    }

    return song;
  }

  async findAll(filter?: SongFilterInput): Promise<Song[]> {
    // フィルター条件からハッシュを生成
    const filterHash = this.generateFilterHash(filter);

    // キャッシュチェック
    const cached = await this.cacheStrategy.getSongList(filterHash);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    // DBから取得
    const songs = await this.songRepository.findAll(filter);

    // キャッシュに保存
    await this.cacheStrategy.setSongList(filterHash, songs);

    return songs;
  }

  async getStats(): Promise<SongStatsResult> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getStats<SongStatsResult>();
    if (cached) {
      return cached;
    }

    // DBから取得
    const stats = await this.songRepository.getStats();

    const result: SongStatsResult = {
      totalSongs: stats.totalSongs,
      byCategory: stats.byCategory,
      byAttribute: stats.byAttribute,
      byCenterCharacter: stats.byCenterCharacter,
    };

    // キャッシュに保存
    await this.cacheStrategy.setStats<SongStatsResult>(result);

    return result;
  }

  private generateFilterHash(filter?: SongFilterInput): string {
    const data = JSON.stringify({ filter });
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
