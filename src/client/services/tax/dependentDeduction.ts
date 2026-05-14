import type { CalcResult, Dependents, DualDeduction } from '../../utils/types';
import {
  dependentDeductionAmounts2025,
  dependentDeductionReference,
  dependentDeductionReferenceUrl,
} from '../../../rules/dependent-deduction-2025';

const yen = (n: number) => n.toLocaleString('ja-JP');

const KIND_LABEL = {
  general: '一般',
  specific: '特定',
  elderly: '老人',
  livingWithElderlyParent: '同居老親',
} as const;

export function calcDependentDeduction(dependents: Dependents): DualDeduction {
  const compute = (taxKind: 'forIncomeTax' | 'forResidenceTax'): CalcResult => {
    const parts: string[] = [];
    let total = 0;

    (Object.keys(KIND_LABEL) as Array<keyof Dependents>).forEach((depKind) => {
      const count = dependents[depKind];
      if (count <= 0) return;
      const unit = dependentDeductionAmounts2025[depKind][taxKind];
      total += count * unit;
      parts.push(`${KIND_LABEL[depKind]} ${count}人 × ${yen(unit)}`);
    });

    return {
      value: total,
      formula: parts.length === 0 ? '扶養親族なし → 0 円' : `${parts.join(' + ')} = ${yen(total)} 円`,
      reference: dependentDeductionReference,
      referenceUrl: dependentDeductionReferenceUrl,
    };
  };

  return {
    forIncomeTax: compute('forIncomeTax'),
    forResidenceTax: compute('forResidenceTax'),
  };
}
