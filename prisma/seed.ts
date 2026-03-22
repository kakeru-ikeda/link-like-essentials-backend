import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skillEffectKeywords: { effectType: string; keyword: string; displayOrder: number }[] =
  [
    // HEART_CAPTURE
    { effectType: 'HEART_CAPTURE', keyword: 'スキルハートを獲得', displayOrder: 0 },
    { effectType: 'HEART_CAPTURE', keyword: 'ビートハート\\d+回分のスキルハートを獲得', displayOrder: 1 },
    // WIDE_HEART
    { effectType: 'WIDE_HEART', keyword: 'ハート上限を\\+\\d+', displayOrder: 0 },
    { effectType: 'WIDE_HEART', keyword: 'ハート上限[^\\n]*?を増加', displayOrder: 1 },
    // LOVE_ATTRACT
    { effectType: 'LOVE_ATTRACT', keyword: '獲得するLOVEを\\+\\d+%', displayOrder: 0 },
    { effectType: 'LOVE_ATTRACT', keyword: 'ラブアトラクト効果を発動', displayOrder: 1 },
    { effectType: 'LOVE_ATTRACT', keyword: '獲得するLOVE[^\\n]*?を増加', displayOrder: 2 },
    // VOLTAGE_GAIN
    { effectType: 'VOLTAGE_GAIN', keyword: 'ボルテージPt.を\\+\\d+', displayOrder: 0 },
    { effectType: 'VOLTAGE_GAIN', keyword: 'ボルテージPt.を獲得', displayOrder: 1 },
    { effectType: 'VOLTAGE_GAIN', keyword: 'ボルテージPt\\.[^\\n]*?を増加', displayOrder: 2 },
    // HEART_BOOST
    { effectType: 'HEART_BOOST', keyword: 'スキルハート獲得効果による獲得数を\\+\\d+%', displayOrder: 0 },
    { effectType: 'HEART_BOOST', keyword: 'スキルハート獲得効果による獲得数を増加', displayOrder: 1 },
    // WIDE_HEART_BOOST
    { effectType: 'WIDE_HEART_BOOST', keyword: 'ハート上限個数増加効果を\\+\\d+%', displayOrder: 0 },
    { effectType: 'WIDE_HEART_BOOST', keyword: 'ハート上限増加効果を\\+\\d+%', displayOrder: 1 },
    // ATTRACT_BOOST
    { effectType: 'ATTRACT_BOOST', keyword: 'ラブアトラクト効果を\\+\\d+%', displayOrder: 0 },
    // VOLTAGE_BOOST
    { effectType: 'VOLTAGE_BOOST', keyword: 'ボルテージゲイン効果を\\+\\d+%', displayOrder: 0 },
    // VIBES
    { effectType: 'VIBES', keyword: 'ビートハートの出現個数を\\+\\d+', displayOrder: 0 },
    { effectType: 'VIBES', keyword: 'ビートハートの出現個数を増加', displayOrder: 1 },
    // AMBIENCE
    { effectType: 'AMBIENCE', keyword: 'ムード値を', displayOrder: 0 },
    // MENTAL_RECOVER
    { effectType: 'MENTAL_RECOVER', keyword: 'メンタルを最大値の\\d+%回復', displayOrder: 0 },
    { effectType: 'MENTAL_RECOVER', keyword: 'メンタルを\\d+%回復', displayOrder: 1 },
    // MENTAL_PROTECT
    { effectType: 'MENTAL_PROTECT', keyword: 'メンタル自然減少を無効', displayOrder: 0 },
    { effectType: 'MENTAL_PROTECT', keyword: 'メンタルダメージを無効', displayOrder: 1 },
    { effectType: 'MENTAL_PROTECT', keyword: 'メンタルの最大値の割合分のダメージを無効', displayOrder: 2 },
    // MENTAL_GUARD
    { effectType: 'MENTAL_GUARD', keyword: 'メンタル直接ダメージを無効', displayOrder: 0 },
    // RESHUFFLE
    { effectType: 'RESHUFFLE', keyword: 'シャッフル', displayOrder: 0 },
    { effectType: 'RESHUFFLE', keyword: '手札をすべて捨てて', displayOrder: 1 },
    { effectType: 'RESHUFFLE', keyword: '手札を全て捨てて', displayOrder: 2 },
    // EXTEND_HAND
    { effectType: 'EXTEND_HAND', keyword: '手札の上限枚数を\\d+枚増加', displayOrder: 0 },
    { effectType: 'EXTEND_HAND', keyword: '手札の枚数上限を\\d+枚増加', displayOrder: 1 },
    // SEARCH
    { effectType: 'SEARCH', keyword: 'ドローする確率大幅アップ', displayOrder: 0 },
    // BLESSING
    { effectType: 'BLESSING', keyword: 'デッキ内の.+の消費AP-\\d+', displayOrder: 0 },
    { effectType: 'BLESSING', keyword: 'デッキ内の.+の消費APを-\\d+', displayOrder: 1 },
    { effectType: 'BLESSING', keyword: '手札の(?!このスキル).*の消費AP-\\d+', displayOrder: 2 },
    { effectType: 'BLESSING', keyword: '手札の(?!このスキル).*の消費APを-\\d+', displayOrder: 3 },
    // IMITATION
    { effectType: 'IMITATION', keyword: 'カードがステージにセットされ', displayOrder: 0 },
    // AP_GAIN
    { effectType: 'AP_GAIN', keyword: 'APを\\d+回復', displayOrder: 0 },
    // HEAT_UP
    { effectType: 'HEAT_UP', keyword: 'AP回復速度を+\\d+%増加', displayOrder: 0 },
    { effectType: 'HEAT_UP', keyword: 'AP回復速度を+', displayOrder: 1 },
    // BELIEF
    { effectType: 'BELIEF', keyword: 'メンタルダウンしなくなり', displayOrder: 0 },
    // IGNITION
    { effectType: 'IGNITION', keyword: 'イグニッションモード', displayOrder: 0 },
  ];

