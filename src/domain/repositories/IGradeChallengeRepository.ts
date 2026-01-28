import type { GradeChallenge } from '../entities/GradeChallenge';

export interface GradeChallengeFilterInput {
  termName?: string;
  title?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  hasSongWithDeckType?: string;
}

export interface GradeChallengeStats {
  totalEvents: number;
  byTermName: Array<{ termName: string; count: number }>;
}

export interface IGradeChallengeRepository {
  findById(id: number): Promise<GradeChallenge | null>;
  findByTitle(title: string): Promise<GradeChallenge | null>;
  findAll(filter?: GradeChallengeFilterInput): Promise<GradeChallenge[]>;
  findOngoing(): Promise<GradeChallenge[]>;
  getStats(): Promise<GradeChallengeStats>;
}
