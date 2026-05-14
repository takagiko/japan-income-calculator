// 給与所得控除 令和7年分（所得税法 第28条第3項）
// 「収入が upToIncome 以下」の該当する収入区分を上から探し、 収入 × rate + flatAddition で控除額を求める。

export type DeductionBracket = {
  upToIncome: number;       // この収入金額以下が対象（Infinity は「上限なし」の意）
  rate: number;             // 給与収入に掛ける率（0 のときは定額）
  flatAddition: number;     // 加算（または減算）額
  description: string;      // 表示用の説明
};

export const employmentIncomeDeductionBrackets2025: DeductionBracket[] = [
  { upToIncome: 1_625_000, rate: 0,    flatAddition:   550_000, description: '一律 55万円' },
  { upToIncome: 1_800_000, rate: 0.40, flatAddition:  -100_000, description: '収入×40% − 10万円' },
  { upToIncome: 3_600_000, rate: 0.30, flatAddition:    80_000, description: '収入×30% + 8万円' },
  { upToIncome: 6_600_000, rate: 0.20, flatAddition:   440_000, description: '収入×20% + 44万円' },
  { upToIncome: 8_500_000, rate: 0.10, flatAddition: 1_100_000, description: '収入×10% + 110万円' },
  { upToIncome: Infinity,  rate: 0,    flatAddition: 1_950_000, description: '上限 195万円' },
];

export const employmentIncomeDeductionReference = '所得税法 第28条第3項（令和7年分）';
export const employmentIncomeDeductionReferenceUrl =
  'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm';
