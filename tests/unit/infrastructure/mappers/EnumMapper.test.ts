import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';

describe('EnumMapper', () => {
  describe('toLimitedTypeEnum', () => {
    it('should map Japanese to English enum values', () => {
      expect(EnumMapper.toLimitedTypeEnum('恒常')).toBe('PERMANENT');
      expect(EnumMapper.toLimitedTypeEnum('限定')).toBe('LIMITED');
      expect(EnumMapper.toLimitedTypeEnum('春限定')).toBe('SPRING_LIMITED');
      expect(EnumMapper.toLimitedTypeEnum('ログボ')).toBe('LOGIN_BONUS');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.toLimitedTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.toLimitedTypeEnum('unknown')).toBeNull();
    });
  });

  describe('toStyleTypeEnum', () => {
    it('should map Japanese to English enum values', () => {
      expect(EnumMapper.toStyleTypeEnum('チアリーダー')).toBe('CHEERLEADER');
      expect(EnumMapper.toStyleTypeEnum('トリックスター')).toBe('TRICKSTER');
      expect(EnumMapper.toStyleTypeEnum('パフォーマー')).toBe('PERFORMER');
      expect(EnumMapper.toStyleTypeEnum('ムードメーカー')).toBe('MOODMAKER');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.toStyleTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.toStyleTypeEnum('unknown')).toBeNull();
    });
  });

  describe('toFavoriteModeEnum', () => {
    it('should map Japanese to English enum values', () => {
      expect(EnumMapper.toFavoriteModeEnum('ハッピー')).toBe('HAPPY');
      expect(EnumMapper.toFavoriteModeEnum('メロウ')).toBe('MELLOW');
      expect(EnumMapper.toFavoriteModeEnum('ニュートラル')).toBe('NEUTRAL');
      expect(EnumMapper.toFavoriteModeEnum('--')).toBe('NONE');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.toFavoriteModeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.toFavoriteModeEnum('unknown')).toBeNull();
    });
  });

  describe('toParentTypeEnum', () => {
    it('should map parent type values', () => {
      expect(EnumMapper.toParentTypeEnum('special_appeal')).toBe(
        'SPECIAL_APPEAL'
      );
      expect(EnumMapper.toParentTypeEnum('skill')).toBe('SKILL');
      expect(EnumMapper.toParentTypeEnum('trait')).toBe('TRAIT');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.toParentTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.toParentTypeEnum('unknown')).toBeNull();
    });
  });

  // Reverse mapping tests
  describe('fromLimitedTypeEnum', () => {
    it('should map English enum to Japanese values', () => {
      expect(EnumMapper.fromLimitedTypeEnum('PERMANENT')).toBe('恒常');
      expect(EnumMapper.fromLimitedTypeEnum('LIMITED')).toBe('限定');
      expect(EnumMapper.fromLimitedTypeEnum('SPRING_LIMITED')).toBe('春限定');
      expect(EnumMapper.fromLimitedTypeEnum('SUMMER_LIMITED')).toBe('夏限定');
      expect(EnumMapper.fromLimitedTypeEnum('AUTUMN_LIMITED')).toBe('秋限定');
      expect(EnumMapper.fromLimitedTypeEnum('WINTER_LIMITED')).toBe('冬限定');
      expect(EnumMapper.fromLimitedTypeEnum('BIRTHDAY_LIMITED')).toBe('誕限定');
      expect(EnumMapper.fromLimitedTypeEnum('LEG_LIMITED')).toBe('LEG限定');
      expect(EnumMapper.fromLimitedTypeEnum('BATTLE_LIMITED')).toBe('撃限定');
      expect(EnumMapper.fromLimitedTypeEnum('PARTY_LIMITED')).toBe('宴限定');
      expect(EnumMapper.fromLimitedTypeEnum('ACTIVITY_LIMITED')).toBe('活限定');
      expect(EnumMapper.fromLimitedTypeEnum('BANGDREAM_LIMITED')).toBe('団限定');
      expect(EnumMapper.fromLimitedTypeEnum('GRADUATE_LIMITED')).toBe('卒限定');
      expect(EnumMapper.fromLimitedTypeEnum('LOGIN_BONUS')).toBe('ログボ');
      expect(EnumMapper.fromLimitedTypeEnum('REWARD')).toBe('報酬');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.fromLimitedTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.fromLimitedTypeEnum('UNKNOWN')).toBeNull();
    });
  });

  describe('fromStyleTypeEnum', () => {
    it('should map English enum to Japanese values', () => {
      expect(EnumMapper.fromStyleTypeEnum('CHEERLEADER')).toBe('チアリーダー');
      expect(EnumMapper.fromStyleTypeEnum('TRICKSTER')).toBe('トリックスター');
      expect(EnumMapper.fromStyleTypeEnum('PERFORMER')).toBe('パフォーマー');
      expect(EnumMapper.fromStyleTypeEnum('MOODMAKER')).toBe('ムードメーカー');
      expect(EnumMapper.fromStyleTypeEnum('MOODOMAKER')).toBe('ムードーメーカー');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.fromStyleTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.fromStyleTypeEnum('UNKNOWN')).toBeNull();
    });
  });

  describe('fromFavoriteModeEnum', () => {
    it('should map English enum to Japanese values', () => {
      expect(EnumMapper.fromFavoriteModeEnum('HAPPY')).toBe('ハッピー');
      expect(EnumMapper.fromFavoriteModeEnum('MELLOW')).toBe('メロウ');
      expect(EnumMapper.fromFavoriteModeEnum('NEUTRAL')).toBe('ニュートラル');
      expect(EnumMapper.fromFavoriteModeEnum('NONE')).toBe('--');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.fromFavoriteModeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.fromFavoriteModeEnum('UNKNOWN')).toBeNull();
    });
  });

  describe('fromParentTypeEnum', () => {
    it('should map English enum to original values', () => {
      expect(EnumMapper.fromParentTypeEnum('SPECIAL_APPEAL')).toBe(
        'special_appeal'
      );
      expect(EnumMapper.fromParentTypeEnum('SKILL')).toBe('skill');
      expect(EnumMapper.fromParentTypeEnum('TRAIT')).toBe('trait');
    });

    it('should return null for null input', () => {
      expect(EnumMapper.fromParentTypeEnum(null)).toBeNull();
    });

    it('should return null for unknown values', () => {
      expect(EnumMapper.fromParentTypeEnum('UNKNOWN')).toBeNull();
    });
  });
});
