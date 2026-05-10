import type { CalcResult, FormulaItem } from '../../utils/types';
import { rateFloor } from '../../utils/math';
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
  kyokaiKenpoTokyoReferenceUrl,
  pensionReference,
} from '../../../rules/kyokai-kenpo-tokyo-2025';
import {
  employmentInsuranceWorkerRate2025,
  employmentInsuranceReference,
} from '../../../rules/employment-insurance-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type BonusInsurance = {
  standardBonus: CalcResult;
  health: CalcResult;
  nursingCare: CalcResult;
  pension: CalcResult;
  employmentInsurance: CalcResult;
  bonusTotal: CalcResult;
};

export type SocialInsuranceResult = {
  standardMonthlyRemuneration: CalcResult;
  healthMonthly: CalcResult;
  nursingCareMonthly: CalcResult;
  pensionMonthly: CalcResult;
  employmentInsuranceMonthlyAnnual: CalcResult;
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
  const bracketRange =
    bracket.reportedMonthlyMax === Infinity
      ? `${yen(bracket.reportedMonthlyMin)} 円以上`
      : `${yen(bracket.reportedMonthlyMin)} 〜 ${yen(bracket.reportedMonthlyMax)} 円`;
  const standardMonthlyRemuneration: CalcResult = {
    value: sm,
    formula: `月給 ${yen(monthlySalary)} 円 → 健保等級${bracket.grade}（標準報酬月額 ${yen(sm)} 円）`,
    breakdown: [
      { label: '月給', value: `${yen(monthlySalary)} 円` },
      { label: '該当等級', value: `健保等級 ${bracket.grade}`, note: `(報酬月額 ${bracketRange})` },
      { label: '標準報酬月額', value: `${yen(sm)} 円`, isResult: true },
    ],
    reference: kyokaiKenpoTokyoReference,
    referenceUrl: kyokaiKenpoTokyoReferenceUrl,
  };

  // 月給分の保険料
  const healthMonthlyValue = rateFloor(sm, healthInsuranceRate2025, 2);
  const healthMonthly: CalcResult = {
    value: healthMonthlyValue,
    formula: `${yen(sm)} × ${(healthInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(healthMonthlyValue)} 円/月`,
    breakdown: [
      { label: '標準報酬月額', value: `${yen(sm)} 円` },
      { label: '健康保険料率', value: `${(healthInsuranceRate2025 * 100).toFixed(2)}%`, note: '(協会けんぽ東京 令和7年度)' },
      { label: '労使折半', value: '× 1/2' },
      { label: '健康保険料(月額・本人負担)', value: `${yen(healthMonthlyValue)} 円`, isResult: true },
    ],
    reference: kyokaiKenpoTokyoReference,
    referenceUrl: kyokaiKenpoTokyoReferenceUrl,
    steps: [
      { label: '月額', value: healthMonthlyValue },
      { label: '年額（×12）', value: healthMonthlyValue * 12 },
    ],
  };

  const nursingMonthlyValue = hasNursingInsurance ? rateFloor(sm, nursingCareInsuranceRate2025, 2) : 0;
  const nursingCareMonthly: CalcResult = {
    value: nursingMonthlyValue,
    formula: hasNursingInsurance
      ? `${yen(sm)} × ${(nursingCareInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(nursingMonthlyValue)} 円/月`
      : '対象外（40歳未満または65歳以上）→ 0 円/月',
    breakdown: hasNursingInsurance
      ? [
          { label: '標準報酬月額', value: `${yen(sm)} 円` },
          { label: '介護保険料率', value: `${(nursingCareInsuranceRate2025 * 100).toFixed(2)}%`, note: '(40歳以上65歳未満のみ加算)' },
          { label: '労使折半', value: '× 1/2' },
          { label: '介護保険料(月額・本人負担)', value: `${yen(nursingMonthlyValue)} 円`, isResult: true },
        ]
      : [
          { label: '対象', value: '40歳未満または65歳以上 → 対象外' },
          { label: '介護保険料(月額)', value: '0 円', isResult: true },
        ],
    reference: kyokaiKenpoTokyoReference,
    referenceUrl: kyokaiKenpoTokyoReferenceUrl,
    steps: [
      { label: '月額', value: nursingMonthlyValue },
      { label: '年額（×12）', value: nursingMonthlyValue * 12 },
    ],
  };

  const pensionSm = Math.min(
    Math.max(sm, pensionStandardRemunerationFloor2025),
    pensionStandardRemunerationCap2025,
  );
  const pensionMonthlyValue = rateFloor(pensionSm, pensionInsuranceRate2025, 2);
  const pensionBreakdown: FormulaItem[] = [
    { label: '標準報酬月額', value: `${yen(sm)} 円` },
  ];
  if (sm > pensionStandardRemunerationCap2025) {
    pensionBreakdown.push({ label: '上限適用', value: `${yen(pensionStandardRemunerationCap2025)} 円`, note: '(厚年の1等級〜32等級の上限)' });
  } else if (sm < pensionStandardRemunerationFloor2025) {
    pensionBreakdown.push({ label: '下限適用', value: `${yen(pensionStandardRemunerationFloor2025)} 円`, note: '(厚年の下限)' });
  }
  pensionBreakdown.push(
    { label: '厚生年金保険料率', value: `${(pensionInsuranceRate2025 * 100).toFixed(1)}%`, note: '(全国一律)' },
    { label: '労使折半', value: '× 1/2' },
    { label: '厚生年金保険料(月額・本人負担)', value: `${yen(pensionMonthlyValue)} 円`, isResult: true },
  );
  const pensionCapNote =
    sm > pensionStandardRemunerationCap2025
      ? `（厚年の上限 ${yen(pensionStandardRemunerationCap2025)} 円を適用）`
      : sm < pensionStandardRemunerationFloor2025
      ? `（厚年の下限 ${yen(pensionStandardRemunerationFloor2025)} 円を適用）`
      : '';
  const pensionMonthly: CalcResult = {
    value: pensionMonthlyValue,
    formula: `${yen(pensionSm)} × ${(pensionInsuranceRate2025 * 100).toFixed(1)}% × 1/2 = ${yen(pensionMonthlyValue)} 円/月${pensionCapNote}`,
    breakdown: pensionBreakdown,
    reference: pensionReference,
    steps: [
      { label: '月額', value: pensionMonthlyValue },
      { label: '年額（×12）', value: pensionMonthlyValue * 12 },
    ],
  };

  // 月給分の雇用保険（年額）
  const empMonthlyAnnualValue = rateFloor(monthlySalary * 12, employmentInsuranceWorkerRate2025);
  const employmentInsuranceMonthlyAnnual: CalcResult = {
    value: empMonthlyAnnualValue,
    formula: `月給 ${yen(monthlySalary)} × 12 × ${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)}/1000 = ${yen(empMonthlyAnnualValue)} 円/年`,
    breakdown: [
      { label: '月給', value: `${yen(monthlySalary)} 円/月` },
      { label: '年換算 (× 12)', value: `${yen(monthlySalary * 12)} 円/年` },
      { label: '雇用保険料率', value: `${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)} / 1000`, note: '(本人負担、一般の事業)' },
      { label: '雇用保険料(年額・本人負担)', value: `${yen(empMonthlyAnnualValue)} 円`, isResult: true },
    ],
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
    breakdown: [
      { label: '月給分(健保+介護+厚年+雇用)', value: `${yen(monthlyAnnualPart)} 円` },
      { label: '夏ボーナスの社保', value: `${yen(summerBonusInsurance.bonusTotal.value)} 円` },
      { label: '冬ボーナスの社保', value: `${yen(winterBonusInsurance.bonusTotal.value)} 円` },
      { label: '社会保険料 合計(年額・本人負担)', value: `${yen(total)} 円`, isResult: true },
    ],
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

  const healthValue = rateFloor(healthCapped, healthInsuranceRate2025, 2);
  const nursingValue = hasNursingInsurance ? rateFloor(healthCapped, nursingCareInsuranceRate2025, 2) : 0;
  const pensionValue = rateFloor(pensionStandard, pensionInsuranceRate2025, 2);
  const empBonusValue = rateFloor(bonusAmount, employmentInsuranceWorkerRate2025);

  const standardBonus: CalcResult = {
    value: rawStandard,
    formula:
      bonusAmount === 0
        ? `賞与 0 円 → 標準賞与額 0 円`
        : `賞与 ${yen(bonusAmount)} 円 → 1,000円未満切り捨て → 標準賞与額 ${yen(rawStandard)} 円`,
    breakdown:
      bonusAmount === 0
        ? [{ label: '賞与額', value: '0 円' }, { label: '標準賞与額', value: '0 円', isResult: true }]
        : [
            { label: '賞与額', value: `${yen(bonusAmount)} 円` },
            { label: '端数処理', value: '1,000 円未満切り捨て' },
            { label: '標準賞与額', value: `${yen(rawStandard)} 円`, isResult: true },
          ],
    reference: '標準賞与額（健康保険法 / 厚生年金保険法）',
  };

  const healthBreakdown: FormulaItem[] = [
    { label: '標準賞与額', value: `${yen(rawStandard)} 円` },
  ];
  if (rawStandard > healthCapped) {
    healthBreakdown.push({ label: '年累計上限適用', value: `${yen(healthCapped)} 円`, note: `(年累計573万円の残り${yen(healthRemaining)}円)` });
  }
  healthBreakdown.push(
    { label: '健康保険料率', value: `${(healthInsuranceRate2025 * 100).toFixed(2)}%` },
    { label: '労使折半', value: '× 1/2' },
    { label: '健康保険料(1回分・本人負担)', value: `${yen(healthValue)} 円`, isResult: true },
  );
  const health: CalcResult = {
    value: healthValue,
    formula: `${yen(healthCapped)} × ${(healthInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(healthValue)} 円${healthCapNote}`,
    breakdown: healthBreakdown,
    reference: kyokaiKenpoTokyoReference,
    referenceUrl: kyokaiKenpoTokyoReferenceUrl,
  };

  const nursingCare: CalcResult = {
    value: nursingValue,
    formula: hasNursingInsurance
      ? `${yen(healthCapped)} × ${(nursingCareInsuranceRate2025 * 100).toFixed(2)}% × 1/2 = ${yen(nursingValue)} 円`
      : '対象外（40歳未満または65歳以上）→ 0 円',
    breakdown: hasNursingInsurance
      ? [
          { label: '標準賞与額(健保視点)', value: `${yen(healthCapped)} 円` },
          { label: '介護保険料率', value: `${(nursingCareInsuranceRate2025 * 100).toFixed(2)}%` },
          { label: '労使折半', value: '× 1/2' },
          { label: '介護保険料(1回分・本人負担)', value: `${yen(nursingValue)} 円`, isResult: true },
        ]
      : [
          { label: '対象', value: '40歳未満または65歳以上 → 対象外' },
          { label: '介護保険料(1回分)', value: '0 円', isResult: true },
        ],
    reference: kyokaiKenpoTokyoReference,
    referenceUrl: kyokaiKenpoTokyoReferenceUrl,
  };

  const pensionBreakdown: FormulaItem[] = [
    { label: '標準賞与額', value: `${yen(rawStandard)} 円` },
  ];
  if (rawStandard > pensionStandard) {
    pensionBreakdown.push({ label: '1回上限適用', value: `${yen(pensionStandard)} 円`, note: '(厚年の1回150万円上限)' });
  }
  pensionBreakdown.push(
    { label: '厚生年金保険料率', value: `${(pensionInsuranceRate2025 * 100).toFixed(1)}%` },
    { label: '労使折半', value: '× 1/2' },
    { label: '厚生年金保険料(1回分・本人負担)', value: `${yen(pensionValue)} 円`, isResult: true },
  );
  const pension: CalcResult = {
    value: pensionValue,
    formula: `${yen(pensionStandard)} × ${(pensionInsuranceRate2025 * 100).toFixed(1)}% × 1/2 = ${yen(pensionValue)} 円${pensionCapNote}`,
    breakdown: pensionBreakdown,
    reference: pensionReference,
  };

  const employmentInsurance: CalcResult = {
    value: empBonusValue,
    formula:
      bonusAmount === 0
        ? `賞与 0 円 → 雇用保険 0 円`
        : `賞与 ${yen(bonusAmount)} × ${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)}/1000 = ${yen(empBonusValue)} 円`,
    breakdown:
      bonusAmount === 0
        ? [{ label: '賞与額', value: '0 円' }, { label: '雇用保険料(1回分)', value: '0 円', isResult: true }]
        : [
            { label: '賞与額(実額)', value: `${yen(bonusAmount)} 円`, note: '(標準賞与額ではなく実額に料率)' },
            { label: '雇用保険料率', value: `${(employmentInsuranceWorkerRate2025 * 1000).toFixed(1)} / 1000` },
            { label: '雇用保険料(1回分・本人負担)', value: `${yen(empBonusValue)} 円`, isResult: true },
          ],
    reference: employmentInsuranceReference,
  };

  const totalValue = healthValue + nursingValue + pensionValue + empBonusValue;
  const bonusTotal: CalcResult = {
    value: totalValue,
    formula:
      `健保 ${yen(healthValue)} + 介護 ${yen(nursingValue)} + 厚年 ${yen(pensionValue)}` +
      ` + 雇用 ${yen(empBonusValue)} = ${yen(totalValue)} 円`,
    breakdown: [
      { label: '健康保険料', value: `${yen(healthValue)} 円` },
      { label: '介護保険料', value: `${yen(nursingValue)} 円` },
      { label: '厚生年金保険料', value: `${yen(pensionValue)} 円` },
      { label: '雇用保険料', value: `${yen(empBonusValue)} 円` },
      { label: '賞与1回分の社保 合計(本人負担)', value: `${yen(totalValue)} 円`, isResult: true },
    ],
    reference: '賞与にかかる社会保険料の合計（1回分・本人負担）',
    note:
      '健保・介護・厚年は「標準賞与額」(1,000円未満切り捨て後)に料率を掛けるのに対し、' +
      '雇用保険は実際の賞与額に料率を掛けます。賞与額が 1,000円単位でない場合に微妙な差が出るのはそのためです。',
  };

  return { standardBonus, health, nursingCare, pension, employmentInsurance, bonusTotal };
}
