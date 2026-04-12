export const CHARACTERS = [
  '日野下花帆',
  '村野さやか',
  '乙宗梢',
  '夕霧綴理',
  '大沢瑠璃乃',
  '藤島慈',
  '徒町小鈴',
  '百生吟子',
  '安養寺姫芽',
  '桂城泉',
  'セラス',
  '大賀美沙知',
] as const;

export type CharacterName = (typeof CHARACTERS)[number];
