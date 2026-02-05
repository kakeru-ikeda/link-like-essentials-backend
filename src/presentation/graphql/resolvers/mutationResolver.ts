import type {
  CreateCardInput,
  UpdateCardInput,
  UpsertCardDetailInput,
  CreateAccessoryInput,
  UpdateAccessoryInput,
} from '@/application/dto/MutationDTO';
import { ValidationError } from '@/domain/errors/AppError';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';
import { requireAdmin } from '@/presentation/middleware/adminGuard';

import type { GraphQLContext } from '../context';

/**
 * IDをパースして検証する
 * @param id - パース対象のID文字列
 * @param fieldName - フィールド名（エラーメッセージ用）
 * @returns パースされた数値ID
 * @throws {ValidationError} IDが無効な場合
 */
function parseAndValidateId(id: string, fieldName: string = 'id'): number {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new ValidationError(
      `Invalid ${fieldName}: "${id}" is not a valid number`
    );
  }
  return parsedId;
}

interface MutationResolvers {
  createCard: (
    parent: unknown,
    args: { input: CreateCardInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  updateCard: (
    parent: unknown,
    args: { id: string; input: UpdateCardInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  deleteCard: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  upsertCardDetail: (
    parent: unknown,
    args: { input: UpsertCardDetailInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  createAccessory: (
    parent: unknown,
    args: { input: CreateAccessoryInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  updateAccessory: (
    parent: unknown,
    args: { id: string; input: UpdateAccessoryInput },
    context: GraphQLContext
  ) => Promise<unknown>;
  deleteAccessory: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
}

export const mutationResolvers: {
  Mutation: MutationResolvers;
} = {
  Mutation: {
    createCard: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { input } = args;

      // ENUM変換（GraphQL ENUM → 日本語）
      const cardInput = {
        ...input,
        rarity:
          input.rarity !== undefined
            ? (EnumMapper.toRarityString(input.rarity) ?? undefined)
            : undefined,
        limited:
          input.limited !== undefined
            ? (EnumMapper.toLimitedTypeString(input.limited) ?? undefined)
            : undefined,
        styleType:
          input.styleType !== undefined
            ? (EnumMapper.toStyleTypeString(input.styleType) ?? undefined)
            : undefined,
      };

      const card = await context.dataSources.cardService.create(cardInput);

      return card;
    },

    updateCard: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { id, input } = args;
      const cardId = parseAndValidateId(id, 'cardId');

      // ENUM変換（GraphQL ENUM → 日本語）
      const cardInput = {
        ...input,
        rarity:
          input.rarity !== undefined
            ? (EnumMapper.toRarityString(input.rarity) ?? undefined)
            : undefined,
        limited:
          input.limited !== undefined
            ? (EnumMapper.toLimitedTypeString(input.limited) ?? undefined)
            : undefined,
        styleType:
          input.styleType !== undefined
            ? (EnumMapper.toStyleTypeString(input.styleType) ?? undefined)
            : undefined,
      };

      const card = await context.dataSources.cardService.update(
        cardId,
        cardInput
      );

      return card;
    },

    deleteCard: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { id } = args;
      const cardId = parseAndValidateId(id, 'cardId');

      const result = await context.dataSources.cardService.delete(cardId);

      return result;
    },

    upsertCardDetail: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { input } = args;
      const cardId = parseAndValidateId(input.cardId.toString(), 'cardId');

      // ENUM変換（GraphQL ENUM → 日本語）
      const detailInput = {
        ...input,
        cardId,
        favoriteMode:
          input.favoriteMode !== undefined
            ? (EnumMapper.toFavoriteModeString(input.favoriteMode) ?? undefined)
            : undefined,
      };

      const detail =
        await context.dataSources.cardDetailService.upsert(detailInput);

      return detail;
    },

    createAccessory: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { input } = args;
      const cardId = parseAndValidateId(input.cardId.toString(), 'cardId');

      // ENUM変換（GraphQL ENUM → 日本語）
      const accessoryInput = {
        ...input,
        cardId,
        parentType:
          EnumMapper.toParentTypeString(input.parentType) ?? input.parentType,
      };

      const accessory =
        await context.dataSources.accessoryService.create(accessoryInput);

      return accessory;
    },

    updateAccessory: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { id, input } = args;
      const accessoryId = parseAndValidateId(id, 'accessoryId');

      // ENUM変換（GraphQL ENUM → 日本語）
      const accessoryInput = {
        ...input,
        parentType:
          input.parentType !== undefined
            ? (EnumMapper.toParentTypeString(input.parentType) ?? undefined)
            : undefined,
      };

      const accessory = await context.dataSources.accessoryService.update(
        accessoryId,
        accessoryInput
      );

      return accessory;
    },

    deleteAccessory: async (_, args, context) => {
      requireAdmin(context); // 管理者権限必須

      const { id } = args;
      const accessoryId = parseAndValidateId(id, 'accessoryId');

      const result =
        await context.dataSources.accessoryService.delete(accessoryId);

      return result;
    },
  },
};
