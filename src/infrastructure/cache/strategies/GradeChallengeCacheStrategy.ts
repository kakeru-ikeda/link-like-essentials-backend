import type { GradeChallenge } from '@/domain/entities/GradeChallenge';

import type { CacheService } from '../CacheService';

export const GRADE_CHALLENGE_TTL = {
  GRADE_CHALLENGE: 24 * 60 * 60,
  GRADE_CHALLENGE_LIST: 60 * 60,
  STATS: 30 * 60,
} as const;

export class GradeChallengeCacheStrategy {
  constructor(private readonly cache: CacheService) {}

  async getGradeChallenge(id: number): Promise<GradeChallenge | null> {
    return await this.cache.get<GradeChallenge>(`gradeChallenge:${id}`);
  }

  async setGradeChallenge(gradeChallenge: GradeChallenge): Promise<void> {
    await this.cache.set(
      `gradeChallenge:${gradeChallenge.id}`,
      gradeChallenge,
      GRADE_CHALLENGE_TTL.GRADE_CHALLENGE
    );
  }

  async getGradeChallengeByTitle(
    title: string
  ): Promise<GradeChallenge | null> {
    const key = `gradeChallenge:title:${title}`;
    return await this.cache.get<GradeChallenge>(key);
  }

  async setGradeChallengeByTitle(
    gradeChallenge: GradeChallenge
  ): Promise<void> {
    const key = `gradeChallenge:title:${gradeChallenge.title}`;
    await this.cache.set(
      key,
      gradeChallenge,
      GRADE_CHALLENGE_TTL.GRADE_CHALLENGE
    );
  }

  async getGradeChallengeList(
    filterHash: string
  ): Promise<GradeChallenge[] | null> {
    return await this.cache.get<GradeChallenge[]>(
      `gradeChallenge:list:${filterHash}`
    );
  }

  async setGradeChallengeList(
    filterHash: string,
    gradeChallengeList: GradeChallenge[]
  ): Promise<void> {
    await this.cache.set(
      `gradeChallenge:list:${filterHash}`,
      gradeChallengeList,
      GRADE_CHALLENGE_TTL.GRADE_CHALLENGE_LIST
    );
  }

  async invalidateGradeChallenge(id: number): Promise<void> {
    await this.cache.del(`gradeChallenge:${id}`);
    await this.cache.invalidatePattern('gradeChallenge:list:*');
  }

  async invalidateAllGradeChallenges(): Promise<void> {
    await this.cache.invalidatePattern('gradeChallenge:*');
  }

  async getStats<T>(): Promise<T | null> {
    return await this.cache.get<T>('gradeChallenge:stats');
  }

  async setStats<T>(stats: T): Promise<void> {
    await this.cache.set(
      'gradeChallenge:stats',
      stats,
      GRADE_CHALLENGE_TTL.STATS
    );
  }
}
