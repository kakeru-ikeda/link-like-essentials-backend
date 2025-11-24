import type { Card } from './Card';

export interface Accessory {
    id: number;
    cardId: number;
    parentType: string;
    name: string;
    ap: string | null;
    effect: string | null;
    traitName: string | null;
    traitEffect: string | null;
    displayOrder: number;
    isLocked: boolean;
    createdAt: Date;
    updatedAt: Date;
    card?: Card;
}
