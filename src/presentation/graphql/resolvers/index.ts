import { DateTimeResolver } from 'graphql-scalars';

import { accessoryResolvers } from './accessoryResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { cardResolvers } from './cardResolver';
import { gradeChallengeResolvers } from './gradeChallengeResolver';
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
    ...gradeChallengeResolvers.Query,
  },
  Card: cardResolvers.Card,
  CardDetail: cardDetailResolvers.CardDetail,
  Accessory: accessoryResolvers.Accessory,
  Song: songResolvers.Song,
  LiveGrandPrix: liveGrandPrixResolvers.LiveGrandPrix,
  LiveGrandPrixDetail: liveGrandPrixResolvers.LiveGrandPrixDetail,
  GradeChallenge: gradeChallengeResolvers.GradeChallenge,
  GradeChallengeDetail: gradeChallengeResolvers.GradeChallengeDetail,
} as const;
