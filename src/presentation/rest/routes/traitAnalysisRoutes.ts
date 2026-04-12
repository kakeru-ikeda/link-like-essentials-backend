import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import { createContext } from '@/config/context';
import { ValidationError } from '@/domain/errors/AppError';

export const traitAnalysisRouter = Router();

/**
 * @openapi
 * /trait-analysis/batch:
 *   post:
 *     summary: 特性分析バッチ取得
 *     description: 複数のカードIDを指定してハートコレクト分析・アンドロー分析データをまとめて取得します。
 *     tags:
 *       - TraitAnalysis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TraitAnalysisBatchRequest'
 *     responses:
 *       200:
 *         description: バッチ分析結果
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TraitAnalysisBatchResponse'
 *       400:
 *         description: バリデーションエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
traitAnalysisRouter.post(
  '/batch',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
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

      res.json({ results });
    } catch (err) {
      next(err);
    }
  }
);
