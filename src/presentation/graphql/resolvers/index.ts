import { DateTimeResolver } from 'graphql-scalars';

import { accessoryResolvers } from './accessoryResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { cardResolvers } from './cardResolver';
import { liveGrandPrixResolvers } from './liveGrandPrixResolver';
import { songResolvers } from './songResolver';

export const resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    ...cardResolvers.Query,
    ...cardDetailResolvers.Query,
    ...accessoryResolvers.Query,
    ...songResolvers.Query,
    ...liveGrandPrixResolvers.Query,
  },
  Card: cardResolvers.Card,
  CardDetail: cardDetailResolvers.CardDetail,
  Accessory: accessoryResolvers.Accessory,
  Song: songResolvers.Song,
  LiveGrandPrix: liveGrandPrixResolvers.LiveGrandPrix,
  LiveGrandPrixDetail: liveGrandPrixResolvers.LiveGrandPrixDetail,
} as const;
