import type { CardDetail } from './CardDetail';

export interface Card {
    id: number;
    rarity: string | null;
    limited: string | null;
    cardName: string;
    cardUrl: string | null;
    characterName: string;
    styleType: string | null;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    detail?: CardDetail;
}
