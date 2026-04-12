import { Router } from 'express';

import { createContext } from '@/config/context';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const effectKeywordRouter = Router();

effectKeywordRouter.get(
  '/skill',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const keywords =
        await ctx.dataSources.effectKeywordService.getSkillEffectKeywords();
      res.json(serialize(keywords));
    } catch (err) {
      next(err);
    }
  })
);

effectKeywordRouter.get(
  '/trait',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const keywords =
        await ctx.dataSources.effectKeywordService.getTraitEffectKeywords();
      res.json(serialize(keywords));
    } catch (err) {
      next(err);
    }
  })
);
