// 配偶者控除・配偶者特別控除 令和7年分
// 所得税法 第83条・第83条の2 / 地方税法 第34条第1項第10号・第10号の2
//
// 「本人の合計所得」と「配偶者の合計所得」の組み合わせで控除額が決まる二次元テーブル。
// 本人合計所得が 1,000万円超になると一切適用されない。

export type SpouseDeductionAmount = {
  forIncomeTax: number;
  forResidenceTax: number;
};

export type TaxpayerIncomeBucket = '〜900万' | '900〜950万' | '950〜1000万' | '1000万超';

export type SpouseDeductionBracket = {
  spouseTotalIncomeUpTo: number;  // 配偶者の合計所得がこの金額以下
  description: string;
  amounts: Record<TaxpayerIncomeBucket, SpouseDeductionAmount>;
};

const zero: SpouseDeductionAmount = { forIncomeTax: 0, forResidenceTax: 0 };

export const spouseDeductionBrackets2025: SpouseDeductionBracket[] = [
  {
    spouseTotalIncomeUpTo: 480_000,
    description: '配偶者控除（配偶者の合計所得 ≤ 48万円）',
    amounts: {
      '〜900万':     { forIncomeTax: 380_000, forResidenceTax: 330_000 },
      '900〜950万':  { forIncomeTax: 260_000, forResidenceTax: 220_000 },
      '950〜1000万': { forIncomeTax: 130_000, forResidenceTax: 110_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 950_000,
    description: '配偶者特別控除（配偶者所得 48万超〜95万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 380_000, forResidenceTax: 330_000 },
      '900〜950万':  { forIncomeTax: 260_000, forResidenceTax: 220_000 },
      '950〜1000万': { forIncomeTax: 130_000, forResidenceTax: 110_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_000_000,
    description: '配偶者特別控除（95万超〜100万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 360_000, forResidenceTax: 330_000 },
      '900〜950万':  { forIncomeTax: 240_000, forResidenceTax: 220_000 },
      '950〜1000万': { forIncomeTax: 120_000, forResidenceTax: 110_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_050_000,
    description: '配偶者特別控除（100万超〜105万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 310_000, forResidenceTax: 310_000 },
      '900〜950万':  { forIncomeTax: 210_000, forResidenceTax: 210_000 },
      '950〜1000万': { forIncomeTax: 110_000, forResidenceTax: 110_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_100_000,
    description: '配偶者特別控除（105万超〜110万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 260_000, forResidenceTax: 260_000 },
      '900〜950万':  { forIncomeTax: 180_000, forResidenceTax: 180_000 },
      '950〜1000万': { forIncomeTax:  90_000, forResidenceTax:  90_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_150_000,
    description: '配偶者特別控除（110万超〜115万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 210_000, forResidenceTax: 210_000 },
      '900〜950万':  { forIncomeTax: 140_000, forResidenceTax: 140_000 },
      '950〜1000万': { forIncomeTax:  70_000, forResidenceTax:  70_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_200_000,
    description: '配偶者特別控除（115万超〜120万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 160_000, forResidenceTax: 160_000 },
      '900〜950万':  { forIncomeTax: 110_000, forResidenceTax: 110_000 },
      '950〜1000万': { forIncomeTax:  60_000, forResidenceTax:  60_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_250_000,
    description: '配偶者特別控除（120万超〜125万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 110_000, forResidenceTax: 110_000 },
      '900〜950万':  { forIncomeTax:  80_000, forResidenceTax:  80_000 },
      '950〜1000万': { forIncomeTax:  40_000, forResidenceTax:  40_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_300_000,
    description: '配偶者特別控除（125万超〜130万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 60_000, forResidenceTax: 60_000 },
      '900〜950万':  { forIncomeTax: 40_000, forResidenceTax: 40_000 },
      '950〜1000万': { forIncomeTax: 20_000, forResidenceTax: 20_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: 1_330_000,
    description: '配偶者特別控除（130万超〜133万以下）',
    amounts: {
      '〜900万':     { forIncomeTax: 30_000, forResidenceTax: 30_000 },
      '900〜950万':  { forIncomeTax: 20_000, forResidenceTax: 20_000 },
      '950〜1000万': { forIncomeTax: 10_000, forResidenceTax: 10_000 },
      '1000万超':    zero,
    },
  },
  {
    spouseTotalIncomeUpTo: Infinity,
    description: '配偶者の合計所得 133万円超（適用なし）',
    amounts: { '〜900万': zero, '900〜950万': zero, '950〜1000万': zero, '1000万超': zero },
  },
];

export const spouseDeductionReference = '配偶者控除・配偶者特別控除（所得税法 第83条・83条の2 / 地方税法 第34条）';
