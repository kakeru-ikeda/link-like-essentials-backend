import { Router } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const songRouter = Router();

songRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { category, attribute, centerCharacter } = req.query;

      const filter = {
        ...(category && { category: String(category) }),
        ...(attribute && { attribute: String(attribute) }),
        ...(centerCharacter && { centerCharacter: String(centerCharacter) }),
      };

      const songs = await ctx.dataSources.songService.findAll(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      res.json(serialize(songs));
    } catch (err) {
      next(err);
    }
  })
);

songRouter.get(
  '/stats',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const stats = await ctx.dataSources.songService.getStats();
      res.json(serialize(stats));
    } catch (err) {
      next(err);
    }
  })
);

songRouter.get(
  '/:id',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const id = parseInt(req.params.id ?? '', 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ error: { code: 'BAD_USER_INPUT', message: '無効なIDです' } });
        return;
      }
      const song = await ctx.dataSources.songService.findById(id);
      res.json(serialize(song));
    } catch (err) {
      next(err);
    }
  })
);

export const songByNameRouter = Router();

songByNameRouter.get(
  '/:songName',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { songName } = req.params;
      if (!songName) {
        res.status(400).json({
          error: { code: 'BAD_USER_INPUT', message: '楽曲名は必須です' },
        });
        return;
      }
      const song = await ctx.dataSources.songService.findBySongName(songName);
      if (!song) {
        throw new NotFoundError(`Song "${songName}" not found`);
      }
      res.json(serialize(song));
    } catch (err) {
      next(err);
    }
  })
);
