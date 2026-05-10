import type { CalcResult } from '../../utils/types';
import type { SocialInsuranceResult } from './socialInsurance';

const yen = (n: number) => n.toLocaleString('ja-JP');

export type TakeHomeBreakdown = {
  social: number;
  incomeTax: number;
  residenceTax: number;
};

export type TakeHomeResult = {
  annualTakeHome: CalcResult;
  monthlyTakeHome: CalcResult;
  // 支払源別の手取り
  monthlySalaryTakeHomeAnnual: CalcResult;   // 月給の年間手取り
  monthlySalaryTakeHomeMonthly: CalcResult;  // 月給の1ヶ月あたり手取り
  summerBonusTakeHome: CalcResult;           // 夏ボーナスの手取り（1回）
  winterBonusTakeHome: CalcResult;           // 冬ボーナスの手取り（1回）
  // Summary 表示用：各手取りに対応する控除内訳
  breakdowns: {
    annual: TakeHomeBreakdown;             // 年額の引かれ内訳
    monthlySalaryMonthly: TakeHomeBreakdown; // 月給1ヶ月あたりの引かれ内訳
    summerBonus: TakeHomeBreakdown;        // 夏ボ1回の引かれ内訳
    winterBonus: TakeHomeBreakdown;        // 冬ボ1回の引かれ内訳
  };
};

export function calcTakeHome(args: {
  monthlySalary: number;
  summerBonus: number;
  winterBonus: number;
  social: SocialInsuranceResult;
  incomeTax: number;
  residenceTax: number;
}): TakeHomeResult {
  const { monthlySalary, summerBonus, winterBonus, social, incomeTax, residenceTax } = args;
  const grossAnnual = monthlySalary * 12 + summerBonus + winterBonus;

  // 社保の按分（社保サービスが各支払源ごとに既に集約済みなので、ここでは参照するだけ）
  const monthlyHealthAnnual = social.healthMonthly.value * 12;
  const monthlyNursingAnnual = social.nursingCareMonthly.value * 12;
  const monthlyPensionAnnual = social.pensionMonthly.value * 12;
  const monthlyEmpAnnual = social.employmentInsuranceMonthlyAnnual.value;

  const socialMonthlyPart = monthlyHealthAnnual + monthlyNursingAnnual + monthlyPensionAnnual + monthlyEmpAnnual;
  const socialSummerPart = social.summerBonusInsurance.bonusTotal.value;
  const socialWinterPart = social.winterBonusInsurance.bonusTotal.value;

  // 所得税は年収比で按分（残差は月給に押し付け）
  const incomeTaxSummer = grossAnnual > 0 ? Math.floor((incomeTax * summerBonus) / grossAnnual) : 0;
  const incomeTaxWinter = grossAnnual > 0 ? Math.floor((incomeTax * winterBonus) / grossAnnual) : 0;
  const incomeTaxMonthly = incomeTax - incomeTaxSummer - incomeTaxWinter;

  // 住民税は月給から全額（実運用：12ヶ月で天引き）
  const residenceFromMonthly = residenceTax;

  // 各支払源の手取り
  const monthlyAnnualGross = monthlySalary * 12;
  const monthlyAnnualNet = monthlyAnnualGross - socialMonthlyPart - incomeTaxMonthly - residenceFromMonthly;
  const monthlyMonthlyNet = Math.floor(monthlyAnnualNet / 12);
  const summerNet = summerBonus - socialSummerPart - incomeTaxSummer;
  const winterNet = winterBonus - socialWinterPart - incomeTaxWinter;

  const annual = monthlyAnnualNet + summerNet + winterNet;
  const monthly = Math.floor(annual / 12);

  const annualTakeHome: CalcResult = {
    value: annual,
    formula:
      `${yen(grossAnnual)} − 社保 ${yen(social.totalAnnual.value)} − 所得税 ${yen(incomeTax)}` +
      ` − 住民税 ${yen(residenceTax)} = ${yen(annual)} 円`,
    reference: '手取り（年額）= 年収 − (社会保険料 + 所得税 + 住民税)',
  };

  const monthlyTakeHome: CalcResult = {
    value: monthly,
    formula: `${yen(annual)} ÷ 12 = ${yen(monthly)} 円/月（概算）`,
    reference: '手取り（月額）= 年額 ÷ 12',
  };

  const monthlySalaryTakeHomeAnnual: CalcResult = {
    value: monthlyAnnualNet,
    formula:
      `月給×12 ${yen(monthlyAnnualGross)} − 月給分社保 ${yen(socialMonthlyPart)}` +
      ` − 所得税(月給按分) ${yen(incomeTaxMonthly)} − 住民税 ${yen(residenceFromMonthly)} = ${yen(monthlyAnnualNet)} 円`,
    reference: '月給からの年間手取り（住民税は月給から天引きする実運用に合わせる）',
    note: '所得税は本来「年収全体」に対して計算されますが、ここでは年収比で按分しています（月給×12 / 年収）。住民税は実運用通り月給から全額控除した形で計算しています。',
  };

  const monthlySalaryTakeHomeMonthly: CalcResult = {
    value: monthlyMonthlyNet,
    formula: `${yen(monthlyAnnualNet)} ÷ 12 = ${yen(monthlyMonthlyNet)} 円/月`,
    reference: '月給1ヶ月あたりの手取り（年合計を12等分した概算）',
  };

  const summerBonusTakeHome: CalcResult = {
    value: summerNet,
    formula:
      `夏ボ ${yen(summerBonus)} − 夏ボ社保 ${yen(socialSummerPart)}` +
      ` − 所得税(夏ボ按分) ${yen(incomeTaxSummer)} = ${yen(summerNet)} 円`,
    reference: '夏ボーナスの手取り（1回）',
    note: '実際の賞与の源泉徴収では「前月の課税給与」を使った算出率を用いますが、本ツールでは年税額を年収比（夏ボ / 年収）で按分する近似を採用しています。年末調整での精算額は本ツールの値に近づきます。',
  };

  const winterBonusTakeHome: CalcResult = {
    value: winterNet,
    formula:
      `冬ボ ${yen(winterBonus)} − 冬ボ社保 ${yen(socialWinterPart)}` +
      ` − 所得税(冬ボ按分) ${yen(incomeTaxWinter)} = ${yen(winterNet)} 円`,
    reference: '冬ボーナスの手取り（1回）',
    note: '夏ボーナスと同様の按分近似を採用。年末調整で精算されるため最終的な手取りは本ツールの合計値と一致します。',
  };

  const breakdowns = {
    annual: {
      social: social.totalAnnual.value,
      incomeTax,
      residenceTax,
    },
    monthlySalaryMonthly: {
      social: Math.floor(socialMonthlyPart / 12),
      incomeTax: Math.floor(incomeTaxMonthly / 12),
      residenceTax: Math.floor(residenceFromMonthly / 12),
    },
    summerBonus: {
      social: socialSummerPart,
      incomeTax: incomeTaxSummer,
      residenceTax: 0,
    },
    winterBonus: {
      social: socialWinterPart,
      incomeTax: incomeTaxWinter,
      residenceTax: 0,
    },
  };

  return {
    annualTakeHome,
    monthlyTakeHome,
    monthlySalaryTakeHomeAnnual,
    monthlySalaryTakeHomeMonthly,
    summerBonusTakeHome,
    winterBonusTakeHome,
    breakdowns,
  };
}
