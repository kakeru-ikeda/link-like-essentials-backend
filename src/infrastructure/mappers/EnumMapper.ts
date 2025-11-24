import { FavoriteMode } from '@/domain/valueObjects/FavoriteMode';
import { LimitedType } from '@/domain/valueObjects/LimitedType';
import { ParentType } from '@/domain/valueObjects/ParentType';
import { StyleType } from '@/domain/valueObjects/StyleType';

export class EnumMapper {
  // LimitedTypeのマッピング (日本語 → GraphQL ENUM)
  static toLimitedTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      恒常: 'PERMANENT',
      限定: 'LIMITED',
      春限定: 'SPRING_LIMITED',
      夏限定: 'SUMMER_LIMITED',
      秋限定: 'AUTUMN_LIMITED',
      冬限定: 'WINTER_LIMITED',
      誕限定: 'BIRTHDAY_LIMITED',
      LEG限定: 'LEG_LIMITED',
      撃限定: 'BATTLE_LIMITED',
      宴限定: 'PARTY_LIMITED',
      活限定: 'ACTIVITY_LIMITED',
      卒限定: 'GRADUATE_LIMITED',
      ログボ: 'LOGIN_BONUS',
      報酬: 'REWARD',
    };

    return mapping[value] || null;
  }

  // StyleTypeのマッピング (日本語 → GraphQL ENUM)
  static toStyleTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      チアリーダー: 'CHEERLEADER',
      トリックスター: 'TRICKSTER',
      パフォーマー: 'PERFORMER',
      ムードメーカー: 'MOODMAKER',
      ムードーメーカー: 'MOODOMAKER', // 誤字版も対応
    };

    return mapping[value] || null;
  }

  // FavoriteModeのマッピング (日本語 → GraphQL ENUM)
  static toFavoriteModeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      ハッピー: 'HAPPY',
      メロウ: 'MELLOW',
      ニュートラル: 'NEUTRAL',
      '--': 'NONE',
    };

    return mapping[value] || null;
  }

  // ParentTypeのマッピング
  static toParentTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const mapping: Record<string, string> = {
      special_appeal: 'SPECIAL_APPEAL',
      skill: 'SKILL',
      trait: 'TRAIT',
    };

    return mapping[value] || null;
  }

  // 逆マッピング: GraphQL ENUM → 日本語 (必要に応じて)
  static fromLimitedTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const reverseMapping: Record<string, string> = Object.entries(
      LimitedType
    ).reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, string>
    );

    return reverseMapping[value] || null;
  }

  static fromStyleTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const reverseMapping: Record<string, string> = Object.entries(
      StyleType
    ).reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, string>
    );

    return reverseMapping[value] || null;
  }

  static fromFavoriteModeEnum(value: string | null): string | null {
    if (!value) return null;

    const reverseMapping: Record<string, string> = Object.entries(
      FavoriteMode
    ).reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, string>
    );

    return reverseMapping[value] || null;
  }

  static fromParentTypeEnum(value: string | null): string | null {
    if (!value) return null;

    const reverseMapping: Record<string, string> = Object.entries(
      ParentType
    ).reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {} as Record<string, string>
    );

    return reverseMapping[value] || null;
  }
}
