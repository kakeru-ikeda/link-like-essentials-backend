import type { Card } from '@/domain/entities/Card';

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface CardEdge {
  node: Card;
  cursor: string;
}

export interface CardConnection {
  edges: CardEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface PaginationInput {
  first?: number;
  after?: string;
}
