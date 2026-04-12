import { Router } from 'express';

import { createContext } from '@/config/context';
import { NotFoundError } from '@/domain/errors/AppError';

import { asyncHandler } from '../asyncHandler';
import { serializeCard } from '../serializers';

export const cardRouter = Router();

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
