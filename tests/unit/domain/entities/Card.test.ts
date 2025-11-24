import type { Card } from '@/domain/entities/Card';
import { Rarity } from '@/domain/valueObjects/Rarity';

describe('Card Entity', () => {
  it('should create a valid card object', () => {
    const card: Card = {
      id: 1,
      rarity: Rarity.UR,
      limited: 'LIMITED',
      cardName: 'Test Card',
      cardUrl: 'https://example.com/card.jpg',
      characterName: 'Test Character',
      styleType: 'CHEERLEADER',
      isLocked: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(card).toBeDefined();
    expect(card.id).toBe(1);
    expect(card.cardName).toBe('Test Card');
    expect(card.characterName).toBe('Test Character');
  });

  it('should allow nullable fields', () => {
    const minimalCard: Card = {
      id: 1,
      rarity: null,
      limited: null,
      cardName: 'Minimal Card',
      cardUrl: null,
      characterName: 'Character',
      styleType: null,
      isLocked: null,
      createdAt: null,
      updatedAt: null,
    };

    expect(minimalCard).toBeDefined();
    expect(minimalCard.rarity).toBeNull();
    expect(minimalCard.styleType).toBeNull();
  });

  it('should support optional detail field', () => {
    const cardWithDetail: Card = {
      id: 1,
      rarity: Rarity.SR,
      limited: 'PERMANENT',
      cardName: 'Card with Detail',
      cardUrl: null,
      characterName: 'Character',
      styleType: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      detail: {
        id: 1,
        cardId: 1,
        favoriteMode: 'HAPPY',
        acquisitionMethod: null,
        awakeBeforeUrl: null,
        awakeAfterUrl: null,
        awakeBeforeStorageUrl: null,
        awakeAfterStorageUrl: null,
        smileMaxLevel: '60',
        pureMaxLevel: '60',
        coolMaxLevel: '60',
        mentalMaxLevel: '60',
        specialAppealName: 'Test Special Appeal',
        specialAppealAp: '10',
        specialAppealEffect: 'Test Effect',
        skillName: 'Test Skill',
        skillAp: '5',
        skillEffect: 'Test Skill Effect',
        traitName: null,
        traitEffect: null,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    expect(cardWithDetail.detail).toBeDefined();
    expect(cardWithDetail.detail?.cardId).toBe(1);
  });
});
