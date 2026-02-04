export interface TraitAnalysisBase {
  id: number;
  cardId: number | null;
  accessoryId: number | null;
  section1: boolean;
  section2: boolean;
  section3: boolean;
  section4: boolean;
  section5: boolean;
  sectionFever: boolean;
  conditionDetail: Record<string, unknown> | null;
  analyzedAt: Date | null;
}

export interface HeartCollectAnalysis extends TraitAnalysisBase {}

export interface UnDrawAnalysis extends TraitAnalysisBase {}
