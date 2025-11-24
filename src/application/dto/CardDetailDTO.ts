import type { CardDetail } from '@/domain/entities/CardDetail';
import type { Stats, Skill, Trait } from '@/domain/valueObjects/Stats';

export interface CardDetailResult extends CardDetail {
    stats: Stats;
    specialAppeal: Skill | null;
    skill: Skill | null;
    trait: Trait | null;
}
