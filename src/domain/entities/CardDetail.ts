import type { Card } from './Card';
import type { Accessory } from './Accessory';

export interface CardDetail {
    id: number;
    cardId: number;
    favoriteMode: string | null;
    acquisitionMethod: string | null;
    awakeBeforeUrl: string | null;
    awakeAfterUrl: string | null;
    awakeBeforeStorageUrl: string | null;
    awakeAfterStorageUrl: string | null;
    smileMaxLevel: string | null;
    pureMaxLevel: string | null;
    coolMaxLevel: string | null;
    mentalMaxLevel: string | null;
    specialAppealName: string | null;
    specialAppealAp: string | null;
    specialAppealEffect: string | null;
    skillName: string | null;
    skillAp: string | null;
    skillEffect: string | null;
    traitName: string | null;
    traitEffect: string | null;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    card?: Card;
    accessories?: Accessory[];
}
