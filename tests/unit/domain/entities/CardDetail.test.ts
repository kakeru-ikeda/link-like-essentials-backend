import type { CardDetail } from '@/domain/entities/CardDetail';

describe('CardDetail Entity', () => {
  it('should create a valid card detail object', () => {
    const detail: CardDetail = {
      id: 1,
      cardId: 1,
      favoriteMode: 'ハッピー',
      acquisitionMethod: 'ガチャ',
      awakeBeforeUrl: 'https://example.com/before.jpg',
      awakeAfterUrl: 'https://example.com/after.jpg',
      awakeBeforeStorageUrl: null,
      awakeAfterStorageUrl: null,
      smileMaxLevel: '60',
      pureMaxLevel: '55',
      coolMaxLevel: '50',
      mentalMaxLevel: '45',
      specialAppealName: 'Special Appeal',
      specialAppealAp: '10',
      specialAppealEffect: 'Special Effect',
      skillName: 'Skill',
      skillAp: '5',
      skillEffect: 'Skill Effect',
      traitName: 'Trait',
      traitEffect: 'Trait Effect',
      isLocked: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(detail).toBeDefined();
    expect(detail.id).toBe(1);
    expect(detail.cardId).toBe(1);
    expect(detail.favoriteMode).toBe('ハッピー');
    expect(detail.smileMaxLevel).toBe('60');
    expect(detail.specialAppealName).toBe('Special Appeal');
  });

  it('should allow nullable fields', () => {
    const minimalDetail: CardDetail = {
      id: 1,
      cardId: 1,
      favoriteMode: null,
      acquisitionMethod: null,
      awakeBeforeUrl: null,
      awakeAfterUrl: null,
      awakeBeforeStorageUrl: null,
      awakeAfterStorageUrl: null,
      smileMaxLevel: null,
      pureMaxLevel: null,
      coolMaxLevel: null,
      mentalMaxLevel: null,
      specialAppealName: null,
      specialAppealAp: null,
      specialAppealEffect: null,
      skillName: null,
      skillAp: null,
      skillEffect: null,
      traitName: null,
      traitEffect: null,
      isLocked: null,
      createdAt: null,
      updatedAt: null,
    };

    expect(minimalDetail).toBeDefined();
    expect(minimalDetail.favoriteMode).toBeNull();
    expect(minimalDetail.smileMaxLevel).toBeNull();
    expect(minimalDetail.specialAppealName).toBeNull();
    expect(minimalDetail.skillName).toBeNull();
    expect(minimalDetail.traitName).toBeNull();
  });

  it('should support optional card field', () => {
    const detailWithCard: CardDetail = {
      id: 1,
      cardId: 1,
      favoriteMode: 'メロウ',
      acquisitionMethod: null,
      awakeBeforeUrl: null,
      awakeAfterUrl: null,
      awakeBeforeStorageUrl: null,
      awakeAfterStorageUrl: null,
      smileMaxLevel: null,
      pureMaxLevel: null,
      coolMaxLevel: null,
      mentalMaxLevel: null,
      specialAppealName: null,
      specialAppealAp: null,
      specialAppealEffect: null,
      skillName: null,
      skillAp: null,
      skillEffect: null,
      traitName: null,
      traitEffect: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      card: {
        id: 1,
        rarity: 'SR',
        limited: 'PERMANENT',
        cardName: 'Test Card',
        cardUrl: null,
        characterName: 'Test Character',
        styleType: 'PERFORMER',
        releaseDate: null,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    expect(detailWithCard.card).toBeDefined();
    expect(detailWithCard.card?.cardName).toBe('Test Card');
    expect(detailWithCard.card?.rarity).toBe('SR');
  });

  it('should support optional accessories field', () => {
    const detailWithAccessories: CardDetail = {
      id: 1,
      cardId: 1,
      favoriteMode: null,
      acquisitionMethod: null,
      awakeBeforeUrl: null,
      awakeAfterUrl: null,
      awakeBeforeStorageUrl: null,
      awakeAfterStorageUrl: null,
      smileMaxLevel: null,
      pureMaxLevel: null,
      coolMaxLevel: null,
      mentalMaxLevel: null,
      specialAppealName: null,
      specialAppealAp: null,
      specialAppealEffect: null,
      skillName: null,
      skillAp: null,
      skillEffect: null,
      traitName: null,
      traitEffect: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessories: [
        {
          id: 1,
          cardId: 1,
          parentType: 'special_appeal',
          name: 'Test Accessory',
          ap: '5',
          effect: 'Effect',
          traitName: null,
          traitEffect: null,
          displayOrder: 1,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    expect(detailWithAccessories.accessories).toBeDefined();
    expect(detailWithAccessories.accessories?.length).toBe(1);
    expect(detailWithAccessories.accessories?.[0]?.name).toBe('Test Accessory');
  });

  it('should support all favoriteMode values', () => {
    const favoriteModes = ['ハッピー', 'メロウ', 'ニュートラル', '--'];

    favoriteModes.forEach((mode) => {
      const detail: CardDetail = {
        id: 1,
        cardId: 1,
        favoriteMode: mode,
        acquisitionMethod: null,
        awakeBeforeUrl: null,
        awakeAfterUrl: null,
        awakeBeforeStorageUrl: null,
        awakeAfterStorageUrl: null,
        smileMaxLevel: null,
        pureMaxLevel: null,
        coolMaxLevel: null,
        mentalMaxLevel: null,
        specialAppealName: null,
        specialAppealAp: null,
        specialAppealEffect: null,
        skillName: null,
        skillAp: null,
        skillEffect: null,
        traitName: null,
        traitEffect: null,
        isLocked: null,
        createdAt: null,
        updatedAt: null,
      };

      expect(detail.favoriteMode).toBe(mode);
    });
  });
});
