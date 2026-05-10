import { useState } from 'react';
import type { CalcResult } from '../utils/types';
import { FormulaTable } from './FormulaTable';

type Props = {
  title: string;
  result: CalcResult;
  className?: string;
};

const yen = (n: number) => n.toLocaleString('ja-JP');

export function CalcStep({ title, result, className }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`calc-step${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="calc-step-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <h3>{title}</h3>
        <span className="formula-hint">式・根拠を見る</span>
        <span className="calc-step-value">{yen(result.value)} 円</span>
      </button>
      {result.steps && result.steps.length > 0 && (
        <div className="calc-step-quick">
          {result.steps.map((s, i) => (
            <span key={i}>
              {s.label}: {yen(s.value)} 円
              {s.note ? `（${s.note}）` : ''}
            </span>
          ))}
        </div>
      )}
      {open && (
        <div className="formula-body">
          {result.breakdown ? (
            <FormulaTable items={result.breakdown} />
          ) : (
            <div>式: {result.formula}</div>
          )}
          <div className="formula-reference">根拠: {result.reference}</div>
          {result.note && <div className="formula-note">備考: {result.note}</div>}
        </div>
      )}
    </div>
  );
}
