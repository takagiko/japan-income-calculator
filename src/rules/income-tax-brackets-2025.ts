// 所得税の速算表 令和7年分（所得税法 第89条第1項）
// 累進課税。実務では「課税所得 × 税率 − 控除額」で速算する。
//
// 復興特別所得税: 平成25年〜令和19年まで、基準所得税額に 2.1% を上乗せ。

export type IncomeTaxBracket = {
  upToTaxableIncome: number;  // 課税所得がこの金額以下
  rate: number;               // 税率
  deduction: number;          // 速算表の控除額（差し引いて累進を表現）
  description: string;
};

export const incomeTaxBrackets2025: IncomeTaxBracket[] = [
  { upToTaxableIncome:  1_950_000, rate: 0.05, deduction:         0, description: '195万円以下: 5%' },
  { upToTaxableIncome:  3_300_000, rate: 0.10, deduction:    97_500, description: '195万超〜330万以下: 10%' },
  { upToTaxableIncome:  6_950_000, rate: 0.20, deduction:   427_500, description: '330万超〜695万以下: 20%' },
  { upToTaxableIncome:  9_000_000, rate: 0.23, deduction:   636_000, description: '695万超〜900万以下: 23%' },
  { upToTaxableIncome: 18_000_000, rate: 0.33, deduction: 1_536_000, description: '900万超〜1,800万以下: 33%' },
  { upToTaxableIncome: 40_000_000, rate: 0.40, deduction: 2_796_000, description: '1,800万超〜4,000万以下: 40%' },
  { upToTaxableIncome: Infinity,   rate: 0.45, deduction: 4_796_000, description: '4,000万超: 45%' },
];

export const incomeTaxBracketsReference = '所得税の速算表（所得税法 第89条第1項、令和7年分）';
export const incomeTaxBracketsReferenceUrl =
  'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm';
export const reconstructionTaxRate2025 = 0.021;
export const reconstructionTaxReference = '復興特別所得税（東日本大震災からの復興のための施策を実施するために必要な財源の確保に関する特別措置法）';
export const reconstructionTaxReferenceUrl =
  'https://www.nta.go.jp/publication/pamph/shotoku/fukko_tokubetsu/index.htm';
export const incomeTaxMechanismReference = '所得税のしくみ（タックスアンサー No.1000）';
export const incomeTaxMechanismReferenceUrl =
  'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1000.htm';
