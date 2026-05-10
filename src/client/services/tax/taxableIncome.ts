import type { CalcResult, DualDeduction } from '../../utils/types';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type TaxableIncomeResult = {
  forIncomeTax: CalcResult;
  forResidenceTax: CalcResult;
};

// 課税所得 = 給与所得 − (社会保険料控除 + 基礎控除 + 配偶者控除 + 扶養控除)
// 1,000円未満は切り捨て（所得税・住民税ともに）。
export function calcTaxableIncome(args: {
  employmentIncome: number;
  socialInsuranceTotal: number;
  basic: DualDeduction;
  spouse: DualDeduction;
  dependent: DualDeduction;
}): TaxableIncomeResult {
  const compute = (kind: 'forIncomeTax' | 'forResidenceTax'): CalcResult => {
    const basic = args.basic[kind].value;
    const spouse = args.spouse[kind].value;
    const dep = args.dependent[kind].value;
    const totalDeduction = args.socialInsuranceTotal + basic + spouse + dep;
    const before = Math.max(0, args.employmentIncome - totalDeduction);
    const rounded = Math.floor(before / 1000) * 1000;

    return {
      value: rounded,
      formula:
        `${yen(args.employmentIncome)} − (社保 ${yen(args.socialInsuranceTotal)} + 基礎 ${yen(basic)}` +
        ` + 配偶者 ${yen(spouse)} + 扶養 ${yen(dep)}) = ${yen(before)} 円` +
        ` → 1,000円未満切り捨て ${yen(rounded)} 円`,
      reference:
        kind === 'forIncomeTax'
          ? '課税総所得金額（所得税）'
          : '課税総所得金額（住民税）',
    };
  };

  return {
    forIncomeTax: compute('forIncomeTax'),
    forResidenceTax: compute('forResidenceTax'),
  };
}
