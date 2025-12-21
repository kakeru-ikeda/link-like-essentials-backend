import type { LiveGrandPrixSectionEffect } from './LiveGrandPrixSectionEffect';
import type { Song } from './Song';

export interface LiveGrandPrixDetail {
  id: number;
  liveGrandPrixId: number;
  stageName: string;
  specialEffect: string | null;
  songId: number | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  song?: Song | null;
  sectionEffects?: LiveGrandPrixSectionEffect[];
}
