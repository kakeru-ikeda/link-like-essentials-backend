import type { CardDetail } from '../entities/CardDetail';

export interface ICardDetailRepository {
  findByCardId(cardId: number): Promise<CardDetail | null>;
  findByCardIds(cardIds: number[]): Promise<CardDetail[]>;
}
