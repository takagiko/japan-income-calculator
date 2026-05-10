import type { CalcResult } from '../../utils/types';
import { rateMultiply } from '../../utils/math';
import {
  employmentIncomeDeductionBrackets2025,
  employmentIncomeDeductionReference,
} from '../../../rules/employment-income-deduction-2025';

export function calcEmploymentIncomeDeduction(grossAnnualIncome: number): CalcResult {
  const bracket = employmentIncomeDeductionBrackets2025.find(
    (b) => grossAnnualIncome <= b.upToIncome,
  )!;

  const deduction = Math.floor(rateMultiply(grossAnnualIncome, bracket.rate) + bracket.flatAddition);

  const yen = (n: number) => n.toLocaleString('ja-JP');
  const formula =
    bracket.rate === 0
      ? `${yen(bracket.flatAddition)} 円（${bracket.description}）`
      : `${yen(grossAnnualIncome)} × ${(bracket.rate * 100).toFixed(0)}% ${
          bracket.flatAddition >= 0 ? '+' : '−'
        } ${yen(Math.abs(bracket.flatAddition))} 円 = ${yen(deduction)} 円`;

  return {
    value: deduction,
    formula,
    reference: employmentIncomeDeductionReference,
  };
}
