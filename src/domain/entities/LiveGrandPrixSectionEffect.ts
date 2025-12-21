export interface LiveGrandPrixSectionEffect {
  id: number;
  detailId: number;
  sectionName: string;
  effect: string;
  sectionOrder: number;
  isLocked: boolean | null;
  createdAt: Date | null;
}
