import type { GradeChallengeSectionEffectDTO } from './GradeChallengeSectionEffectDTO';
import type { SongDTO } from './SongDTO';

export interface GradeChallengeDetailDTO {
  id: number;
  gradeChallengeId: number;
  stageName: string;
  specialEffect: string | null;
  songId: number | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  song?: SongDTO | null;
  sectionEffects?: GradeChallengeSectionEffectDTO[];
}
