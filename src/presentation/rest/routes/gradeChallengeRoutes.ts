import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

export const gradeChallengeRouter = Router();

/**
 * @openapi
 * /grade-challenges:
 *   get:
 *     summary: グレードチャレンジ一覧取得
 *     description: フィルター条件を指定してグレードチャレンジイベント一覧を取得します。
 *     tags:
 *       - GradeChallenges
 *     parameters:
 *       - in: query
 *         name: termName
 *         schema:
 *           type: string
 *         description: ターム名でフィルター
 *     responses:
 *       200:
 *         description: グレードチャレンジ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GradeChallenge'
 */
gradeChallengeRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const { termName } = req.query;

      const filter = {
        ...(termName && { termName: String(termName) }),
      };

      const events = await ctx.dataSources.gradeChallengeService.findAll(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /grade-challenges/ongoing:
 *   get:
 *     summary: 開催中のグレードチャレンジ取得
 *     description: 現在開催中のグレードチャレンジイベントを取得します。
 *     tags:
 *       - GradeChallenges
 *     responses:
 *       200:
 *         description: 開催中イベント一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GradeChallenge'
 */
gradeChallengeRouter.get(
  '/ongoing',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const events = await ctx.dataSources.gradeChallengeService.findOngoing();
      res.json(events);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /grade-challenges/stats:
 *   get:
 *     summary: グレードチャレンジ統計情報
 *     description: グレードチャレンジイベントの統計情報を取得します。
 *     tags:
 *       - GradeChallenges
 *     responses:
 *       200:
 *         description: 統計情報
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
gradeChallengeRouter.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const stats = await ctx.dataSources.gradeChallengeService.getStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /grade-challenges/{id}:
 *   get:
 *     summary: グレードチャレンジ取得（ID指定）
 *     description: IDを指定してグレードチャレンジイベントを取得します。
 *     tags:
 *       - GradeChallenges
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: イベントID
 *     responses:
 *       200:
 *         description: グレードチャレンジイベント情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeChallenge'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
gradeChallengeRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const id = parseInt(req.params.id ?? '', 10);
      if (isNaN(id)) {
        res
          .status(400)
          .json({ error: { code: 'BAD_USER_INPUT', message: '無効なIDです' } });
        return;
      }
      const event = await ctx.dataSources.gradeChallengeService.findById(id);
      res.json(event);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /grade-challenges/title/{title}:
 *   get:
 *     summary: グレードチャレンジ取得（タイトル指定）
 *     description: タイトルを指定してグレードチャレンジイベントを取得します。
 *     tags:
 *       - GradeChallenges
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: タイトル
 *     responses:
 *       200:
 *         description: グレードチャレンジイベント情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GradeChallenge'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const gradeChallengeByTitleRouter = Router();

gradeChallengeByTitleRouter.get(
  '/:title',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const { title } = req.params;
      if (!title) {
        res
          .status(400)
          .json({
            error: { code: 'BAD_USER_INPUT', message: 'タイトルは必須です' },
          });
        return;
      }
      const event =
        await ctx.dataSources.gradeChallengeService.findByTitle(title);
      if (!event) {
        throw new NotFoundError(`GradeChallenge "${title}" not found`);
      }
      res.json(event);
    } catch (err) {
      next(err);
    }
  }
);
