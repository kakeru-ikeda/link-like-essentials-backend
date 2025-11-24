import type { CardService } from '@/application/services/CardService';
import type { CardDetailService } from '@/application/services/CardDetailService';
import type { AccessoryService } from '@/application/services/AccessoryService';
import type { AuthUser } from '@/infrastructure/auth/AuthService';

export interface GraphQLContext {
    user?: AuthUser;
    dataSources: {
        cardService: CardService;
        cardDetailService: CardDetailService;
        accessoryService: AccessoryService;
    };
}
