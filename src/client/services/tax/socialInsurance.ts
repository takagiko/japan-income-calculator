import type { CalcResult } from '../../utils/types';
import {
  standardMonthlyBrackets2025,
  healthInsuranceRate2025,
  nursingCareInsuranceRate2025,
  pensionInsuranceRate2025,
  pensionStandardRemunerationFloor2025,
  pensionStandardRemunerationCap2025,
  standardBonusAnnualCapHealth2025,
  standardBonusPerOccurrenceCapPension2025,
  kyokaiKenpoTokyoReference,
  pensionReference,
} from '../../../rules/kyokai-kenpo-tokyo-2025';
import {
  employmentInsuranceWorkerRate2025,
  employmentInsuranceReference,
} from '../../../rules/employment-insurance-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type BonusInsurance = {
  standardBonus: CalcResult;        // 標準賞与額（1,000円未満切り捨て後）
  health: CalcResult;               // 健保（1回分・本人負担）
  nursingCare: CalcResult;          // 介護（1回分・本人負担）
  pension: CalcResult;              // 厚年（1回分・本人負担）
  employmentInsurance: CalcResult;  // 雇用保険（1回分・本人負担、賞与の実額×料率）
  bonusTotal: CalcResult;           // 1回分の社保合計（健保+介護+厚年+雇用保険）
};

export type SocialInsuranceResult = {
  standardMonthlyRemuneration: CalcResult;
  healthMonthly: CalcResult;                   // 月給分の健保（月額）
  nursingCareMonthly: CalcResult;              // 月給分の介護（月額）
  pensionMonthly: CalcResult;                  // 月給分の厚年（月額）
  employmentInsuranceMonthlyAnnual: CalcResult; // 月給分の雇用保険（年額）
  summerBonusInsurance: BonusInsurance;
  winterBonusInsurance: BonusInsurance;
  totalAnnual: CalcResult;
};

