import type { LiveGrandPrixDetail } from './LiveGrandPrixDetail';

export interface LiveGrandPrix {
  id: number;
  startDate: Date;
  endDate: Date;
  eventName: string;
  eventUrl: string | null;
  yearTerm: string;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  details?: LiveGrandPrixDetail[];
}
