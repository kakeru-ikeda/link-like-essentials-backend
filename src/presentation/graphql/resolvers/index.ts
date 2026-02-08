import { DateTimeResolver, JSONResolver } from 'graphql-scalars';

import { accessoryResolvers } from './accessoryResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { cardResolvers } from './cardResolver';
import { gradeChallengeResolvers } from './gradeChallengeResolver';
import { liveGrandPrixResolvers } from './liveGrandPrixResolver';
import { mutationResolvers } from './mutationResolver';
import { songResolvers } from './songResolver';
import { traitAnalysisResolvers } from './traitAnalysisResolver';

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Query: {
    ...cardResolvers.Query,
    ...cardDetailResolvers.Query,
    ...accessoryResolvers.Query,
    ...songResolvers.Query,
    ...liveGrandPrixResolvers.Query,
    ...gradeChallengeResolvers.Query,
    ...traitAnalysisResolvers.Query,
  },
  Mutation: {
    ...mutationResolvers.Mutation,
  },
  Card: cardResolvers.Card,
  CardDetail: cardDetailResolvers.CardDetail,
  Accessory: accessoryResolvers.Accessory,
  Song: songResolvers.Song,
  LiveGrandPrix: liveGrandPrixResolvers.LiveGrandPrix,
  LiveGrandPrixDetail: liveGrandPrixResolvers.LiveGrandPrixDetail,
  GradeChallenge: gradeChallengeResolvers.GradeChallenge,
  GradeChallengeDetail: gradeChallengeResolvers.GradeChallengeDetail,
  HeartCollectAnalysis: traitAnalysisResolvers.HeartCollectAnalysis,
  UnDrawAnalysis: traitAnalysisResolvers.UnDrawAnalysis,
} as const;