export function calcSocialInsurance(args: {
  monthlySalary: number;
  summerBonus: number;
  winterBonus: number;
  hasNursingInsurance: boolean;
}): SocialInsuranceResult {
  const { monthlySalary, summerBonus, winterBonus, hasNursingInsurance } = args;

  // 標準報酬月額（月給ベース）
  const bracket = standardMonthlyBrackets2025.find((b) => monthlySalary < b.reportedMonthlyMax)!;
  const sm = bracket.standardMonthlyRemuneration;
  const standardMonthlyRemuneration: CalcResult = {
    value: sm,
    formula: `月給 ${yen(monthlySalary)} 円 → 健保等級${bracket.grade}（標準報酬月額 ${yen(sm)} 円）`,
    reference: kyokaiKenpoTokyoReference,
  };

  // 月給分の保険料
  const healthMonthlyValue = Math.floor((sm * healthInsuranceRate2025) / 2);
  const healthMonthly: CalcResult = {
    value: healthMonthlyValue,
    formula: `${yen(sm)} × ${(healthInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(healthMonthlyValue)} 円/月`,
    reference: kyokaiKenpoTokyoReference,
    steps: [
      { label: '月額', value: healthMonthlyValue },
      { label: '年額（×12）', value: healthMonthlyValue * 12 },
    ],
  };

  const nursingMonthlyValue = hasNursingInsurance ? Math.floor((sm * nursingCareInsuranceRate2025) / 2) : 0;
  const nursingCareMonthly: CalcResult = {
    value: nursingMonthlyValue,
    formula: hasNursingInsurance
      ? `${yen(sm)} × ${(nursingCareInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(nursingMonthlyValue)} 円/月`
      : '対象外（40歳未満または65歳以上）→ 0 円/月',
    reference: kyokaiKenpoTokyoReference,
    steps: [
      { label: '月額', value: nursingMonthlyValue },
      { label: '年額（×12）', value: nursingMonthlyValue * 12 },
    ],
  };

  const pensionSm = Math.min(
    Math.max(sm, pensionStandardRemunerationFloor2025),
    pensionStandardRemunerationCap2025,
  );
  const pensionMonthlyValue = Math.floor((pensionSm * pensionInsuranceRate2025) / 2);
  const pensionCapNote =
    sm > pensionStandardRemunerationCap2025
      ? `（厚年の上限 ${yen(pensionStandardRemunerationCap2025)} 円を適用）`
      : sm < pensionStandardRemunerationFloor2025
      ? `（厚年の下限 ${yen(pensionStandardRemunerationFloor2025)} 円を適用）`
      : '';
  const pensionMonthly: CalcResult = {
    value: pensionMonthlyValue,
    formula: `${yen(pensionSm)} × ${(pensionInsuranceRate2025 * 100).toFixed(1)}% × 1/2 = ${yen(pensionMonthlyValue)} 円/月${pensionCapNote}`,
    reference: pensionReference,
    steps: [
      { label: '月額', value: pensionMonthlyValue },
      { label: '年額（×12）', value: pensionMonthlyValue * 12 },
    ],
  };

  // 月給分の雇用保険（年額）
  const empMonthlyAnnualValue = Math.floor(monthlySalary * 12 * employmentInsuranceWorkerRate2025);
  const employmentInsuranceMonthlyAnnual: CalcResult = {
    value: empMonthlyAnnualValue,
    formula: `月給 ${yen(monthlySalary)} × 12 × ${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)}/1000 = ${yen(empMonthlyAnnualValue)} 円/年`,
    reference: employmentInsuranceReference,
    note:
      '雇用保険は健保・厚年と違って標準額への等級化や上限がなく、実際の賃金に直接料率を掛けます。' +
      'このカードは月給×12分の雇用保険で、賞与にかかる雇用保険分は夏・冬ボーナスの社保カードに含まれています。',
    steps: [
      { label: '年額', value: empMonthlyAnnualValue },
      { label: '月額（÷12）', value: Math.floor(empMonthlyAnnualValue / 12) },
    ],
  };

  // 夏 → 冬の順で標準賞与額を計算（健保の年累計上限を時系列で適用）
  const summerStandardForHealth = healthCappedStandardBonus(summerBonus, 0);
  const summerBonusInsurance = calcBonusInsurance(summerBonus, hasNursingInsurance, 0);
  const winterBonusInsurance = calcBonusInsurance(winterBonus, hasNursingInsurance, summerStandardForHealth);

  // 合計
  const monthlyAnnualPart =
    (healthMonthlyValue + nursingMonthlyValue + pensionMonthlyValue) * 12 + empMonthlyAnnualValue;
  const total =
    monthlyAnnualPart + summerBonusInsurance.bonusTotal.value + winterBonusInsurance.bonusTotal.value;
  const totalAnnual: CalcResult = {
    value: total,
    formula:
      `月給分(健保+介護+厚年+雇用) ${yen(monthlyAnnualPart)} + 夏ボ社保 ${yen(summerBonusInsurance.bonusTotal.value)}` +
      ` + 冬ボ社保 ${yen(winterBonusInsurance.bonusTotal.value)} = ${yen(total)} 円`,
    reference: '社会保険料控除（所得税法 第74条・第75条）の対象額',
    steps: [
      { label: '年額', value: total },
      { label: '月額（÷12 概算）', value: Math.floor(total / 12) },
    ],
  };

  return {
    standardMonthlyRemuneration,
    healthMonthly,
    nursingCareMonthly,
    pensionMonthly,
    employmentInsuranceMonthlyAnnual,
    summerBonusInsurance,
    winterBonusInsurance,
    totalAnnual,
  };
}

// 健保視点で年累計上限を考慮した「使われる」標準賞与額（次の賞与の累計判定用）
function healthCappedStandardBonus(bonusAmount: number, healthUsedSoFar: number): number {
  const rawStandard = Math.floor(bonusAmount / 1000) * 1000;
  const remaining = Math.max(0, standardBonusAnnualCapHealth2025 - healthUsedSoFar);
  return Math.min(rawStandard, remaining);
}

