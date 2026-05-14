import type { CalcResult, DualDeduction, FormulaItem } from '../../utils/types';
import { rateFloor } from '../../utils/math';
import {
  residenceTaxIncomeRateTotal,
  residenceTaxFlatMunicipal,
  residenceTaxFlatPrefectural,
  forestEnvironmentTax,
  residenceTaxFlatTotal,
  adjustmentDeductionThreshold,
  adjustmentDeductionMinimum,
  adjustmentDeductionExclusionIncome,
  residenceTaxIncomeReference,
  residenceTaxFlatReference,
  adjustmentDeductionReference,
  tokyoResidentTaxAdjustmentReferenceUrl,
  tokyoResidentTaxFlatReferenceUrl,
  tokyoResidentTaxIncomeReferenceUrl,
} from '../../../rules/residence-tax-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type ResidenceTaxResult = {
  adjustmentDeduction: CalcResult;
  incomeBasedTax: CalcResult;
  flatRateTax: CalcResult;
  totalTax: CalcResult;
};

export function calcResidenceTax(args: {
  taxableIncomeForResidenceTax: number;
  totalIncome: number;
  basicDeduction: DualDeduction;
  spouseDeduction: DualDeduction;
  dependentDeduction: DualDeduction;
}): ResidenceTaxResult {
  // 所得割（調整控除前）
  const incomeBasedRaw = rateFloor(args.taxableIncomeForResidenceTax, residenceTaxIncomeRateTotal);

  // 人的控除差（簡易：実際の控除額の差をそのまま使う）
  const basicDiff = args.basicDeduction.forIncomeTax.value - args.basicDeduction.forResidenceTax.value;
  const spouseDiff = args.spouseDeduction.forIncomeTax.value - args.spouseDeduction.forResidenceTax.value;
  const depDiff = args.dependentDeduction.forIncomeTax.value - args.dependentDeduction.forResidenceTax.value;
  const personalDiff = basicDiff + spouseDiff + depDiff;

  // 調整控除
  let adjValue = 0;
  let adjFormula = '';
  const adjBreakdown: FormulaItem[] = [
    { label: '基礎控除差', value: `${yen(basicDiff)} 円` },
    { label: '配偶者控除差', value: `${yen(spouseDiff)} 円` },
    { label: '扶養控除差', value: `${yen(depDiff)} 円` },
    { label: '人的控除差 合計', value: `${yen(personalDiff)} 円` },
  ];

  if (args.totalIncome > adjustmentDeductionExclusionIncome) {
    adjFormula = `本人合計所得 ${yen(args.totalIncome)} 円 > ${yen(adjustmentDeductionExclusionIncome)} 円 → 適用なし`;
    adjBreakdown.push(
      { label: '本人合計所得', value: `${yen(args.totalIncome)} 円`, note: `(${yen(adjustmentDeductionExclusionIncome)} 円超 → 適用なし)` },
      { label: '調整控除', value: '0 円', isResult: true },
    );
  } else if (args.taxableIncomeForResidenceTax <= adjustmentDeductionThreshold) {
    const target = Math.min(personalDiff, args.taxableIncomeForResidenceTax);
    adjValue = rateFloor(target, 0.05);
    adjFormula = `min(人的控除差 ${yen(personalDiff)}, 課税所得 ${yen(args.taxableIncomeForResidenceTax)}) × 5% = ${yen(adjValue)} 円`;
    adjBreakdown.push(
      { label: '課税所得(住民税)', value: `${yen(args.taxableIncomeForResidenceTax)} 円`, note: '(200万円以下)' },
      { label: '対象額', value: `min(${yen(personalDiff)}, ${yen(args.taxableIncomeForResidenceTax)}) = ${yen(target)} 円` },
      { label: '× 5%', value: '−' },
      { label: '調整控除', value: `${yen(adjValue)} 円`, isResult: true },
    );
  } else {
    const remainder = personalDiff - (args.taxableIncomeForResidenceTax - adjustmentDeductionThreshold);
    const calculated = rateFloor(remainder, 0.05);
    adjValue = Math.max(adjustmentDeductionMinimum, calculated);
    adjFormula =
      `(人的控除差 ${yen(personalDiff)} − (課税所得 ${yen(args.taxableIncomeForResidenceTax)} − 200万)) × 5%` +
      ` = ${yen(calculated)} 円 → 最低保証 2,500円と比較 → ${yen(adjValue)} 円`;
    adjBreakdown.push(
      { label: '課税所得(住民税)', value: `${yen(args.taxableIncomeForResidenceTax)} 円`, note: '(200万円超)' },
      {
        label: '余り',
        value: `${yen(personalDiff)} − (${yen(args.taxableIncomeForResidenceTax)} − 200万) = ${yen(remainder)} 円`,
      },
      { label: '× 5%', value: `${yen(calculated)} 円` },
      { label: '最低保証 2,500円と比較', value: `max(${yen(calculated)}, 2,500)` },
      { label: '調整控除', value: `${yen(adjValue)} 円`, isResult: true },
    );
  }

  const adjustmentDeduction: CalcResult = {
    value: adjValue,
    formula: adjFormula,
    breakdown: adjBreakdown,
    reference: adjustmentDeductionReference,
    referenceUrl: tokyoResidentTaxAdjustmentReferenceUrl,
  };

  // 所得割（最終）
  const incomeBasedFinal = Math.max(0, incomeBasedRaw - adjValue);
  const incomeBasedTax: CalcResult = {
    value: incomeBasedFinal,
    formula:
      `${yen(args.taxableIncomeForResidenceTax)} × ${(residenceTaxIncomeRateTotal * 100).toFixed(0)}%` +
      ` = ${yen(incomeBasedRaw)} 円 − 調整控除 ${yen(adjValue)} 円 = ${yen(incomeBasedFinal)} 円`,
    breakdown: [
      { label: '課税所得(住民税)', value: `${yen(args.taxableIncomeForResidenceTax)} 円` },
      { label: '所得割率', value: `${(residenceTaxIncomeRateTotal * 100).toFixed(0)}%`, note: '(市町村 6% + 道府県 4%)' },
      { label: '所得割(調整控除前)', value: `${yen(incomeBasedRaw)} 円` },
      { label: '調整控除', value: `− ${yen(adjValue)} 円` },
      { label: '所得割(調整控除後)', value: `${yen(incomeBasedFinal)} 円`, isResult: true },
    ],
    reference: residenceTaxIncomeReference,
    referenceUrl: tokyoResidentTaxIncomeReferenceUrl,
  };

  // 均等割 + 森林環境税
  const flatRateTax: CalcResult = {
    value: residenceTaxFlatTotal,
    formula:
      `市町村 ${yen(residenceTaxFlatMunicipal)} + 道府県 ${yen(residenceTaxFlatPrefectural)}` +
      ` + 森林環境税(国税) ${yen(forestEnvironmentTax)} = ${yen(residenceTaxFlatTotal)} 円`,
    breakdown: [
      { label: '市町村民税(均等割)', value: `${yen(residenceTaxFlatMunicipal)} 円` },
      { label: '道府県民税(均等割)', value: `${yen(residenceTaxFlatPrefectural)} 円` },
      { label: '森林環境税', value: `${yen(forestEnvironmentTax)} 円`, note: '(国税、令和6年度〜)' },
      { label: '合計', value: `${yen(residenceTaxFlatTotal)} 円`, isResult: true },
    ],
    reference: residenceTaxFlatReference,
    referenceUrl: tokyoResidentTaxFlatReferenceUrl,
  };

  // 合計
  const totalValue = incomeBasedFinal + residenceTaxFlatTotal;
  const totalTax: CalcResult = {
    value: totalValue,
    formula: `所得割 ${yen(incomeBasedFinal)} + 均等割等 ${yen(residenceTaxFlatTotal)} = ${yen(totalValue)} 円`,
    breakdown: [
      { label: '所得割(調整控除後)', value: `${yen(incomeBasedFinal)} 円` },
      { label: '均等割 + 森林環境税', value: `${yen(residenceTaxFlatTotal)} 円` },
      { label: '住民税 合計(年額)', value: `${yen(totalValue)} 円`, isResult: true },
    ],
    reference: '住民税 + 森林環境税の年税額（簡易合算）',
    referenceLinks: [
      { label: '東京都主税局: 個人住民税の所得割', url: tokyoResidentTaxIncomeReferenceUrl },
      { label: '東京都主税局: 個人住民税の均等割', url: tokyoResidentTaxFlatReferenceUrl },
    ],
    steps: [
      { label: '年額', value: totalValue },
      { label: '月額（÷12 概算）', value: Math.floor(totalValue / 12) },
    ],
  };

  return { adjustmentDeduction, incomeBasedTax, flatRateTax, totalTax };
}
