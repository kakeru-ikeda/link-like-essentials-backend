import { DateTimeResolver, JSONResolver } from 'graphql-scalars';

import { accessoryResolvers } from './accessoryResolver';
import { cardDetailResolvers } from './cardDetailResolver';
import { cardResolvers } from './cardResolver';
import { gradeChallengeResolvers } from './gradeChallengeResolver';
import { liveGrandPrixResolvers } from './liveGrandPrixResolver';
import { songResolvers } from './songResolver';

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
  },
  Card: cardResolvers.Card,
  CardDetail: cardDetailResolvers.CardDetail,
  Accessory: accessoryResolvers.Accessory,
  HeartCollectAnalysis: {
    sections: (parent: {
      section1: boolean;
      section2: boolean;
      section3: boolean;
      section4: boolean;
      section5: boolean;
      sectionFever: boolean;
    }) => {
      return {
        section1: parent.section1,
        section2: parent.section2,
        section3: parent.section3,
        section4: parent.section4,
        section5: parent.section5,
        sectionFever: parent.sectionFever,
      };
    },
  },
  UnDrawAnalysis: {
    sections: (parent: {
      section1: boolean;
      section2: boolean;
      section3: boolean;
      section4: boolean;
      section5: boolean;
      sectionFever: boolean;
    }) => {
      return {
        section1: parent.section1,
        section2: parent.section2,
        section3: parent.section3,
        section4: parent.section4,
        section5: parent.section5,
        sectionFever: parent.sectionFever,
      };
    },
  },
  Song: songResolvers.Song,
  LiveGrandPrix: liveGrandPrixResolvers.LiveGrandPrix,
  LiveGrandPrixDetail: liveGrandPrixResolvers.LiveGrandPrixDetail,
  GradeChallenge: gradeChallengeResolvers.GradeChallenge,
  GradeChallengeDetail: gradeChallengeResolvers.GradeChallengeDetail,
} as const;
