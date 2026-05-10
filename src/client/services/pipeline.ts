import type { CalcInput, CalcResult, DualDeduction } from '../utils/types';
import { calcEmploymentIncomeDeduction } from './tax/employmentIncomeDeduction';
import { calcSocialInsurance, type SocialInsuranceResult } from './tax/socialInsurance';
import { calcBasicDeduction } from './tax/basicDeduction';
import { calcSpouseDeduction } from './tax/spouseDeduction';
import { calcDependentDeduction } from './tax/dependentDeduction';
import { calcTaxableIncome, type TaxableIncomeResult } from './tax/taxableIncome';
import { calcIncomeTax, type IncomeTaxResult } from './tax/incomeTax';
import { calcResidenceTax, type ResidenceTaxResult } from './tax/residenceTax';
import { calcTakeHome, type TakeHomeResult } from './tax/takeHome';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type PipelineResult = {
  grossAnnualIncome: CalcResult;
  employmentIncomeDeduction: CalcResult;
  employmentIncome: CalcResult;
  social: SocialInsuranceResult;
  basicDeduction: DualDeduction;
  spouseDeduction: DualDeduction;
  dependentDeduction: DualDeduction;
  taxableIncome: TaxableIncomeResult;
  incomeTax: IncomeTaxResult;
  residenceTax: ResidenceTaxResult;
  takeHome: TakeHomeResult;
};

export function calculateAll(input: CalcInput): PipelineResult {
  // 年収 = 月給×12 + 夏ボ + 冬ボ
  const grossValue = input.monthlySalary * 12 + input.summerBonus + input.winterBonus;
  const grossAnnualIncome: CalcResult = {
    value: grossValue,
    formula: `月給 ${yen(input.monthlySalary)} × 12 + 夏ボ ${yen(input.summerBonus)} + 冬ボ ${yen(input.winterBonus)} = ${yen(grossValue)} 円`,
    reference: '年収（税込み）= 月給×12 + 賞与の合計',
  };

  const employmentIncomeDeduction = calcEmploymentIncomeDeduction(grossValue);

  const employmentIncomeValue = grossValue - employmentIncomeDeduction.value;
  const employmentIncome: CalcResult = {
    value: employmentIncomeValue,
    formula: `${yen(grossValue)} − ${yen(employmentIncomeDeduction.value)} = ${yen(employmentIncomeValue)} 円`,
    reference: '所得税法 第28条第2項',
  };

  const social = calcSocialInsurance({
    monthlySalary: input.monthlySalary,
    summerBonus: input.summerBonus,
    winterBonus: input.winterBonus,
    hasNursingInsurance: input.hasNursingInsurance,
  });

  const basicDeduction = calcBasicDeduction(employmentIncomeValue);
  const spouseDeduction = calcSpouseDeduction({
    hasSpouse: input.hasSpouse,
    spouseAnnualIncome: input.spouseIncome,
    taxpayerTotalIncome: employmentIncomeValue,
  });
  const dependentDeduction = calcDependentDeduction(input.dependents);

  const taxableIncome = calcTaxableIncome({
    employmentIncome: employmentIncomeValue,
    socialInsuranceTotal: social.totalAnnual.value,
    basic: basicDeduction,
    spouse: spouseDeduction,
    dependent: dependentDeduction,
  });

  const incomeTax = calcIncomeTax(taxableIncome.forIncomeTax.value);

  const residenceTax = calcResidenceTax({
    taxableIncomeForResidenceTax: taxableIncome.forResidenceTax.value,
    totalIncome: employmentIncomeValue,
    basicDeduction,
    spouseDeduction,
    dependentDeduction,
  });

  const takeHome = calcTakeHome({
    monthlySalary: input.monthlySalary,
    summerBonus: input.summerBonus,
    winterBonus: input.winterBonus,
    social,
    incomeTax: incomeTax.totalTax.value,
    residenceTax: residenceTax.totalTax.value,
  });

  return {
    grossAnnualIncome,
    employmentIncomeDeduction,
    employmentIncome,
    social,
    basicDeduction,
    spouseDeduction,
    dependentDeduction,
    taxableIncome,
    incomeTax,
    residenceTax,
    takeHome,
  };
}
