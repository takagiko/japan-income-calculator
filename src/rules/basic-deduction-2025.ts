// 基礎控除 令和7年分（所得税法 第86条 / 地方税法 第34条第1項第30号）
// 本人の合計所得が 2,400万円超で段階的に減り、2,500万円超で適用なし。

export type BasicDeductionBracket = {
  upToTotalIncome: number;     // 合計所得がこの金額以下
  forIncomeTax: number;        // 所得税の基礎控除額
  forResidenceTax: number;     // 住民税の基礎控除額
  description: string;
};

export const basicDeductionBrackets2025: BasicDeductionBracket[] = [
  { upToTotalIncome: 24_000_000, forIncomeTax: 480_000, forResidenceTax: 430_000, description: '合計所得 2,400万円以下' },
  { upToTotalIncome: 24_500_000, forIncomeTax: 320_000, forResidenceTax: 290_000, description: '2,400万超 2,450万以下' },
  { upToTotalIncome: 25_000_000, forIncomeTax: 160_000, forResidenceTax: 150_000, description: '2,450万超 2,500万以下' },
  { upToTotalIncome: Infinity,   forIncomeTax: 0,       forResidenceTax: 0,       description: '2,500万超（適用なし）' },
];

export const basicDeductionReference = '基礎控除（所得税法 第86条 / 地方税法 第34条）';
export const basicDeductionReferenceUrl =
  'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm';
