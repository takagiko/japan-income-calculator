import type { CalcResult, FormulaItem } from '../../utils/types';
import { rateFloor, rateMultiply } from '../../utils/math';
import {
  incomeTaxBrackets2025,
  incomeTaxBracketsReference,
  incomeTaxBracketsReferenceUrl,
  incomeTaxMechanismReference,
  incomeTaxMechanismReferenceUrl,
  reconstructionTaxRate2025,
  reconstructionTaxReference,
  reconstructionTaxReferenceUrl,
} from '../../../rules/income-tax-brackets-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type IncomeTaxResult = {
  baseTax: CalcResult;
  reconstructionTax: CalcResult;
  totalTax: CalcResult;
};

export function calcIncomeTax(taxableIncomeForIncomeTax: number): IncomeTaxResult {
  const bracket = incomeTaxBrackets2025.find((b) => taxableIncomeForIncomeTax <= b.upToTaxableIncome)!;

  const baseTaxRaw = Math.max(0, rateMultiply(taxableIncomeForIncomeTax, bracket.rate) - bracket.deduction);
  const baseTaxValue = Math.floor(baseTaxRaw);

  const baseTaxBreakdown: FormulaItem[] = [
    { label: '課税所得（所得税）', value: `${yen(taxableIncomeForIncomeTax)} 円` },
    { label: '税率区分', value: bracket.description },
    { label: '税率', value: `${(bracket.rate * 100).toFixed(0)}%` },
  ];
  if (bracket.deduction > 0) {
    baseTaxBreakdown.push({ label: '速算表の控除額', value: `${yen(bracket.deduction)} 円` });
    baseTaxBreakdown.push({
      label: '計算',
      value: `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}% − ${yen(bracket.deduction)} 円`,
    });
  } else {
    baseTaxBreakdown.push({
      label: '計算',
      value: `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}%`,
    });
  }
  baseTaxBreakdown.push({ label: '基準所得税額', value: `${yen(baseTaxValue)} 円`, isResult: true });

  const baseTax: CalcResult = {
    value: baseTaxValue,
    formula:
      bracket.deduction === 0
        ? `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}% = ${yen(baseTaxValue)} 円（${bracket.description}）`
        : `${yen(taxableIncomeForIncomeTax)} × ${(bracket.rate * 100).toFixed(0)}% − ${yen(bracket.deduction)} = ${yen(baseTaxValue)} 円（${bracket.description}）`,
    breakdown: baseTaxBreakdown,
    reference: incomeTaxBracketsReference,
    referenceUrl: incomeTaxBracketsReferenceUrl,
  };

  const reconstructionValue = rateFloor(baseTaxValue, reconstructionTaxRate2025);
  const reconstructionTax: CalcResult = {
    value: reconstructionValue,
    formula: `${yen(baseTaxValue)} × ${(reconstructionTaxRate2025 * 100).toFixed(1)}% = ${yen(reconstructionValue)} 円`,
    breakdown: [
      { label: '基準所得税額', value: `${yen(baseTaxValue)} 円` },
      { label: '復興特別所得税率', value: `${(reconstructionTaxRate2025 * 100).toFixed(1)}%`, note: '(令和19年まで)' },
      { label: '復興特別所得税', value: `${yen(reconstructionValue)} 円`, isResult: true },
    ],
    reference: reconstructionTaxReference,
    referenceUrl: reconstructionTaxReferenceUrl,
  };

  const beforeRounding = baseTaxValue + reconstructionValue;
  const totalTaxValue = Math.floor(beforeRounding / 100) * 100;
  const totalTax: CalcResult = {
    value: totalTaxValue,
    formula: `${yen(baseTaxValue)} + ${yen(reconstructionValue)} = ${yen(beforeRounding)} 円 → 100円未満切り捨て ${yen(totalTaxValue)} 円`,
    breakdown: [
      { label: '基準所得税額', value: `${yen(baseTaxValue)} 円` },
      { label: '復興特別所得税', value: `${yen(reconstructionValue)} 円` },
      { label: '合計', value: `${yen(beforeRounding)} 円` },
      { label: '100円未満切り捨て', value: '−', note: '(国税通則法 第119条)' },
      { label: '所得税 合計(年額)', value: `${yen(totalTaxValue)} 円`, isResult: true },
    ],
    reference: '年税額の確定（国税通則法 第119条 100円未満切り捨て）',
    referenceLinks: [
      { label: incomeTaxMechanismReference, url: incomeTaxMechanismReferenceUrl },
      { label: '所得税の税率（タックスアンサー No.2260）', url: incomeTaxBracketsReferenceUrl },
    ],
    steps: [
      { label: '年額', value: totalTaxValue },
      { label: '月額（÷12 概算）', value: Math.floor(totalTaxValue / 12) },
    ],
  };

  return { baseTax, reconstructionTax, totalTax };
}
