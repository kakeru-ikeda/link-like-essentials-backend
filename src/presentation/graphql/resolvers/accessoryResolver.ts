import type { GraphQLContext } from '../context';
import type { Accessory } from '@/domain/entities/Accessory';
import type { AccessoryFilterInput } from '@/domain/repositories/IAccessoryRepository';
import { EnumMapper } from '@/infrastructure/mappers/EnumMapper';

interface AccessoryQueryArgs {
    cardId: string;
    filter?: {
        parentType?: string;
        nameContains?: string;
        effectContains?: string;
    };
}

interface QueryResolvers {
    accessories: (
        parent: unknown,
        args: AccessoryQueryArgs,
        context: GraphQLContext
    ) => Promise<unknown>;
}

interface AccessoryResolvers {
    trait: (parent: Accessory, args: Record<string, never>, context: GraphQLContext) => unknown;
    parentType: (parent: Accessory) => string | null;
    card: (parent: Accessory, args: Record<string, never>, context: GraphQLContext) => Promise<unknown>;
}

export const accessoryResolvers: {
    Query: QueryResolvers;
    Accessory: AccessoryResolvers;
} = {
    Query: {
        accessories: async (_, { cardId, filter }, context) => {
            const accessoryFilter: AccessoryFilterInput | undefined = filter
                ? {
                    parentType: filter.parentType,
                    nameContains: filter.nameContains,
                    effectContains: filter.effectContains,
                }
                : undefined;

            return await context.dataSources.accessoryService.findByCardId(
                parseInt(cardId, 10),
                accessoryFilter
            );
        },
    },

    Accessory: {
        trait: (parent, _, context) => {
            return context.dataSources.accessoryService.buildTrait(parent);
        },

        parentType: (parent) => {
            return EnumMapper.toParentTypeEnum(parent.parentType);
        },

        card: async (parent, _, context) => {
            if (parent.card) return parent.card;
            return await context.dataSources.cardService.findById(parent.cardId);
        },
    },
};
