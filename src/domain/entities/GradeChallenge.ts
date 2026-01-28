import type { GradeChallengeDetail } from './GradeChallengeDetail';

export interface GradeChallenge {
  id: number;
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  detailUrl: string | null;
  termName: string | null;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  details?: GradeChallengeDetail[];
}
