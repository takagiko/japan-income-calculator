import type { CalcResult } from '../../utils/types';
import { rateFloor, rateMultiply } from '../../utils/math';
import {
  incomeTaxBrackets2025,
  incomeTaxBracketsReference,
  reconstructionTaxRate2025,
  reconstructionTaxReference,
} from '../../../rules/income-tax-brackets-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type IncomeTaxResult = {
  baseTax: CalcResult;            // 基準所得税額（速算表で計算した分）
  reconstructionTax: CalcResult;  // 復興特別所得税（基準所得税額 × 2.1%）
  totalTax: CalcResult;           // 合計、100円未満切り捨て後の年税額
};

export function calcIncomeTax(taxableIncomeForIncomeTax: number): IncomeTaxResult {
  const bracket = incomeTaxBrackets2025.find((b) => taxableIncomeForIncomeTax <= b.upToTaxableIncome)!;

  const baseTaxRaw = Math.max(0, rateMultiply(taxableIncomeForIncomeTax, bracket.rate) - bracket.deduction);
  const baseTaxValue = Math.floor(baseTaxRaw);
  const baseTax: CalcResult = {
    value: baseTaxValue,
    formula:
      bracket.deduction === 0
        ? `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}% = ${yen(baseTaxValue)} 円（${bracket.description}）`
        : `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}% − ${yen(bracket.deduction)} = ${yen(baseTaxValue)} 円（${bracket.description}）`,
    reference: incomeTaxBracketsReference,
  };

  const reconstructionValue = rateFloor(baseTaxValue, reconstructionTaxRate2025);
  const reconstructionTax: CalcResult = {
    value: reconstructionValue,
    formula: `${yen(baseTaxValue)} × ${(reconstructionTaxRate2025 * 100).toFixed(1)}% = ${yen(reconstructionValue)} 円`,
    reference: reconstructionTaxReference,
  };

  const beforeRounding = baseTaxValue + reconstructionValue;
  const totalTaxValue = Math.floor(beforeRounding / 100) * 100;
  const totalTax: CalcResult = {
    value: totalTaxValue,
    formula: `${yen(baseTaxValue)} + ${yen(reconstructionValue)} = ${yen(beforeRounding)} 円 → 100円未満切り捨て ${yen(totalTaxValue)} 円`,
    reference: '年税額の確定（国税通則法 第119条 100円未満切り捨て）',
    steps: [
      { label: '年額', value: totalTaxValue },
      { label: '月額（÷12 概算）', value: Math.floor(totalTaxValue / 12) },
    ],
  };

  return { baseTax, reconstructionTax, totalTax };
}
