import { Router } from 'express';

import { createContext } from '@/config/context';
import { ValidationError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const traitAnalysisRouter = Router();

traitAnalysisRouter.post(
  '/batch',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const body: unknown = req.body;

      if (
        typeof body !== 'object' ||
        body === null ||
        !('cardIds' in body) ||
        !Array.isArray((body as { cardIds: unknown }).cardIds)
      ) {
        throw new ValidationError('cardIds は整数の配列で指定してください');
      }

      const { cardIds } = body as { cardIds: unknown[] };

      if (
        cardIds.some((id) => typeof id !== 'number' || !Number.isInteger(id))
      ) {
        throw new ValidationError('cardIds の各要素は整数である必要があります');
      }

      const intCardIds = cardIds as number[];

      const results = await Promise.all(
        intCardIds.map(async (cardId) => {
          const [heartCollectAnalysis, unDrawAnalysis] = await Promise.all([
            ctx.dataSources.heartCollectAnalysisService.findByCardId(cardId),
            ctx.dataSources.unDrawAnalysisService.findByCardId(cardId),
          ]);
          return { cardId, heartCollectAnalysis, unDrawAnalysis };
        })
      );

      res.json(serialize({ results }));
    } catch (err) {
      next(err);
    }
  })
);
