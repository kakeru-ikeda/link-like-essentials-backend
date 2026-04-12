import { Router } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const gradeChallengeRouter = Router();

gradeChallengeRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { termName } = req.query;

      const filter = {
        ...(termName && { termName: String(termName) }),
      };

      const events = await ctx.dataSources.gradeChallengeService.findAll(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      res.json(serialize(events));
    } catch (err) {
      next(err);
    }
  })
);

gradeChallengeRouter.get(
  '/ongoing',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const events = await ctx.dataSources.gradeChallengeService.findOngoing();
      res.json(serialize(events));
    } catch (err) {
      next(err);
    }
  })
);

gradeChallengeRouter.get(
  '/stats',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const stats = await ctx.dataSources.gradeChallengeService.getStats();
      res.json(serialize(stats));
    } catch (err) {
      next(err);
    }
  })
);

gradeChallengeRouter.get(
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
      const event = await ctx.dataSources.gradeChallengeService.findById(id);
      res.json(serialize(event));
    } catch (err) {
      next(err);
    }
  })
);

export const gradeChallengeByTitleRouter = Router();

gradeChallengeByTitleRouter.get(
  '/:title',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { title } = req.params;
      if (!title) {
        res.status(400).json({
          error: { code: 'BAD_USER_INPUT', message: 'タイトルは必須です' },
        });
        return;
      }
      const event =
        await ctx.dataSources.gradeChallengeService.findByTitle(title);
      if (!event) {
        throw new NotFoundError(`GradeChallenge "${title}" not found`);
      }
      res.json(serialize(event));
    } catch (err) {
      next(err);
    }
  })
);
