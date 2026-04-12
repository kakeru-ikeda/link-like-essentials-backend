import { Router } from 'express';


import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serializeCard } from '../serializers';

export const cardRouter = Router();

/**
 * @openapi
 * /cards:
 *   get:
 *     summary: カード一覧取得
 *     description: フィルター条件を指定してカードの一覧を取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *           enum: [UR, SR, R, DR, BR, LR]
 *         description: レアリティでフィルター
 *       - in: query
 *         name: limited
 *         schema:
 *           type: string
 *         description: 限定種別でフィルター
 *       - in: query
 *         name: characterName
 *         schema:
 *           type: string
 *         description: キャラクター名でフィルター
 *       - in: query
 *         name: styleType
 *         schema:
 *           type: string
 *           enum: [CHEERLEADER, TRICKSTER, PERFORMER, MOODMAKER, MOODOMAKER]
 *         description: スタイルタイプでフィルター
 *       - in: query
 *         name: cardName
 *         schema:
 *           type: string
 *         description: カード名でフィルター
 *       - in: query
 *         name: skillEffectContains
 *         schema:
 *           type: string
 *         description: スキル効果テキストの部分一致
 *       - in: query
 *         name: traitEffectContains
 *         schema:
 *           type: string
 *         description: 特性効果テキストの部分一致
 *       - in: query
 *         name: specialAppealEffectContains
 *         schema:
 *           type: string
 *         description: 必殺技効果テキストの部分一致
 *       - in: query
 *         name: accessoryEffectContains
 *         schema:
 *           type: string
 *         description: アクセサリー効果テキストの部分一致
 *     responses:
 *       200:
 *         description: カード一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       500:
 *         description: サーバーエラー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
cardRouter.get(
  '/',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const {
        rarity,
        limited,
        characterName,
        styleType,
        cardName,
        skillEffectContains,
        traitEffectContains,
        specialAppealEffectContains,
        accessoryEffectContains,
      } = req.query;

      const filter = {
        ...(rarity && { rarity: String(rarity) }),
        ...(limited && { limited: String(limited) }),
        ...(characterName && { characterName: String(characterName) }),
        ...(styleType && { styleType: String(styleType) }),
        ...(cardName && { cardName: String(cardName) }),
        ...(skillEffectContains && {
          skillEffectContains: String(skillEffectContains),
        }),
        ...(traitEffectContains && {
          traitEffectContains: String(traitEffectContains),
        }),
        ...(specialAppealEffectContains && {
          specialAppealEffectContains: String(specialAppealEffectContains),
        }),
        ...(accessoryEffectContains && {
          accessoryEffectContains: String(accessoryEffectContains),
        }),
      };

      const cards = await ctx.dataSources.cardService.findAll(
        Object.keys(filter).length > 0 ? filter : undefined
      );
      res.json(serializeCard(cards));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /cards/connection:
 *   get:
 *     summary: カード一覧（ページネーション）
 *     description: カーソルベースのページネーションでカード一覧を取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: query
 *         name: first
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 取得件数
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: ページネーションカーソル
 *       - in: query
 *         name: rarity
 *         schema:
 *           type: string
 *         description: レアリティでフィルター
 *       - in: query
 *         name: characterName
 *         schema:
 *           type: string
 *         description: キャラクター名でフィルター
 *     responses:
 *       200:
 *         description: ページネーション付きカード一覧
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CardConnection'
 */
