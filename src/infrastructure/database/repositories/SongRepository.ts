import type { PrismaClient, Song as PrismaSong } from '@prisma/client';

import type { Song } from '@/domain/entities/Song';
import type {
  ISongRepository,
  SongFilterInput,
  SongStats,
} from '@/domain/repositories/ISongRepository';

export class SongRepository implements ISongRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Song | null> {
    const song = await this.prisma.song.findUnique({
      where: { id },
      include: {
        moodProgressions: {
          orderBy: {
            sectionOrder: 'asc',
          },
        },
      },
    });

    return song ? this.mapToEntity(song) : null;
  }

  async findBySongName(songName: string): Promise<Song | null> {
    const song = await this.prisma.song.findFirst({
      where: {
        songName,
      },
      include: {
        moodProgressions: {
          orderBy: {
            sectionOrder: 'asc',
          },
        },
      },
    });

    return song ? this.mapToEntity(song) : null;
  }

  async findAll(filter?: SongFilterInput): Promise<Song[]> {
    const where = this.buildWhereClause(filter);

    const songs = await this.prisma.song.findMany({
      where,
      include: {
        moodProgressions: {
          orderBy: {
            sectionOrder: 'asc',
          },
        },
      },
      orderBy: [
        {
          category: 'asc',
        },
        {
          id: 'asc',
        },
      ],
    });

    return songs.map((song) => this.mapToEntity(song));
  }

  async findByIds(ids: number[]): Promise<Song[]> {
    const songs = await this.prisma.song.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        moodProgressions: {
          orderBy: {
            sectionOrder: 'asc',
          },
        },
      },
    });

    return songs.map((song) => this.mapToEntity(song));
  }

  async getStats(): Promise<SongStats> {
    const [totalSongs, byCategory, byAttribute, byCenterCharacter] =
      await Promise.all([
        this.prisma.song.count(),
        this.prisma.song.groupBy({
          by: ['category'],
          _count: true,
          orderBy: {
            category: 'asc',
          },
        }),
        this.prisma.song.groupBy({
          by: ['attribute'],
          _count: true,
          orderBy: {
            attribute: 'asc',
          },
        }),
        this.prisma.song.groupBy({
          by: ['centerCharacter'],
          _count: true,
          orderBy: {
            _count: {
              centerCharacter: 'desc',
            },
          },
          take: 20,
        }),
      ]);

    return {
      totalSongs,
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      byAttribute: byAttribute.map((a) => ({
        attribute: a.attribute,
        count: a._count,
      })),
      byCenterCharacter: byCenterCharacter.map((c) => ({
        centerCharacter: c.centerCharacter,
        count: c._count,
      })),
    };
  }

  private buildWhereClause(filter?: SongFilterInput): Record<string, unknown> {
    if (!filter) return {};

    type WhereCondition = {
      category?: string;
      attribute?: string;
      centerCharacter?: string;
      songName?: { contains: string; mode: string };
      singers?: { contains: string; mode: string };
    };

    const conditions: WhereCondition = {
      ...(filter.category && { category: filter.category }),
      ...(filter.attribute && { attribute: filter.attribute }),
      ...(filter.centerCharacter && {
        centerCharacter: filter.centerCharacter,
      }),
      ...(filter.songName && {
        songName: { contains: filter.songName, mode: 'insensitive' },
      }),
      ...(filter.singersContains && {
        singers: { contains: filter.singersContains, mode: 'insensitive' },
      }),
    };

    return conditions;
  }

  private mapToEntity(
    song: PrismaSong & { moodProgressions?: unknown[] }
  ): Song {
    return {
      id: song.id,
      songName: song.songName,
      songUrl: song.songUrl,
      category: song.category,
      attribute: song.attribute,
      centerCharacter: song.centerCharacter,
      singers: song.singers,
      participations: song.participations,
      liveAnalyzerImageUrl: song.liveAnalyzerImageUrl,
      jacketImageUrl: song.jacketImageUrl,
      isLocked: song.isLocked,
      createdAt: song.createdAt,
      updatedAt: song.updatedAt,
      moodProgressions: song.moodProgressions as Song['moodProgressions'],
    };
  }
}
