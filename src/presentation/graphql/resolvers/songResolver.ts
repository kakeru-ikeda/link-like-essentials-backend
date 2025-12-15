import type { SongFilterInput } from '@/application/dto/SongDTO';
import { requireAuth } from '@/presentation/middleware/authGuard';

import type { GraphQLContext } from '../context';

interface QueryResolvers {
  songs: (
    parent: unknown,
    args: {
      filter?: SongFilterInput;
    },
    context: GraphQLContext
  ) => Promise<unknown>;
  song: (
    parent: unknown,
    args: { id: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  songByName: (
    parent: unknown,
    args: { songName: string },
    context: GraphQLContext
  ) => Promise<unknown>;
  songStats: (
    parent: unknown,
    args: Record<string, never>,
    context: GraphQLContext
  ) => Promise<unknown>;
}

export interface SongResolvers {
  moodProgressions: (
    parent: { id: number; moodProgressions?: unknown[] },
    args: Record<string, never>,
    context: GraphQLContext
  ) => unknown[];
  participations: (
    parent: { participations: string | null },
    args: Record<string, never>,
    context: GraphQLContext
  ) => string[];
}

export const songResolvers: {
  Query: QueryResolvers;
  Song: SongResolvers;
} = {
  Query: {
    songs: async (_, args, context) => {
      requireAuth(context);

      const { filter } = args;

      const result = await context.dataSources.songService.findAll(filter);

      return result;
    },

    song: async (_, { id }, context) => {
      requireAuth(context);

      return await context.dataSources.songService.findById(parseInt(id, 10));
    },

    songByName: async (_, { songName }, context) => {
      requireAuth(context);

      return await context.dataSources.songService.findBySongName(songName);
    },

    songStats: async (_, __, context) => {
      requireAuth(context);

      return await context.dataSources.songService.getStats();
    },
  },

  Song: {
    moodProgressions: (parent) => {
      // 事前ロード済みの場合はそれを返す
      if (parent.moodProgressions) return parent.moodProgressions;

      // 事前ロードされていない場合は空配列を返す
      return [];
    },

    participations: (parent) => {
      // participationsがnullまたは空文字列の場合は空配列を返す
      if (!parent.participations || parent.participations.trim() === '') {
        return [];
      }

      // カンマ区切りで分割し、前後の空白を削除
      return parent.participations.split(',').map((p) => p.trim());
    },
  },
};
