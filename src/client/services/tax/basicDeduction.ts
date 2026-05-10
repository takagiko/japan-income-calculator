import type { CalcResult, DualDeduction } from '../../utils/types';
import {
  basicDeductionBrackets2025,
  basicDeductionReference,
} from '../../../rules/basic-deduction-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export function calcBasicDeduction(totalIncome: number): DualDeduction {
  const bracket = basicDeductionBrackets2025.find((b) => totalIncome <= b.upToTotalIncome)!;

  const build = (amount: number): CalcResult => ({
    value: amount,
    formula: `${yen(amount)} 円（${bracket.description}）`,
    reference: basicDeductionReference,
  });

  return {
    forIncomeTax: build(bracket.forIncomeTax),
    forResidenceTax: build(bracket.forResidenceTax),
  };
}
