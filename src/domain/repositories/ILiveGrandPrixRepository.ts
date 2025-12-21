import type { LiveGrandPrix } from '../entities/LiveGrandPrix';

export interface LiveGrandPrixFilterInput {
  yearTerm?: string;
  eventName?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
}

export interface LiveGrandPrixStats {
  totalEvents: number;
  byYearTerm: Array<{ yearTerm: string; count: number }>;
}

export interface ILiveGrandPrixRepository {
  findById(id: number): Promise<LiveGrandPrix | null>;
  findByEventName(eventName: string): Promise<LiveGrandPrix | null>;
  findAll(filter?: LiveGrandPrixFilterInput): Promise<LiveGrandPrix[]>;
  findByIds(ids: number[]): Promise<LiveGrandPrix[]>;
  findOngoing(): Promise<LiveGrandPrix[]>;
  getStats(): Promise<LiveGrandPrixStats>;
}
