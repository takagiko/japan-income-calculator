import type { CalcResult, DualDeduction } from '../../utils/types';
import { calcEmploymentIncomeDeduction } from './employmentIncomeDeduction';
import {
  spouseDeductionBrackets2025,
  spouseDeductionReference,
  type TaxpayerIncomeBucket,
} from '../../../rules/spouse-deduction-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

function getTaxpayerIncomeBucket(totalIncome: number): TaxpayerIncomeBucket {
  if (totalIncome <= 9_000_000) return '〜900万';
  if (totalIncome <= 9_500_000) return '900〜950万';
  if (totalIncome <= 10_000_000) return '950〜1000万';
  return '1000万超';
}

export function calcSpouseDeduction(args: {
  hasSpouse: boolean;
  spouseAnnualIncome: number;
  taxpayerTotalIncome: number;
}): DualDeduction {
  if (!args.hasSpouse) {
    const zero: CalcResult = { value: 0, formula: '配偶者なし → 0 円', reference: spouseDeductionReference };
    return { forIncomeTax: zero, forResidenceTax: zero };
  }

  // 配偶者の合計所得 = 配偶者の年収 − 給与所得控除
  const spouseEid = calcEmploymentIncomeDeduction(args.spouseAnnualIncome);
  const spouseTotalIncome = Math.max(0, args.spouseAnnualIncome - spouseEid.value);
  const taxpayerBucket = getTaxpayerIncomeBucket(args.taxpayerTotalIncome);

  const bracket = spouseDeductionBrackets2025.find((b) => spouseTotalIncome <= b.spouseTotalIncomeUpTo)!;
  const amounts = bracket.amounts[taxpayerBucket];

  const build = (amount: number): CalcResult => ({
    value: amount,
    formula:
      `配偶者の合計所得 ${yen(spouseTotalIncome)} 円（${bracket.description}）` +
      ` × 本人合計所得 ${taxpayerBucket} → ${yen(amount)} 円`,
    reference: spouseDeductionReference,
  });

  return {
    forIncomeTax: build(amounts.forIncomeTax),
    forResidenceTax: build(amounts.forResidenceTax),
  };
}
