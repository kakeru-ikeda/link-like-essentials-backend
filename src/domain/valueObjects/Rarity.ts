export enum Rarity {
  mUR = 'mUR',
  UR = 'UR',
  mSR = 'mSR',
  SR = 'SR',
  R = 'R',
  DR = 'DR',
  BR = 'BR',
  LR = 'LR',
}

export type RarityType = keyof typeof Rarity;
