import { Router } from 'express';

import { createContext } from '@/config/context';

import { asyncHandler } from '../asyncHandler';
import { serialize } from '../serializers';

export const effectKeywordRouter = Router();

/**
 * @openapi
 * /effect-keywords/skill:
 *   get:
 *     summary: スキル効果キーワード一覧取得
 *     description: スキル効果に関するキーワードグループ一覧を取得します。
 *     tags:
 *       - EffectKeywords
 *     responses:
 *       200:
 *         description: スキル効果キーワードグループ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EffectKeywordGroup'
 */
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

/**
 * @openapi
 * /effect-keywords/trait:
 *   get:
 *     summary: 特性効果キーワード一覧取得
 *     description: 特性効果に関するキーワードグループ一覧を取得します。
 *     tags:
 *       - EffectKeywords
 *     responses:
 *       200:
 *         description: 特性効果キーワードグループ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EffectKeywordGroup'
 */
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