cardRouter.get(
  '/connection',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const {
        first,
        after,
        rarity,
        limited,
        characterName,
        styleType,
        cardName,
      } = req.query;

      const filter = {
        ...(rarity && { rarity: String(rarity) }),
        ...(limited && { limited: String(limited) }),
        ...(characterName && { characterName: String(characterName) }),
        ...(styleType && { styleType: String(styleType) }),
        ...(cardName && { cardName: String(cardName) }),
      };

      const pagination = {
        first: first !== undefined ? parseInt(String(first), 10) : undefined,
        after: after !== undefined ? String(after) : undefined,
      };

      const connection = await ctx.dataSources.cardService.findAllPaginated(
        Object.keys(filter).length > 0 ? filter : undefined,
        pagination
      );
      res.json(serializeCard(connection));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /cards/stats:
 *   get:
 *     summary: カード統計情報
 *     description: カードの統計情報（総数、レアリティ別、スタイル別、キャラクター別）を取得します。
 *     tags:
 *       - Cards
 *     responses:
 *       200:
 *         description: 統計情報
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCards:
 *                   type: integer
 *                 byRarity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rarity:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byStyleType:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       styleType:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 byCharacter:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       characterName:
 *                         type: string
 *                       count:
 *                         type: integer
 */
cardRouter.get(
  '/stats',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const stats = await ctx.dataSources.cardService.getStats();
      res.json(serializeCard(stats));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /cards/{id}:
 *   get:
 *     summary: カード取得（ID指定）
 *     description: IDを指定してカードを取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: カードID
 *     responses:
 *       200:
 *         description: カード情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
cardRouter.get(
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
      const card = await ctx.dataSources.cardService.findById(id);
      res.json(serializeCard(card));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /cards/name/{cardName}/{characterName}:
 *   get:
 *     summary: カード取得（カード名・キャラクター名指定）
 *     description: カード名とキャラクター名の組み合わせでカードを取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: cardName
 *         required: true
 *         schema:
 *           type: string
 *         description: カード名
 *       - in: path
 *         name: characterName
 *         required: true
 *         schema:
 *           type: string
 *         description: キャラクター名
 *     responses:
 *       200:
 *         description: カード情報
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
cardRouter.get(
  '/name/:cardName/:characterName',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const { cardName, characterName } = req.params;
      if (!cardName || !characterName) {
        res.status(400).json({
          error: {
            code: 'BAD_USER_INPUT',
            message: 'カード名とキャラクター名は必須です',
          },
        });
        return;
      }
      const card = await ctx.dataSources.cardService.findByName(
        cardName,
        characterName
      );
      if (!card) {
        throw new NotFoundError(
          `Card "${cardName}" (${characterName}) not found`
        );
      }
      res.json(serializeCard(card));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /card-details/{cardId}:
 *   get:
 *     summary: カード詳細取得（カードID指定）
 *     description: カードIDを指定してカード詳細情報を取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: カードID
 *     responses:
 *       200:
 *         description: カード詳細情報
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: 見つかりません
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const cardDetailRouter = Router();

cardDetailRouter.get(
  '/:cardId',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const cardId = parseInt(req.params.cardId ?? '', 10);
      if (isNaN(cardId)) {
        res.status(400).json({
          error: { code: 'BAD_USER_INPUT', message: '無効なカードIDです' },
        });
        return;
      }
      const detail =
        await ctx.dataSources.cardDetailService.findByCardId(cardId);
      res.json(serializeCard(detail));
    } catch (err) {
      next(err);
    }
  })
);

/**
 * @openapi
 * /accessories/{cardId}:
 *   get:
 *     summary: アクセサリー一覧取得（カードID指定）
 *     description: カードIDを指定してアクセサリー一覧を取得します。
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: cardId
 *         required: true
 *         schema:
 *           type: integer
 *         description: カードID
 *     responses:
 *       200:
 *         description: アクセサリー一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
export const accessoryRouter = Router();

accessoryRouter.get(
  '/:cardId',
  asyncHandler(async (req, res, next) => {
    try {
      const ctx = createContext(req);
      const cardId = parseInt(req.params.cardId ?? '', 10);
      if (isNaN(cardId)) {
        res.status(400).json({
          error: { code: 'BAD_USER_INPUT', message: '無効なカードIDです' },
        });
        return;
      }
      const accessories =
        await ctx.dataSources.accessoryService.findByCardId(cardId);
      res.json(serializeCard(accessories));
    } catch (err) {
      next(err);
    }
  })
);
