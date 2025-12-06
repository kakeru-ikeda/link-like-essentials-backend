import type { Accessory } from '@/domain/entities/Accessory';

describe('Accessory Entity', () => {
  it('should create a valid accessory object', () => {
    const accessory: Accessory = {
      id: 1,
      cardId: 1,
      parentType: 'special_appeal',
      name: 'Test Accessory',
      ap: '10',
      effect: 'Test Effect',
      traitName: 'Test Trait',
      traitEffect: 'Trait Effect',
      displayOrder: 1,
      isLocked: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    expect(accessory).toBeDefined();
    expect(accessory.id).toBe(1);
    expect(accessory.cardId).toBe(1);
    expect(accessory.parentType).toBe('special_appeal');
    expect(accessory.name).toBe('Test Accessory');
    expect(accessory.ap).toBe('10');
    expect(accessory.effect).toBe('Test Effect');
  });

  it('should allow nullable fields', () => {
    const minimalAccessory: Accessory = {
      id: 1,
      cardId: 1,
      parentType: 'skill',
      name: 'Minimal Accessory',
      ap: null,
      effect: null,
      traitName: null,
      traitEffect: null,
      displayOrder: null,
      isLocked: null,
      createdAt: null,
      updatedAt: null,
    };

    expect(minimalAccessory).toBeDefined();
    expect(minimalAccessory.ap).toBeNull();
    expect(minimalAccessory.effect).toBeNull();
    expect(minimalAccessory.traitName).toBeNull();
    expect(minimalAccessory.displayOrder).toBeNull();
  });

  it('should support optional card field', () => {
    const accessoryWithCard: Accessory = {
      id: 1,
      cardId: 1,
      parentType: 'trait',
      name: 'Accessory with Card',
      ap: null,
      effect: null,
      traitName: null,
      traitEffect: null,
      displayOrder: null,
      isLocked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      card: {
        id: 1,
        rarity: 'UR',
        limited: 'LIMITED',
        cardName: 'Test Card',
        cardUrl: null,
        characterName: 'Test Character',
        styleType: 'CHEERLEADER',
        releaseDate: null,
        isLocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    expect(accessoryWithCard.card).toBeDefined();
    expect(accessoryWithCard.card?.cardName).toBe('Test Card');
  });

  it('should support all parentType values', () => {
    const parentTypes = ['special_appeal', 'skill', 'trait'];

    parentTypes.forEach((parentType) => {
      const accessory: Accessory = {
        id: 1,
        cardId: 1,
        parentType,
        name: 'Test',
        ap: null,
        effect: null,
        traitName: null,
        traitEffect: null,
        displayOrder: null,
        isLocked: null,
        createdAt: null,
        updatedAt: null,
      };

      expect(accessory.parentType).toBe(parentType);
    });
  });
});
