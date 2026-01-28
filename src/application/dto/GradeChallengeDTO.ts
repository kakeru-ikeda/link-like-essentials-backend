import type { GradeChallengeDetailDTO } from './GradeChallengeDetailDTO';

export interface GradeChallengeDTO {
  id: number;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  detailUrl: string | null;
  termName: string | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  details?: GradeChallengeDetailDTO[];
}

export interface GradeChallengeFilterInput {
  termName?: string;
  title?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  hasSongWithDeckType?: string;
}

export interface GradeChallengeStatsResult {
  totalEvents: number;
  byTermName: Array<{ termName: string; count: number }>;
}
