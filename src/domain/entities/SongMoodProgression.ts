export interface SongMoodProgression {
  id: number;
  songId: number;
  section: string;
  progression: string;
  sectionOrder: number;
  isLocked: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