const traitEffectKeywords: { effectType: string; keyword: string; displayOrder: number }[] =
  [
    // HEART_COLLECT
    { effectType: 'HEART_COLLECT', keyword: 'ハートコレクト', displayOrder: 0 },
    { effectType: 'HEART_COLLECT', keyword: 'ハートを\\d+個回収したとき', displayOrder: 1 },
    { effectType: 'HEART_COLLECT', keyword: 'ハートを\\d+個回収した時', displayOrder: 2 },
    { effectType: 'HEART_COLLECT', keyword: 'ハートを\\d+個回収する', displayOrder: 3 },
    { effectType: 'HEART_COLLECT', keyword: 'ハートを\\d+個回収し', displayOrder: 4 },
    { effectType: 'HEART_COLLECT', keyword: 'ハートを\\d+個獲得したとき', displayOrder: 5 },
    // ENCORE
    { effectType: 'ENCORE', keyword: 'アンコール', displayOrder: 0 },
    { effectType: 'ENCORE', keyword: 'スキル使用時、山札に戻る', displayOrder: 1 },
    // SHOT
    { effectType: 'SHOT', keyword: 'ショット', displayOrder: 0 },
    { effectType: 'SHOT', keyword: 'スキルを\\d+回使用する', displayOrder: 1 },
    { effectType: 'SHOT', keyword: 'スキル使用時、\\d+回まで', displayOrder: 2 },
    { effectType: 'SHOT', keyword: 'スキル使用時\\d+回まで', displayOrder: 3 },
    // DRAW
    { effectType: 'DRAW', keyword: '\\d+～\\d+セクション目でドローした時', displayOrder: 0 },
    { effectType: 'DRAW', keyword: 'ドローしたとき', displayOrder: 1 },
    { effectType: 'DRAW', keyword: 'ドローした時', displayOrder: 2 },
    { effectType: 'DRAW', keyword: 'ドローしたセクションの間', displayOrder: 3 },
    { effectType: 'DRAW', keyword: 'までにドローした時', displayOrder: 4 },
    { effectType: 'DRAW', keyword: '以降にドローした時', displayOrder: 5 },
    { effectType: 'DRAW', keyword: 'セクションでドローした時', displayOrder: 6 },
    // AP_REDUCE
    { effectType: 'AP_REDUCE', keyword: 'APレデュース', displayOrder: 0 },
    { effectType: 'AP_REDUCE', keyword: 'このスキルの消費AP-\\d+', displayOrder: 1 },
    { effectType: 'AP_REDUCE', keyword: 'このスキルの消費APを-\\d+', displayOrder: 2 },
    // AP_SUPPORT
    { effectType: 'AP_SUPPORT', keyword: 'APサポート', displayOrder: 0 },
    { effectType: 'AP_SUPPORT', keyword: 'デッキ内の.+の消費AP-\\d+', displayOrder: 1 },
    { effectType: 'AP_SUPPORT', keyword: 'デッキ内の.+の消費APを-\\d+', displayOrder: 2 },
    // INSTANCE
    { effectType: 'INSTANCE', keyword: 'インスタンス', displayOrder: 0 },
    { effectType: 'INSTANCE', keyword: 'デッキから除外され', displayOrder: 1 },
    // IMMORTAL
    { effectType: 'IMMORTAL', keyword: 'インモータル', displayOrder: 0 },
    { effectType: 'IMMORTAL', keyword: 'デッキから除外されない', displayOrder: 1 },
    // INTERPRETATION
    { effectType: 'INTERPRETATION', keyword: 'インタープリテーション', displayOrder: 0 },
    { effectType: 'INTERPRETATION', keyword: 'ムードによる効果増加量を上昇させ', displayOrder: 1 },
    // ACCUMULATE
    { effectType: 'ACCUMULATE', keyword: 'アキューミュレイト', displayOrder: 0 },
    { effectType: 'ACCUMULATE', keyword: '使用する度に', displayOrder: 1 },
    // OVER_SECTION
    { effectType: 'OVER_SECTION', keyword: 'オーバーセクション', displayOrder: 0 },
    { effectType: 'OVER_SECTION', keyword: '手札にある状態でセクションが変わる', displayOrder: 1 },
    // ALTERNATE_IGNITION
    { effectType: 'ALTERNATE_IGNITION', keyword: 'オルタネイト：イグニッション', displayOrder: 0 },
    { effectType: 'ALTERNATE_IGNITION', keyword: 'イグニッションモード', displayOrder: 1 },
    // CHAIN
    { effectType: 'CHAIN', keyword: 'チェイン', displayOrder: 0 },
    { effectType: 'CHAIN', keyword: 'スキル使用後、ドローされる確率が増加', displayOrder: 1 },
    { effectType: 'CHAIN', keyword: 'スキル使用後、ドローされる確率が大幅に増加', displayOrder: 2 },
    { effectType: 'CHAIN', keyword: 'スキルを使用した後、ドローされる確率が増加', displayOrder: 3 },
    { effectType: 'CHAIN', keyword: 'スキルを使用した後、ドローされる確率が大幅に増加', displayOrder: 4 },
    { effectType: 'CHAIN', keyword: 'スキルを使用した際、ドローされる確率が増加する', displayOrder: 5 },
    { effectType: 'CHAIN', keyword: 'スキルを使用した際、ドローされる確率が大幅に増加する', displayOrder: 6 },
    // FAVORITE
    { effectType: 'FAVORITE', keyword: 'フェイバリット', displayOrder: 0 },
    { effectType: 'FAVORITE', keyword: '\\d+～\\d+セクション目でドローされる確率が大幅に増加', displayOrder: 1 },
    { effectType: 'FAVORITE', keyword: '\\d+～\\d+セクション目でドローされる確率が増加', displayOrder: 2 },
    { effectType: 'FAVORITE', keyword: '\\d+～\\d+セクションでドローされる確率が大幅に増加', displayOrder: 3 },
    { effectType: 'FAVORITE', keyword: '\\d+～\\d+セクションでドローされる確率が増加', displayOrder: 4 },
    { effectType: 'FAVORITE', keyword: '\\d+セクション目でドローされる確率が大幅に増加', displayOrder: 5 },
    { effectType: 'FAVORITE', keyword: '\\d+セクション目でドローされる確率が増加', displayOrder: 6 },
    { effectType: 'FAVORITE', keyword: '\\d+セクションでドローされる確率が大幅に増加', displayOrder: 7 },
    { effectType: 'FAVORITE', keyword: '\\d+セクションでドローされる確率が増加', displayOrder: 8 },
    { effectType: 'FAVORITE', keyword: 'ドローされる確率が大幅に増加する', displayOrder: 9 },
    // REINFORCE
    { effectType: 'REINFORCE', keyword: 'リインフォース', displayOrder: 0 },
    { effectType: 'REINFORCE', keyword: 'スキル効果値が増加', displayOrder: 1 },
    { effectType: 'REINFORCE', keyword: 'スキルの効果値が増加', displayOrder: 2 },
    { effectType: 'REINFORCE', keyword: 'スキル効果量が増加', displayOrder: 3 },
    { effectType: 'REINFORCE', keyword: 'スキルの効果量が増加', displayOrder: 4 },
    { effectType: 'REINFORCE', keyword: 'スキル効果量を\\d+%増幅', displayOrder: 5 },
    // UN_DRAW
    { effectType: 'UN_DRAW', keyword: 'ドローされない', displayOrder: 0 },
    { effectType: 'UN_DRAW', keyword: 'ドローされず', displayOrder: 1 },
  ];

async function main(): Promise<void> {
  console.log('Seeding effect keywords...');

  // 既存データを削除してから挿入（冪等性確保）
  await prisma.skillEffectKeyword.deleteMany({});
  await prisma.traitEffectKeyword.deleteMany({});

  await prisma.skillEffectKeyword.createMany({ data: skillEffectKeywords });
  console.log(`Inserted ${skillEffectKeywords.length} skill effect keywords`);

  await prisma.traitEffectKeyword.createMany({ data: traitEffectKeywords });
  console.log(`Inserted ${traitEffectKeywords.length} trait effect keywords`);

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
