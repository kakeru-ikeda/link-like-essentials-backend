import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';
import { serialize } from '../serializers';

export const liveGrandPrixRouter = Router();

/**
 * @openapi
 * /live-grand-prix:
 *   get:
 *     summary: ライブグランプリ一覧取得
 *     description: フィルター条件を指定してライブグランプリイベント一覧を取得します。
 *     tags:
 *       - LiveGrandPrix
 *     parameters:
 *       - in: query
 *         name: yearTerm
 *         schema:
 *           type: string
 *         description: 年期でフィルター
 *     responses:
 *       200:
 *         description: ライブグランプリ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LiveGrandPrix'
 */
liveGrandPrixRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
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
  }
);

/**
 * @openapi
 * /live-grand-prix/ongoing:
 *   get:
 *     summary: 開催中のライブグランプリ取得
 *     description: 現在開催中のライブグランプリイベントを取得します。
 *     tags:
 *       - LiveGrandPrix
 *     responses:
 *       200:
 *         description: 開催中イベント一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LiveGrandPrix'
 */
liveGrandPrixRouter.get(
  '/ongoing',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const events = await ctx.dataSources.liveGrandPrixService.findOngoing();
      res.json(serialize(events));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /live-grand-prix/stats:
 *   get:
 *     summary: ライブグランプリ統計情報
 *     description: ライブグランプリイベントの統計情報を取得します。
 *     tags:
 *       - LiveGrandPrix
 *     responses:
 *       200:
 *         description: 統計情報
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
liveGrandPrixRouter.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
      const stats = await ctx.dataSources.liveGrandPrixService.getStats();
      res.json(serialize(stats));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /live-grand-prix/{id}:
 *   get:
 *     summary: ライブグランプリ取得（ID指定）
 *     description: IDを指定してライブグランプリイベントを取得します。
 *     tags:
 *       - LiveGrandPrix
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: イベントID
 *     responses:
 *       200:
 *         description: ライブグランプリイベント情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveGrandPrix'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
liveGrandPrixRouter.get(
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
      const event = await ctx.dataSources.liveGrandPrixService.findById(id);
      res.json(serialize(event));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /live-grand-prix/name/{eventName}:
 *   get:
 *     summary: ライブグランプリ取得（イベント名指定）
 *     description: イベント名を指定してライブグランプリイベントを取得します。
 *     tags:
 *       - LiveGrandPrix
 *     parameters:
 *       - in: path
 *         name: eventName
 *         required: true
 *         schema:
 *           type: string
 *         description: イベント名
 *     responses:
 *       200:
 *         description: ライブグランプリイベント情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LiveGrandPrix'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const liveGrandPrixByNameRouter = Router();

liveGrandPrixByNameRouter.get(
  '/:eventName',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ctx = await createContext(req);
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
  }
);
