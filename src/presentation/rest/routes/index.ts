import { Router } from 'express';

import { accessoryRouter, cardDetailRouter, cardRouter } from './cardRoutes';
import { effectKeywordRouter } from './effectKeywordRoutes';
import {
  gradeChallengeByTitleRouter,
  gradeChallengeRouter,
} from './gradeChallengeRoutes';
import {
  liveGrandPrixByNameRouter,
  liveGrandPrixRouter,
} from './liveGrandPrixRoutes';
import { songByNameRouter, songRouter } from './songRoutes';
import { traitAnalysisRouter } from './traitAnalysisRoutes';

const apiRouter = Router();

apiRouter.use('/cards', cardRouter);
apiRouter.use('/card-details', cardDetailRouter);
apiRouter.use('/accessories', accessoryRouter);
apiRouter.use('/songs/name', songByNameRouter);
apiRouter.use('/songs', songRouter);
apiRouter.use('/live-grand-prix/name', liveGrandPrixByNameRouter);
apiRouter.use('/live-grand-prix', liveGrandPrixRouter);
apiRouter.use('/grade-challenges/title', gradeChallengeByTitleRouter);
apiRouter.use('/grade-challenges', gradeChallengeRouter);
apiRouter.use('/effect-keywords', effectKeywordRouter);
apiRouter.use('/trait-analysis', traitAnalysisRouter);

export { apiRouter };
