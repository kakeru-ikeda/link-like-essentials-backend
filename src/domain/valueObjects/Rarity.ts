export enum Rarity {
  UR = 'UR',
  SR = 'SR',
  R = 'R',
  DR = 'DR',
  BR = 'BR',
  LR = 'LR',
}

export type RarityType = keyof typeof Rarity;
