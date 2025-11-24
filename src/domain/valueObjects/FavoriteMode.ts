export enum FavoriteMode {
  HAPPY = 'ハッピー',
  MELLOW = 'メロウ',
  NEUTRAL = 'ニュートラル',
  NONE = '--',
}

export type FavoriteModeValue =
  (typeof FavoriteMode)[keyof typeof FavoriteMode];
