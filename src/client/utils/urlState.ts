import type { CalcInput } from './types';

// 入力 → クエリ文字列。default と一致するフィールドは URL に書き出さない
// （URL を最小化し、default を変えても古いリンクが期待通りに動くように）。
export function inputToSearchParams(input: CalcInput, defaults: CalcInput): string {
  const p = new URLSearchParams();
  if (input.monthlySalary !== defaults.monthlySalary) p.set('monthly', String(input.monthlySalary));
  if (input.summerBonus !== defaults.summerBonus) p.set('summer', String(input.summerBonus));
  if (input.winterBonus !== defaults.winterBonus) p.set('winter', String(input.winterBonus));
  if (input.hasNursingInsurance !== defaults.hasNursingInsurance) {
    p.set('nursing', input.hasNursingInsurance ? '1' : '0');
  }
  if (input.hasSpouse !== defaults.hasSpouse) {
    p.set('spouse', input.hasSpouse ? '1' : '0');
  }
  if (input.spouseIncome !== defaults.spouseIncome) p.set('spouseIncome', String(input.spouseIncome));
  if (input.dependents.general !== defaults.dependents.general) {
    p.set('depGen', String(input.dependents.general));
  }
  if (input.dependents.specific !== defaults.dependents.specific) {
    p.set('depSpec', String(input.dependents.specific));
  }
  if (input.dependents.elderly !== defaults.dependents.elderly) {
    p.set('depEld', String(input.dependents.elderly));
  }
  if (input.dependents.livingWithElderlyParent !== defaults.dependents.livingWithElderlyParent) {
    p.set('depLwe', String(input.dependents.livingWithElderlyParent));
  }
  return p.toString();
}

// クエリ文字列 → 入力（不正値や未指定は default にフォールバック、旧 income= も後方互換）
export function searchParamsToInput(search: string, defaults: CalcInput): CalcInput {
  const p = new URLSearchParams(search);
  const num = (key: string, def: number): number => {
    const v = p.get(key);
    if (v == null) return def;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : def;
  };
  const bool = (key: string, def: boolean): boolean => {
    return p.has(key) ? p.get(key) === '1' : def;
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
    hasNursingInsurance: bool('nursing', defaults.hasNursingInsurance),
    hasSpouse: bool('spouse', defaults.hasSpouse),
    spouseIncome: num('spouseIncome', defaults.spouseIncome),
    dependents: {
      general: num('depGen', defaults.dependents.general),
      specific: num('depSpec', defaults.dependents.specific),
      elderly: num('depEld', defaults.dependents.elderly),
      livingWithElderlyParent: num('depLwe', defaults.dependents.livingWithElderlyParent),
    },
  };
}
