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
    displayOrder: number | null;
    isLocked: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    card?: Card;
}
