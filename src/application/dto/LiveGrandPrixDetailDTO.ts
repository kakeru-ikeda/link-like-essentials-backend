import type { LiveGrandPrixSectionEffectDTO } from './LiveGrandPrixSectionEffectDTO';
import type { SongDTO } from './SongDTO';

export interface LiveGrandPrixDetailDTO {
  id: number;
  liveGrandPrixId: number;
  stageName: string;
  specialEffect: string | null;
  songId: number | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  song?: SongDTO | null;
  sectionEffects?: LiveGrandPrixSectionEffectDTO[];
}
