import type { GraphQLContext } from '../context';
import type { CardDetail } from '@/domain/entities/CardDetail';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';

interface QueryResolvers {
    cardDetail: (
        parent: unknown,
        args: { cardId: string },
        context: GraphQLContext
    ) => Promise<unknown>;
}

export interface CardDetailResolvers {
    stats: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => unknown;
    specialAppeal: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => unknown;
    skill: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => unknown;
    trait: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => unknown;
    accessories: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => Promise<unknown>;
    favoriteMode: (parent: CardDetail) => string | null;
    card: (parent: CardDetail, args: Record<string, never>, context: GraphQLContext) => Promise<unknown>;
}

export const cardDetailResolvers: {
    Query: QueryResolvers;
    CardDetail: CardDetailResolvers;
} = {
    Query: {
        cardDetail: async (_, { cardId }, context) => {
            return await context.dataSources.cardDetailService.findByCardId(
                parseInt(cardId, 10)
            );
        },
    },

    CardDetail: {
        stats: (parent, _, context) => {
            return context.dataSources.cardDetailService.buildStats(parent);
        },

        specialAppeal: (parent, _, context) => {
            return context.dataSources.cardDetailService.buildSpecialAppeal(parent);
        },

        skill: (parent, _, context) => {
            return context.dataSources.cardDetailService.buildSkill(parent);
        },

        trait: (parent, _, context) => {
            return context.dataSources.cardDetailService.buildTrait(parent);
        },

        accessories: async (parent, _, context) => {
            return await context.dataSources.accessoryService.findByCardId(
                parent.cardId
            );
        },

        favoriteMode: (parent) => {
            return EnumMapper.toFavoriteModeEnum(parent.favoriteMode);
        },

        card: async (parent, _, context) => {
            if (parent.card) return parent.card;
            return await context.dataSources.cardService.findById(parent.cardId);
        },
    },
};
