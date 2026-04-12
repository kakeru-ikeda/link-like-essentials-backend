export enum StyleType {
  CHEERLEADER = 'チアリーダー',
  TRICKSTER = 'トリックスター',
  PERFORMER = 'パフォーマー',
  MOODMAKER = 'ムードメーカー',
}

export type StyleTypeValue = (typeof StyleType)[keyof typeof StyleType];
