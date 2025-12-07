import { DateTimeResolver } from 'graphql-scalars';

import { accessoryResolvers } from './accessoryResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { cardResolvers } from './cardResolver';
import { songResolvers } from './songResolver';

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...cardResolvers.Query,
    ...cardDetailResolvers.Query,
    ...accessoryResolvers.Query,
    ...songResolvers.Query,
  },
  Card: cardResolvers.Card,
  CardDetail: cardDetailResolvers.CardDetail,
  Accessory: accessoryResolvers.Accessory,
  Song: songResolvers.Song,
} as const;
