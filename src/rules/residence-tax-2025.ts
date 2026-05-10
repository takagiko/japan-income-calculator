// 住民税 令和7年度（東京都標準。市町村民税 6% + 道府県民税 4%）
//
// - 所得割: 計 10%（地方税法 第314条の3、第35条）
// - 均等割: 市町村 3,000円 + 道府県 1,000円（令和6年度〜）+ 森林環境税(国税) 1,000円
//   ※ 森林環境税は本来は国税だが、住民税と同時徴収のため本ツールでは合算表示
// - 調整控除: 所得税と住民税の人的控除差を税額から差し引く（地方税法 附則 第5条）

export const residenceTaxIncomeRateMunicipal = 0.06;
export const residenceTaxIncomeRatePrefectural = 0.04;
export const residenceTaxIncomeRateTotal = 0.10;

export const residenceTaxFlatMunicipal = 3_000;
export const residenceTaxFlatPrefectural = 1_000;
export const forestEnvironmentTax = 1_000;
export const residenceTaxFlatTotal =
  residenceTaxFlatMunicipal + residenceTaxFlatPrefectural + forestEnvironmentTax;

export const adjustmentDeductionThreshold = 2_000_000;       // 200万円
export const adjustmentDeductionMinimum = 2_500;             // 高所得者向け最低保証
export const adjustmentDeductionExclusionIncome = 25_000_000; // 合計所得 2,500万超は適用なし

export const residenceTaxIncomeReference = '住民税の所得割（地方税法 第314条の3 / 第35条、東京都標準）';
export const residenceTaxFlatReference = '住民税の均等割 + 森林環境税（地方税法 第310条等、森林環境税法）令和6年度〜';
export const adjustmentDeductionReference = '調整控除（地方税法 附則 第5条）';
