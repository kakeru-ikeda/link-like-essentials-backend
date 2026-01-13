export enum LimitedType {
  PERMANENT = '恒常',
  LIMITED = '限定',
  SPRING_LIMITED = '春限定',
  SUMMER_LIMITED = '夏限定',
  AUTUMN_LIMITED = '秋限定',
  WINTER_LIMITED = '冬限定',
  BIRTHDAY_LIMITED = '誕限定',
  LEG_LIMITED = 'LEG限定',
  BATTLE_LIMITED = '撃限定',
  PARTY_LIMITED = '宴限定',
  ACTIVITY_LIMITED = '活限定',
  BANGDREAM_LIMITED = '団限定',
  GRADUATE_LIMITED = '卒限定',
  LOGIN_BONUS = 'ログボ',
  REWARD = '報酬',
}

export type LimitedTypeValue = (typeof LimitedType)[keyof typeof LimitedType];
