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
  });
});
