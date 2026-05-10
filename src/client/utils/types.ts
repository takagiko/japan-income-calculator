export type Dependents = {
  general: number;                  // 一般扶養親族
  specific: number;                 // 特定扶養親族（19-22歳）
  elderly: number;                  // 老人扶養親族（70歳以上、非同居）
  livingWithElderlyParent: number;  // 同居老親
};

export type CalcInput = {
  monthlySalary: number;            // 月給（円/月）
  summerBonus: number;              // 夏のボーナス（円、1回分）
  winterBonus: number;              // 冬のボーナス（円、1回分）
  hasNursingInsurance: boolean;     // 介護保険対象（40歳以上65歳未満）
  hasSpouse: boolean;
  spouseIncome: number;             // 配偶者の年収（円）
  dependents: Dependents;
};

// 構造化された計算内訳の 1 行（ラベル: 値）。
export type FormulaItem = {
  label: string;
  value: string;       // 表示用に整形された値（円, %, 等級 等を含む文字列）
  isResult?: boolean;  // 結果行を強調表示するか
  note?: string;       // 補足（小さい文字で右に併記）
};

export type CalcResult<T = number> = {
  value: T;
  formula: string;            // 一行サマリ（breakdown が無い場合のフォールバック）
  breakdown?: FormulaItem[];  // 構造化された内訳（あればこちらを優先表示）
  reference: string;
  steps?: { label: string; value: number; note?: string }[];
  note?: string;
};

export type DualDeduction = {
  forIncomeTax: CalcResult;
  forResidenceTax: CalcResult;
};
