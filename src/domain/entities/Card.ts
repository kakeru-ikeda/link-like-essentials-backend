import type { CardDetail } from './CardDetail';

export interface Card {
    id: number;
    rarity: string | null;
    limited: string | null;
    cardName: string;
    cardUrl: string | null;
    characterName: string;
    styleType: string | null;
    isLocked: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    detail?: CardDetail;
}
