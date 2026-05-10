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

export type CalcResult<T = number> = {
  value: T;
  formula: string;
  reference: string;
  steps?: { label: string; value: number; note?: string }[];
  note?: string;  // 補足説明（展開時に「備考」として表示）
};

export type DualDeduction = {
  forIncomeTax: CalcResult;
  forResidenceTax: CalcResult;
};
