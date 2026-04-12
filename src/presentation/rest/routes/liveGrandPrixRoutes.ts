import { Router } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const liveGrandPrixRouter = Router();

liveGrandPrixRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { yearTerm } = req.query;

      const filter = {
        ...(yearTerm && { yearTerm: String(yearTerm) }),
      };

      const events = await ctx.dataSources.liveGrandPrixService.findAll(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      res.json(serialize(events));
    } catch (err) {
      next(err);
    }
  })
);

liveGrandPrixRouter.get(
  '/ongoing',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const events = await ctx.dataSources.liveGrandPrixService.findOngoing();
      res.json(serialize(events));
    } catch (err) {
      next(err);
    }
  })
);

liveGrandPrixRouter.get(
  '/stats',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const stats = await ctx.dataSources.liveGrandPrixService.getStats();
      res.json(serialize(stats));
    } catch (err) {
      next(err);
    }
  })
);

liveGrandPrixRouter.get(
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
      const event = await ctx.dataSources.liveGrandPrixService.findById(id);
      res.json(serialize(event));
    } catch (err) {
      next(err);
    }
  })
);

export const liveGrandPrixByNameRouter = Router();

liveGrandPrixByNameRouter.get(
  '/:eventName',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { eventName } = req.params;
      if (!eventName) {
        res.status(400).json({
          error: { code: 'BAD_USER_INPUT', message: 'イベント名は必須です' },
        });
        return;
      }
      const event =
        await ctx.dataSources.liveGrandPrixService.findByEventName(eventName);
      if (!event) {
        throw new NotFoundError(`LiveGrandPrix "${eventName}" not found`);
      }
      res.json(serialize(event));
    } catch (err) {
      next(err);
    }
  })
);
