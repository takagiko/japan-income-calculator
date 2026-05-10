import type { CalcInput } from './types';

// 入力 → クエリ文字列
export function inputToSearchParams(input: CalcInput): string {
  const p = new URLSearchParams();
  p.set('monthly', String(input.monthlySalary));
  if (input.summerBonus > 0) p.set('summer', String(input.summerBonus));
  if (input.winterBonus > 0) p.set('winter', String(input.winterBonus));
  if (input.hasNursingInsurance) p.set('nursing', '1');
  if (input.hasSpouse) p.set('spouse', '1');
  if (input.spouseIncome > 0) p.set('spouseIncome', String(input.spouseIncome));
  if (input.dependents.general > 0) p.set('depGen', String(input.dependents.general));
  if (input.dependents.specific > 0) p.set('depSpec', String(input.dependents.specific));
  if (input.dependents.elderly > 0) p.set('depEld', String(input.dependents.elderly));
  if (input.dependents.livingWithElderlyParent > 0) p.set('depLwe', String(input.dependents.livingWithElderlyParent));
  return p.toString();
}

// クエリ文字列 → 入力（不正値は default にフォールバック、旧 income= も後方互換で受ける）
export function searchParamsToInput(search: string, defaults: CalcInput): CalcInput {
  const p = new URLSearchParams(search);
  const num = (key: string, def: number): number => {
    const v = p.get(key);
    if (v == null) return def;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : def;
  };

  // 後方互換: 旧 ?income=Y がある場合、月給に振り替え（賞与は0扱い）
  let monthlySalary: number;
  let summerBonus: number;
  let winterBonus: number;
  if (p.has('monthly')) {
    monthlySalary = num('monthly', defaults.monthlySalary);
    summerBonus = num('summer', defaults.summerBonus);
    winterBonus = num('winter', defaults.winterBonus);
  } else if (p.has('income')) {
    const income = num('income', 0);
    monthlySalary = Math.floor(income / 12);
    summerBonus = 0;
    winterBonus = 0;
  } else {
    monthlySalary = defaults.monthlySalary;
    summerBonus = defaults.summerBonus;
    winterBonus = defaults.winterBonus;
  }

  return {
    monthlySalary,
    summerBonus,
    winterBonus,
    hasNursingInsurance: p.get('nursing') === '1',
    hasSpouse: p.get('spouse') === '1',
    spouseIncome: num('spouseIncome', defaults.spouseIncome),
    dependents: {
      general: num('depGen', defaults.dependents.general),
      specific: num('depSpec', defaults.dependents.specific),
      elderly: num('depEld', defaults.dependents.elderly),
      livingWithElderlyParent: num('depLwe', defaults.dependents.livingWithElderlyParent),
    },
  };
}
