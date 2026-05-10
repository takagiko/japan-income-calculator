import { useState } from 'react';
import type { CalcResult, DualDeduction } from '../utils/types';
import { FormulaTable } from './FormulaTable';

type Props = {
  title: string;
  result: DualDeduction;
  className?: string;
};

const yen = (n: number) => n.toLocaleString('ja-JP');

export function DualCalcStep({ title, result, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dual-step${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="dual-step-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3>{title}</h3>
        <span className="formula-hint">式・根拠を見る</span>
        <span className="dual-values">
          <span><small>所得税</small> {yen(result.forIncomeTax.value)} 円</span>
          <span><small>住民税</small> {yen(result.forResidenceTax.value)} 円</span>
        </span>
      </button>
      {open && (
        <div className="formula-body">
          <FormulaSection label="所得税用" result={result.forIncomeTax} />
          <FormulaSection label="住民税用" result={result.forResidenceTax} />
        </div>
      )}
    </div>
  );
}

function FormulaSection({ label, result }: { label: string; result: CalcResult }) {
  return (
    <div className="formula-section">
      <strong>{label}</strong>
      {result.breakdown ? (
        <FormulaTable items={result.breakdown} />
      ) : (
        <div>式: {result.formula}</div>
      )}
      <div className="formula-reference">根拠: {result.reference}</div>
      {result.note && <div className="formula-note">備考: {result.note}</div>}
    </div>
  );
}
