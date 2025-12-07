import type { Song } from '../entities/Song';

export interface SongFilterInput {
  category?: string;
  attribute?: string;
  centerCharacter?: string;
  songName?: string;
  singersContains?: string;
}

export interface SongStats {
  totalSongs: number;
  byCategory: Array<{ category: string; count: number }>;
  byAttribute: Array<{ attribute: string; count: number }>;
  byCenterCharacter: Array<{ centerCharacter: string; count: number }>;
}

export interface ISongRepository {
  findById(id: number): Promise<Song | null>;
  findBySongName(songName: string): Promise<Song | null>;
  findAll(filter?: SongFilterInput): Promise<Song[]>;
  findByIds(ids: number[]): Promise<Song[]>;
  getStats(): Promise<SongStats>;
}
