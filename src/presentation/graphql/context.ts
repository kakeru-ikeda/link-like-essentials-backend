import type { AccessoryService } from '@/application/services/AccessoryService';
import type { CardDetailService } from '@/application/services/CardDetailService';
import type { CardService } from '@/application/services/CardService';
import type { GradeChallengeService } from '@/application/services/GradeChallengeService';
import type { HeartCollectAnalysisService } from '@/application/services/HeartCollectAnalysisService';
import type { LiveGrandPrixService } from '@/application/services/LiveGrandPrixService';
import type { SongService } from '@/application/services/SongService';
import type { UnDrawAnalysisService } from '@/application/services/UnDrawAnalysisService';
import type { AuthUser } from '@/infrastructure/auth/AuthService';

export interface GraphQLContext {
  user?: AuthUser;
  dataSources: {
    cardService: CardService;
    cardDetailService: CardDetailService;
    accessoryService: AccessoryService;
    heartCollectAnalysisService: HeartCollectAnalysisService;
    unDrawAnalysisService: UnDrawAnalysisService;
    songService: SongService;
    liveGrandPrixService: LiveGrandPrixService;
    gradeChallengeService: GradeChallengeService;
  };
}
