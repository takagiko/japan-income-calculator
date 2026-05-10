// 扶養控除 令和7年分（所得税法 第84条 / 地方税法 第34条第1項第11号）
// 4区分。所得税と住民税で控除額が異なる。

export type DependentDeductionAmount = {
  forIncomeTax: number;
  forResidenceTax: number;
};

export const dependentDeductionAmounts2025 = {
  general:                 { forIncomeTax: 380_000, forResidenceTax: 330_000 }, // 一般扶養親族（16歳以上、特定・老人を除く）
  specific:                { forIncomeTax: 630_000, forResidenceTax: 450_000 }, // 特定扶養親族（19歳以上23歳未満）
  elderly:                 { forIncomeTax: 480_000, forResidenceTax: 380_000 }, // 老人扶養親族（70歳以上、非同居）
  livingWithElderlyParent: { forIncomeTax: 580_000, forResidenceTax: 450_000 }, // 同居老親等
} as const satisfies Record<string, DependentDeductionAmount>;

export const dependentDeductionReference = '扶養控除（所得税法 第84条 / 地方税法 第34条）';
