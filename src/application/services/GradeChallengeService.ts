import crypto from 'crypto';

import type { GradeChallenge } from '@/domain/entities/GradeChallenge';
import { NotFoundError } from '@/domain/errors/AppError';
import type { IGradeChallengeRepository } from '@/domain/repositories/IGradeChallengeRepository';
import type { GradeChallengeCacheStrategy } from '@/infrastructure/cache/strategies/GradeChallengeCacheStrategy';

import type {
  GradeChallengeFilterInput,
  GradeChallengeStatsResult,
} from '../dto/GradeChallengeDTO';

export class GradeChallengeService {
  constructor(
    private readonly gradeChallengeRepository: IGradeChallengeRepository,
    private readonly cacheStrategy: GradeChallengeCacheStrategy
  ) {}

  async findById(id: number): Promise<GradeChallenge> {
    const cached = await this.cacheStrategy.getGradeChallenge(id);
    if (cached) {
      return cached;
    }

    const gradeChallenge = await this.gradeChallengeRepository.findById(id);
    if (!gradeChallenge) {
      throw new NotFoundError(`GradeChallenge with id ${id} not found`);
    }

    await this.cacheStrategy.setGradeChallenge(gradeChallenge);

    return gradeChallenge;
  }

  async findByTitle(title: string): Promise<GradeChallenge | null> {
    const cached = await this.cacheStrategy.getGradeChallengeByTitle(title);
    if (cached) {
      return cached;
    }

    const gradeChallenge =
      await this.gradeChallengeRepository.findByTitle(title);

    if (gradeChallenge) {
      await this.cacheStrategy.setGradeChallengeByTitle(gradeChallenge);
    }

    return gradeChallenge;
  }

  async findAll(filter?: GradeChallengeFilterInput): Promise<GradeChallenge[]> {
    const filterHash = this.generateFilterHash(filter);

    const cached = await this.cacheStrategy.getGradeChallengeList(filterHash);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    const gradeChallenges = await this.gradeChallengeRepository.findAll(filter);

    await this.cacheStrategy.setGradeChallengeList(filterHash, gradeChallenges);

    return gradeChallenges;
  }

  async findOngoing(): Promise<GradeChallenge[]> {
    const cacheKey = 'ongoing';

    const cached = await this.cacheStrategy.getGradeChallengeList(cacheKey);
    if (cached && Array.isArray(cached)) {
      return cached;
    }

    const ongoingEvents = await this.gradeChallengeRepository.findOngoing();

    await this.cacheStrategy.setGradeChallengeList(cacheKey, ongoingEvents);

    return ongoingEvents;
  }

  async getStats(): Promise<GradeChallengeStatsResult> {
    const cached =
      await this.cacheStrategy.getStats<GradeChallengeStatsResult>();
    if (cached) {
      return cached;
    }

    const stats = await this.gradeChallengeRepository.getStats();

    const result: GradeChallengeStatsResult = {
      totalEvents: stats.totalEvents,
      byTermName: stats.byTermName,
    };

    await this.cacheStrategy.setStats<GradeChallengeStatsResult>(result);

    return result;
  }

  private generateFilterHash(filter?: GradeChallengeFilterInput): string {
    const data = JSON.stringify({ filter });
    return crypto.createHash('md5').update(data).digest('hex');
  }
}
