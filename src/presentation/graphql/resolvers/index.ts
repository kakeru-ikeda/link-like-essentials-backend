import { cardResolvers } from './cardResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { accessoryResolvers } from './accessoryResolver';
import { DateTimeResolver } from 'graphql-scalars';

export const resolvers = {
    DateTime: DateTimeResolver,
    Query: {
        ...cardResolvers.Query,
        ...cardDetailResolvers.Query,
        ...accessoryResolvers.Query,
    },
    Card: cardResolvers.Card,
    CardDetail: cardDetailResolvers.CardDetail,
    Accessory: accessoryResolvers.Accessory,
};
