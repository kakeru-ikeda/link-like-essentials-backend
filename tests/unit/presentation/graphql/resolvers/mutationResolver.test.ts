import { ValidationError } from '@/domain/errors/AppError';
import type { GraphQLContext } from '@/presentation/graphql/context';
import { mutationResolvers } from '@/presentation/graphql/resolvers/mutationResolver';

// モックの作成
jest.mock('@/presentation/middleware/adminGuard', () => ({
  requireAdmin: jest.fn(),
}));

jest.mock('@/infrastructure/mappers/EnumMapper', () => ({
  EnumMapper: {
    toRarityString: jest.fn((val) => val),
    toLimitedTypeString: jest.fn((val) => val),
    toStyleTypeString: jest.fn((val) => val),
    toFavoriteModeString: jest.fn((val) => val),
    toParentTypeString: jest.fn((val) => val),
  },
}));

describe('mutationResolver', () => {
  let mockContext: GraphQLContext;

  beforeEach(() => {
    mockContext = {
      user: {
        uid: 'admin-uid',
        email: 'admin@example.com',
        emailVerified: true,
        customClaims: { admin: true },
      },
      dataSources: {
        cardService: {
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
        cardDetailService: {
          upsert: jest.fn(),
        },
        accessoryService: {
          create: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        },
      },
    } as unknown as GraphQLContext;
  });

  describe('ID parsing validation', () => {
    it('should throw ValidationError when updating card with invalid ID', async () => {
      const args = {
        id: 'invalid-id',
        input: { cardName: 'Test' },
      };

      await expect(
        mutationResolvers.Mutation.updateCard(null, args, mockContext)
      ).rejects.toThrow(ValidationError);
      await expect(
        mutationResolvers.Mutation.updateCard(null, args, mockContext)
      ).rejects.toThrow('Invalid cardId: "invalid-id" is not a valid number');
    });

    it('should throw ValidationError when deleting card with invalid ID', async () => {
      const args = {
        id: 'not-a-number',
      };

      await expect(
        mutationResolvers.Mutation.deleteCard(null, args, mockContext)
      ).rejects.toThrow(ValidationError);
      await expect(
        mutationResolvers.Mutation.deleteCard(null, args, mockContext)
      ).rejects.toThrow('Invalid cardId: "not-a-number" is not a valid number');
    });

    it('should throw ValidationError when upserting card detail with invalid cardId', async () => {
      const args = {
        input: {
          cardId: 'abc' as unknown as number,
          skillName: 'Test Skill',
        },
      };

      await expect(
        mutationResolvers.Mutation.upsertCardDetail(null, args, mockContext)
      ).rejects.toThrow(ValidationError);
      await expect(
        mutationResolvers.Mutation.upsertCardDetail(null, args, mockContext)
      ).rejects.toThrow('Invalid cardId: "abc" is not a valid number');
    });

    it('should throw ValidationError when updating accessory with invalid ID', async () => {
      const args = {
        id: 'xyz',
        input: { name: 'Test' },
      };

      await expect(
        mutationResolvers.Mutation.updateAccessory(null, args, mockContext)
      ).rejects.toThrow(ValidationError);
      await expect(
        mutationResolvers.Mutation.updateAccessory(null, args, mockContext)
      ).rejects.toThrow('Invalid accessoryId: "xyz" is not a valid number');
    });

    it('should throw ValidationError when deleting accessory with invalid ID', async () => {
      const args = {
        id: 'not-a-number',
      };

      await expect(
        mutationResolvers.Mutation.deleteAccessory(null, args, mockContext)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Valid ID parsing', () => {
    it('should parse valid numeric string IDs correctly for updateCard', async () => {
      const mockCard = { id: 123, cardName: 'Updated Card' };
      (
        mockContext.dataSources.cardService.update as jest.Mock
      ).mockResolvedValue(mockCard);

      const args = {
        id: '123',
        input: { cardName: 'Updated Card' },
      };

      const result = await mutationResolvers.Mutation.updateCard(
        null,
        args,
        mockContext
      );

      expect(result).toEqual(mockCard);
      expect(mockContext.dataSources.cardService.update).toHaveBeenCalledWith(
        123,
        expect.any(Object)
      );
    });

    it('should parse valid numeric string IDs correctly for deleteCard', async () => {
      const mockResponse = { success: true, message: 'Deleted' };
      (
        mockContext.dataSources.cardService.delete as jest.Mock
      ).mockResolvedValue(mockResponse);

      const args = {
        id: '456',
      };

      const result = await mutationResolvers.Mutation.deleteCard(
        null,
        args,
        mockContext
      );

      expect(result).toEqual(mockResponse);
      expect(mockContext.dataSources.cardService.delete).toHaveBeenCalledWith(
        456
      );
    });

    it('should parse valid numeric string IDs correctly for upsertCardDetail', async () => {
      const mockDetail = { id: 1, cardId: 789 };
      (
        mockContext.dataSources.cardDetailService.upsert as jest.Mock
      ).mockResolvedValue(mockDetail);

      const args = {
        input: {
          cardId: 789,
          skillName: 'Test Skill',
        },
      };

      const result = await mutationResolvers.Mutation.upsertCardDetail(
        null,
        args,
        mockContext
      );

      expect(result).toEqual(mockDetail);
      expect(
        mockContext.dataSources.cardDetailService.upsert
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          cardId: 789,
        })
      );
    });
  });

  describe('ENUM mapping', () => {
    it('should call ENUM mapper for rarity, limited, and styleType on createCard', async () => {
      const { EnumMapper } = require('@/infrastructure/mappers/EnumMapper');
      const mockCard = { id: 1, cardName: 'New Card' };
      (
        mockContext.dataSources.cardService.create as jest.Mock
      ).mockResolvedValue(mockCard);

      const args = {
        input: {
          cardName: 'New Card',
          characterName: 'Character',
          rarity: 'UR',
          limited: 'LIMITED',
          styleType: 'CHEERLEADER',
        },
      };

      await mutationResolvers.Mutation.createCard(null, args, mockContext);

      expect(EnumMapper.toRarityString).toHaveBeenCalledWith('UR');
      expect(EnumMapper.toLimitedTypeString).toHaveBeenCalledWith('LIMITED');
      expect(EnumMapper.toStyleTypeString).toHaveBeenCalledWith('CHEERLEADER');
    });

    it('should call ENUM mapper for favoriteMode on upsertCardDetail', async () => {
      const { EnumMapper } = require('@/infrastructure/mappers/EnumMapper');
      const mockDetail = { id: 1, cardId: 1 };
      (
        mockContext.dataSources.cardDetailService.upsert as jest.Mock
      ).mockResolvedValue(mockDetail);

      const args = {
        input: {
          cardId: 1,
          favoriteMode: 'HAPPY',
        },
      };

      await mutationResolvers.Mutation.upsertCardDetail(
        null,
        args,
        mockContext
      );

      expect(EnumMapper.toFavoriteModeString).toHaveBeenCalledWith('HAPPY');
    });

    it('should call ENUM mapper for parentType on createAccessory', async () => {
      const { EnumMapper } = require('@/infrastructure/mappers/EnumMapper');
      const mockAccessory = { id: 1, cardId: 1 };
      (
        mockContext.dataSources.accessoryService.create as jest.Mock
      ).mockResolvedValue(mockAccessory);

      const args = {
        input: {
          cardId: 1,
          parentType: 'SKILL',
          name: 'Test Accessory',
        },
      };

      await mutationResolvers.Mutation.createAccessory(
        null,
        args,
        mockContext
      );

      expect(EnumMapper.toParentTypeString).toHaveBeenCalledWith('SKILL');
    });
  });
});
