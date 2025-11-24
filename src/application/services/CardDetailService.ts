import type { CardDetail } from '@/domain/entities/CardDetail';
import { NotFoundError } from '@/domain/errors/AppError';
import type { ICardDetailRepository } from '@/domain/repositories/ICardDetailRepository';
import type { Stats, Skill, Trait } from '@/domain/valueObjects/Stats';
import type { DetailCacheStrategy } from '@/infrastructure/cache/strategies/DetailCacheStrategy';

export class CardDetailService {
  constructor(
    private readonly detailRepository: ICardDetailRepository,
    private readonly cacheStrategy: DetailCacheStrategy
  ) {}

  async findByCardId(cardId: number): Promise<CardDetail> {
    // キャッシュチェック
    const cached = await this.cacheStrategy.getDetail(cardId);
    if (cached) {
      return cached;
    }

    // DBから取得
    const detail = await this.detailRepository.findByCardId(cardId);
    if (!detail) {
      throw new NotFoundError(`CardDetail for cardId ${cardId} not found`);
    }

    // キャッシュに保存
    await this.cacheStrategy.setDetail(detail);

    return detail;
  }

  buildStats(detail: CardDetail): Stats {
    return {
      smile: this.parseIntOrNull(detail.smileMaxLevel),
      pure: this.parseIntOrNull(detail.pureMaxLevel),
      cool: this.parseIntOrNull(detail.coolMaxLevel),
      mental: this.parseIntOrNull(detail.mentalMaxLevel),
    };
  }

  buildSpecialAppeal(detail: CardDetail): Skill | null {
    if (!detail.specialAppealName) return null;

    return {
      name: detail.specialAppealName,
      ap: detail.specialAppealAp,
      effect: detail.specialAppealEffect,
    };
  }

  buildSkill(detail: CardDetail): Skill | null {
    if (!detail.skillName) return null;

    return {
      name: detail.skillName,
      ap: detail.skillAp,
      effect: detail.skillEffect,
    };
  }

  buildTrait(detail: CardDetail): Trait | null {
    if (!detail.traitName) return null;

    return {
      name: detail.traitName,
      effect: detail.traitEffect,
    };
  }

  private parseIntOrNull(value: string | null): number | null {
    if (!value) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }
}
