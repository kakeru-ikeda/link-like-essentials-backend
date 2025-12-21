import type { LiveGrandPrixDetailDTO } from './LiveGrandPrixDetailDTO';

export interface LiveGrandPrixDTO {
  id: number;
  startDate: Date;
  endDate: Date;
  eventName: string;
  eventUrl: string | null;
  yearTerm: string;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  details?: LiveGrandPrixDetailDTO[];
}

export interface LiveGrandPrixFilterInput {
  yearTerm?: string;
  eventName?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
}

export interface LiveGrandPrixStatsResult {
  totalEvents: number;
  byYearTerm: Array<{ yearTerm: string; count: number }>;
}
