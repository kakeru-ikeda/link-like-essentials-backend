import type { GradeChallengeSectionEffect } from './GradeChallengeSectionEffect';
import type { Song } from './Song';

export interface GradeChallengeDetail {
  id: number;
  gradeChallengeId: number;
  stageName: string;
  specialEffect: string | null;
  songId: number | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  song?: Song | null;
  sectionEffects?: GradeChallengeSectionEffect[];
}
