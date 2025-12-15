import type { SongMoodProgression } from './SongMoodProgression';

export interface Song {
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
  moodProgressions?: SongMoodProgression[];
}
