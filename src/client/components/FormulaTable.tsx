import type { FormulaItem } from '../utils/types';

// 構造化された計算内訳（ラベル: 値の表）。CalcStep / DualCalcStep の展開時に使われる。
export function FormulaTable({ items }: { items: FormulaItem[] }) {
  return (
    <dl className="breakdown-table">
      {items.map((item, i) => (
        <div key={i} className={`breakdown-row${item.isResult ? ' breakdown-result' : ''}`}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}
            {item.note && <span className="breakdown-note">{item.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
