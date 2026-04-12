import { Router } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const songRouter = Router();

/**
 * @openapi
 * /songs:
 *   get:
 *     summary: 楽曲一覧取得
 *     description: フィルター条件を指定して楽曲の一覧を取得します。
 *     tags:
 *       - Songs
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: カテゴリでフィルター
 *       - in: query
 *         name: attribute
 *         schema:
 *           type: string
 *         description: 属性でフィルター
 *       - in: query
 *         name: centerCharacter
 *         schema:
 *           type: string
 *         description: センターキャラクターでフィルター
 *     responses:
 *       200:
 *         description: 楽曲一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Song'
 */
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

/**
 * @openapi
 * /songs/stats:
 *   get:
 *     summary: 楽曲統計情報
 *     description: 楽曲の統計情報を取得します。
 *     tags:
 *       - Songs
 *     responses:
 *       200:
 *         description: 統計情報
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
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

/**
 * @openapi
 * /songs/{id}:
 *   get:
 *     summary: 楽曲取得（ID指定）
 *     description: IDを指定して楽曲を取得します。
 *     tags:
 *       - Songs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 楽曲ID
 *     responses:
 *       200:
 *         description: 楽曲情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @openapi
 * /songs/name/{songName}:
 *   get:
 *     summary: 楽曲取得（楽曲名指定）
 *     description: 楽曲名を指定して楽曲を取得します。
 *     tags:
 *       - Songs
 *     parameters:
 *       - in: path
 *         name: songName
 *         required: true
 *         schema:
 *           type: string
 *         description: 楽曲名
 *     responses:
 *       200:
 *         description: 楽曲情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Song'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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
