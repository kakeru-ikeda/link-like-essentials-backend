export const CHARACTERS = [
  '日野下花傘',
  '村野さやか',
  '乙宗椋',
  '夕霧織理',
  '大沢琥珀乃',
  '藤島恵',
  '徃町小鈴',
  '百生朔子',
  '安養寺岬茄',
  '柊城泉',
  'セラス',
  '大貝美沙知',
] as const;

export type CharacterName = (typeof CHARACTERS)[number] | 'フリー' | 'フレンド';