function calcBonusInsurance(
  bonusAmount: number,
  hasNursingInsurance: boolean,
  healthStandardUsedSoFar: number,
): BonusInsurance {
  // 標準賞与額（1,000円未満切り捨て）
  const rawStandard = Math.floor(bonusAmount / 1000) * 1000;

  // 健保の年累計上限を適用後の額
  const healthRemaining = Math.max(0, standardBonusAnnualCapHealth2025 - healthStandardUsedSoFar);
  const healthCapped = Math.min(rawStandard, healthRemaining);
  const healthCapNote =
    rawStandard > healthCapped
      ? `（年間累計上限 ${yen(standardBonusAnnualCapHealth2025)} 円を適用後の残り ${yen(healthRemaining)} 円）`
      : '';

  // 厚年は1回上限
  const pensionStandard = Math.min(rawStandard, standardBonusPerOccurrenceCapPension2025);
  const pensionCapNote =
    rawStandard > pensionStandard
      ? `（厚年の1回上限 ${yen(standardBonusPerOccurrenceCapPension2025)} 円を適用）`
      : '';

  const healthValue = Math.floor((healthCapped * healthInsuranceRate2025) / 2);
  const nursingValue = hasNursingInsurance ? Math.floor((healthCapped * nursingCareInsuranceRate2025) / 2) : 0;
  const pensionValue = Math.floor((pensionStandard * pensionInsuranceRate2025) / 2);

  // 雇用保険は賞与の実額に料率（標準賞与額ではない）
  const empBonusValue = Math.floor(bonusAmount * employmentInsuranceWorkerRate2025);

  const standardBonus: CalcResult = {
    value: rawStandard,
    formula:
      bonusAmount === 0
        ? `賞与 0 円 → 標準賞与額 0 円`
        : `賞与 ${yen(bonusAmount)} 円 → 1,000円未満切り捨て → 標準賞与額 ${yen(rawStandard)} 円`,
    reference: '標準賞与額（健康保険法 / 厚生年金保険法）',
  };

  const health: CalcResult = {
    value: healthValue,
    formula: `${yen(healthCapped)} × ${(healthInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(healthValue)} 円${healthCapNote}`,
    reference: kyokaiKenpoTokyoReference,
  };

  const nursingCare: CalcResult = {
    value: nursingValue,
    formula: hasNursingInsurance
      ? `${yen(healthCapped)} × ${(nursingCareInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(nursingValue)} 円`
      : '対象外（40歳未満または65歳以上）→ 0 円',
    reference: kyokaiKenpoTokyoReference,
  };

  const pension: CalcResult = {
    value: pensionValue,
    formula: `${yen(pensionStandard)} × ${(pensionInsuranceRate2025 * 100).toFixed(1)}% × 1/2 = ${yen(pensionValue)} 円${pensionCapNote}`,
    reference: pensionReference,
  };

  const employmentInsurance: CalcResult = {
    value: empBonusValue,
    formula:
      bonusAmount === 0
        ? `賞与 0 円 → 雇用保険 0 円`
        : `賞与 ${yen(bonusAmount)} × ${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)}/1000 = ${yen(empBonusValue)} 円`,
    reference: employmentInsuranceReference,
  };

  const totalValue = healthValue + nursingValue + pensionValue + empBonusValue;
  const bonusTotal: CalcResult = {
    value: totalValue,
    formula:
      `健保 ${yen(healthValue)} + 介護 ${yen(nursingValue)} + 厚年 ${yen(pensionValue)}` +
      ` + 雇用 ${yen(empBonusValue)} = ${yen(totalValue)} 円`,
    reference: '賞与にかかる社会保険料の合計（1回分・本人負担）',
    note:
      '健保・介護・厚年は「標準賞与額」(1,000円未満切り捨て後)に料率を掛けるのに対し、' +
      '雇用保険は実際の賞与額に料率を掛けます。賞与額が 1,000円単位でない場合に微妙な差が出るのはそのためです。',
  };

  return { standardBonus, health, nursingCare, pension, employmentInsurance, bonusTotal };
}
