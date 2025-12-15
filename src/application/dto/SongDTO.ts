import type { SongMoodProgressionDTO } from './SongMoodProgressionDTO';

export interface SongDTO {
  id: number;
  songName: string;
  songUrl: string | null;
  category: string;
  attribute: string;
  centerCharacter: string;
  singers: string;
  participations: string | null;
  liveAnalyzerImageUrl: string | null;
  jacketImageUrl: string | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  moodProgressions?: SongMoodProgressionDTO[];
}

export interface SongFilterInput {
  category?: string;
  attribute?: string;
  centerCharacter?: string;
  songName?: string;
  singersContains?: string;
}

export interface SongStatsResult {
  totalSongs: number;
  byCategory: Array<{ category: string; count: number }>;
  byAttribute: Array<{ attribute: string; count: number }>;
  byCenterCharacter: Array<{ centerCharacter: string; count: number }>;
}
