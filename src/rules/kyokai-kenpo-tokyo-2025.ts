// 協会けんぽ東京支部 令和7年度（令和7年3月分〜）
// - 標準報酬月額の等級表（健保・介護・厚生年金で共用、ただし厚年は floor/cap あり）
// - 健康保険料率 9.91%（労使折半）
// - 介護保険料率 1.59%（40-64歳のみ、労使折半）
// - 厚生年金保険料率 18.300%（全国統一、労使折半）

export type StandardMonthlyBracket = {
  grade: number;                      // 健保等級（1〜50）
  reportedMonthlyMin: number;         // 報酬月額の下限（以上）
  reportedMonthlyMax: number;         // 報酬月額の上限（未満）。Infinity は上限なし
  standardMonthlyRemuneration: number;
};

export const standardMonthlyBrackets2025: StandardMonthlyBracket[] = [
  { grade:  1, reportedMonthlyMin:         0, reportedMonthlyMax:    63_000, standardMonthlyRemuneration:    58_000 },
  { grade:  2, reportedMonthlyMin:    63_000, reportedMonthlyMax:    73_000, standardMonthlyRemuneration:    68_000 },
  { grade:  3, reportedMonthlyMin:    73_000, reportedMonthlyMax:    83_000, standardMonthlyRemuneration:    78_000 },
  { grade:  4, reportedMonthlyMin:    83_000, reportedMonthlyMax:    93_000, standardMonthlyRemuneration:    88_000 },
  { grade:  5, reportedMonthlyMin:    93_000, reportedMonthlyMax:   101_000, standardMonthlyRemuneration:    98_000 },
  { grade:  6, reportedMonthlyMin:   101_000, reportedMonthlyMax:   107_000, standardMonthlyRemuneration:   104_000 },
  { grade:  7, reportedMonthlyMin:   107_000, reportedMonthlyMax:   114_000, standardMonthlyRemuneration:   110_000 },
  { grade:  8, reportedMonthlyMin:   114_000, reportedMonthlyMax:   122_000, standardMonthlyRemuneration:   118_000 },
  { grade:  9, reportedMonthlyMin:   122_000, reportedMonthlyMax:   130_000, standardMonthlyRemuneration:   126_000 },
  { grade: 10, reportedMonthlyMin:   130_000, reportedMonthlyMax:   138_000, standardMonthlyRemuneration:   134_000 },
  { grade: 11, reportedMonthlyMin:   138_000, reportedMonthlyMax:   146_000, standardMonthlyRemuneration:   142_000 },
  { grade: 12, reportedMonthlyMin:   146_000, reportedMonthlyMax:   155_000, standardMonthlyRemuneration:   150_000 },
  { grade: 13, reportedMonthlyMin:   155_000, reportedMonthlyMax:   165_000, standardMonthlyRemuneration:   160_000 },
  { grade: 14, reportedMonthlyMin:   165_000, reportedMonthlyMax:   175_000, standardMonthlyRemuneration:   170_000 },
  { grade: 15, reportedMonthlyMin:   175_000, reportedMonthlyMax:   185_000, standardMonthlyRemuneration:   180_000 },
  { grade: 16, reportedMonthlyMin:   185_000, reportedMonthlyMax:   195_000, standardMonthlyRemuneration:   190_000 },
  { grade: 17, reportedMonthlyMin:   195_000, reportedMonthlyMax:   210_000, standardMonthlyRemuneration:   200_000 },
  { grade: 18, reportedMonthlyMin:   210_000, reportedMonthlyMax:   230_000, standardMonthlyRemuneration:   220_000 },
  { grade: 19, reportedMonthlyMin:   230_000, reportedMonthlyMax:   250_000, standardMonthlyRemuneration:   240_000 },
  { grade: 20, reportedMonthlyMin:   250_000, reportedMonthlyMax:   270_000, standardMonthlyRemuneration:   260_000 },
  { grade: 21, reportedMonthlyMin:   270_000, reportedMonthlyMax:   290_000, standardMonthlyRemuneration:   280_000 },
  { grade: 22, reportedMonthlyMin:   290_000, reportedMonthlyMax:   310_000, standardMonthlyRemuneration:   300_000 },
  { grade: 23, reportedMonthlyMin:   310_000, reportedMonthlyMax:   330_000, standardMonthlyRemuneration:   320_000 },
  { grade: 24, reportedMonthlyMin:   330_000, reportedMonthlyMax:   350_000, standardMonthlyRemuneration:   340_000 },
  { grade: 25, reportedMonthlyMin:   350_000, reportedMonthlyMax:   370_000, standardMonthlyRemuneration:   360_000 },
  { grade: 26, reportedMonthlyMin:   370_000, reportedMonthlyMax:   395_000, standardMonthlyRemuneration:   380_000 },
  { grade: 27, reportedMonthlyMin:   395_000, reportedMonthlyMax:   425_000, standardMonthlyRemuneration:   410_000 },
  { grade: 28, reportedMonthlyMin:   425_000, reportedMonthlyMax:   455_000, standardMonthlyRemuneration:   440_000 },
  { grade: 29, reportedMonthlyMin:   455_000, reportedMonthlyMax:   485_000, standardMonthlyRemuneration:   470_000 },
  { grade: 30, reportedMonthlyMin:   485_000, reportedMonthlyMax:   515_000, standardMonthlyRemuneration:   500_000 },
  { grade: 31, reportedMonthlyMin:   515_000, reportedMonthlyMax:   545_000, standardMonthlyRemuneration:   530_000 },
  { grade: 32, reportedMonthlyMin:   545_000, reportedMonthlyMax:   575_000, standardMonthlyRemuneration:   560_000 },
  { grade: 33, reportedMonthlyMin:   575_000, reportedMonthlyMax:   605_000, standardMonthlyRemuneration:   590_000 },
  { grade: 34, reportedMonthlyMin:   605_000, reportedMonthlyMax:   635_000, standardMonthlyRemuneration:   620_000 },
  { grade: 35, reportedMonthlyMin:   635_000, reportedMonthlyMax:   665_000, standardMonthlyRemuneration:   650_000 },
  { grade: 36, reportedMonthlyMin:   665_000, reportedMonthlyMax:   695_000, standardMonthlyRemuneration:   680_000 },
  { grade: 37, reportedMonthlyMin:   695_000, reportedMonthlyMax:   730_000, standardMonthlyRemuneration:   710_000 },
  { grade: 38, reportedMonthlyMin:   730_000, reportedMonthlyMax:   770_000, standardMonthlyRemuneration:   750_000 },
  { grade: 39, reportedMonthlyMin:   770_000, reportedMonthlyMax:   810_000, standardMonthlyRemuneration:   790_000 },
  { grade: 40, reportedMonthlyMin:   810_000, reportedMonthlyMax:   855_000, standardMonthlyRemuneration:   830_000 },
  { grade: 41, reportedMonthlyMin:   855_000, reportedMonthlyMax:   905_000, standardMonthlyRemuneration:   880_000 },
  { grade: 42, reportedMonthlyMin:   905_000, reportedMonthlyMax:   955_000, standardMonthlyRemuneration:   930_000 },
  { grade: 43, reportedMonthlyMin:   955_000, reportedMonthlyMax: 1_005_000, standardMonthlyRemuneration:   980_000 },
  { grade: 44, reportedMonthlyMin: 1_005_000, reportedMonthlyMax: 1_055_000, standardMonthlyRemuneration: 1_030_000 },
  { grade: 45, reportedMonthlyMin: 1_055_000, reportedMonthlyMax: 1_115_000, standardMonthlyRemuneration: 1_090_000 },
  { grade: 46, reportedMonthlyMin: 1_115_000, reportedMonthlyMax: 1_175_000, standardMonthlyRemuneration: 1_150_000 },
  { grade: 47, reportedMonthlyMin: 1_175_000, reportedMonthlyMax: 1_235_000, standardMonthlyRemuneration: 1_210_000 },
  { grade: 48, reportedMonthlyMin: 1_235_000, reportedMonthlyMax: 1_295_000, standardMonthlyRemuneration: 1_270_000 },
  { grade: 49, reportedMonthlyMin: 1_295_000, reportedMonthlyMax: 1_355_000, standardMonthlyRemuneration: 1_330_000 },
  { grade: 50, reportedMonthlyMin: 1_355_000, reportedMonthlyMax: Infinity,  standardMonthlyRemuneration: 1_390_000 },
];

// 料率（労使折半なので本人負担は半分）
export const healthInsuranceRate2025 = 0.0991;       // 健康保険料率
export const nursingCareInsuranceRate2025 = 0.0159;  // 介護保険料率（40-64歳のみ加算）
export const pensionInsuranceRate2025 = 0.183;       // 厚生年金保険料率

// 厚生年金は標準報酬月額の上下限あり（厚年1等級=88,000、厚年32等級=650,000）
export const pensionStandardRemunerationFloor2025 = 88_000;
export const pensionStandardRemunerationCap2025 = 650_000;

// 標準賞与額の上限
// - 健保: 年間累計（4月1日〜翌3月31日）5,730,000円
// - 厚年: 1回あたり 1,500,000円
export const standardBonusAnnualCapHealth2025 = 5_730_000;
export const standardBonusPerOccurrenceCapPension2025 = 1_500_000;

export const kyokaiKenpoTokyoReference = '協会けんぽ東京支部 令和7年度料率（令和7年3月分〜）';
export const pensionReference = '厚生年金保険料率 令和7年度（厚生労働省、全国一律 18.300%）';
