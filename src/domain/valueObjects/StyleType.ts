export enum StyleType {
  CHEERLEADER = 'チアリーダー',
  TRICKSTER = 'トリックスター',
  PERFORMER = 'パフォーマー',
  MOODMAKER = 'ムードメーカー',
  MOODOMAKER = 'ムードーメーカー', // 誤字版も対応
}

export type StyleTypeValue = (typeof StyleType)[keyof typeof StyleType];
