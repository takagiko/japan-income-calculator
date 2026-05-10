import type { CalcInput, Dependents } from '../utils/types';

type Props = {
  value: CalcInput;
  onChange: (next: CalcInput) => void;
};

const yen = (n: number) => n.toLocaleString('ja-JP');

export function InputForm({ value, onChange }: Props) {
  const setDep = (key: keyof Dependents, n: number) =>
    onChange({ ...value, dependents: { ...value.dependents, [key]: Math.max(0, n) } });

  const annualIncome = value.monthlySalary * 12 + value.summerBonus + value.winterBonus;

  return (
    <form className="input-form">
      <div className="input-bar">
        <label
          className="field"
          data-tooltip="1ヶ月の税込み支給額(賞与を除く)。給与明細の「総支給額」(社保・税が引かれる前の額)を入れます。"
        >
          <span className="field-label">月給</span>
          <NumericInput
            value={value.monthlySalary}
            onChange={(n) => onChange({ ...value, monthlySalary: n })}
          />
          <span className="field-suffix">円/月</span>
        </label>
        <label
          className="field"
          data-tooltip="夏のボーナス1回分の税込み支給額。0 を入れれば「賞与なし」または年1回(冬のみ)として扱われます。"
        >
          <span className="field-label">夏ボ</span>
          <NumericInput
            value={value.summerBonus}
            onChange={(n) => onChange({ ...value, summerBonus: n })}
          />
          <span className="field-suffix">円</span>
        </label>
        <label
          className="field"
          data-tooltip="冬のボーナス1回分の税込み支給額。0 を入れれば「賞与なし」または年1回(夏のみ)として扱われます。"
        >
          <span className="field-label">冬ボ</span>
          <NumericInput
            value={value.winterBonus}
            onChange={(n) => onChange({ ...value, winterBonus: n })}
          />
          <span className="field-suffix">円</span>
        </label>
        <label
          className="field check"
          data-tooltip="40歳以上65歳未満の方は介護保険料が健康保険料に上乗せされます。チェックすると料率1.59%(本人負担0.795%)が加算。"
        >
          <input
            type="checkbox"
            checked={value.hasNursingInsurance}
            onChange={(e) => onChange({ ...value, hasNursingInsurance: e.target.checked })}
          />
          <span className="field-label">介護(40-64)</span>
        </label>
        <div className="annual-display">年収: <strong>{yen(annualIncome)} 円</strong></div>
      </div>

      <div className="input-bar">
        <label
          className="field check"
          data-tooltip="配偶者控除・配偶者特別控除の対象となる配偶者がいる場合にチェック。配偶者の合計所得が133万円超で控除なし。"
        >
          <input
            type="checkbox"
            checked={value.hasSpouse}
            onChange={(e) => onChange({ ...value, hasSpouse: e.target.checked })}
          />
          <span className="field-label">配偶者</span>
        </label>

        <span className="group-label">扶養:</span>
        <Stepper
          label="一般"
          tooltip="16歳以上の扶養親族(特定・老人を除く)。1人あたり所得税38万円・住民税33万円の控除。"
          value={value.dependents.general}
          onChange={(n) => setDep('general', n)}
        />
        <Stepper
          label="特定(19-22)"
          tooltip="19歳以上23歳未満の扶養親族(主に大学生世代)。1人あたり所得税63万円・住民税45万円の控除と、控除額が大きい。"
          value={value.dependents.specific}
          onChange={(n) => setDep('specific', n)}
        />
        <Stepper
          label="老人"
          tooltip="70歳以上の扶養親族で、納税者または配偶者と同居していない方。1人あたり所得税48万円・住民税38万円の控除。"
          value={value.dependents.elderly}
          onChange={(n) => setDep('elderly', n)}
        />
        <Stepper
          label="同居老親"
          tooltip="70歳以上で、納税者または配偶者の直系尊属(父母・祖父母)で同居している方。1人あたり所得税58万円・住民税45万円の控除。"
          value={value.dependents.livingWithElderlyParent}
          onChange={(n) => setDep('livingWithElderlyParent', n)}
        />
      </div>

      {value.hasSpouse && (
        <div className="input-bar">
          <label
            className="field"
            data-tooltip="配偶者の給与収入(税込み)。配偶者特別控除の段階決定に使われます(配偶者の合計所得 48〜133万円の範囲で段階的に控除が減ります)。"
          >
            <span className="field-label">配偶者の年収</span>
            <NumericInput
              value={value.spouseIncome}
              onChange={(n) => onChange({ ...value, spouseIncome: n })}
            />
            <span className="field-suffix">円</span>
          </label>
        </div>
      )}

      <p className="input-note">
        ※ 各欄にマウスを乗せると説明が出ます。<strong>16歳未満の年少扶養親族は対象外</strong>(児童手当との二重給付防止)。
      </p>
    </form>
  );
}

function Stepper({
  label,
  tooltip,
  value,
  onChange,
}: {
  label: string;
  tooltip?: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const set = (n: number) => onChange(Math.max(0, n));
  return (
    <div className="dep-inline" data-tooltip={tooltip}>
      <span className="dep-label">{label}</span>
      <div className="number-stepper">
        <button type="button" onClick={() => set(value - 1)} aria-label="減らす" disabled={value <= 0}>−</button>
        <input type="number" min={0} value={value} onChange={(e) => set(Number(e.target.value))} />
        <button type="button" onClick={() => set(value + 1)} aria-label="増やす">+</button>
      </div>
    </div>
  );
}

// 整数の入力。表示は3桁区切り(1,234,567)、内部は数値。
// type="text" + inputMode="numeric" にすることで、カンマ表示と数値キーボード(モバイル)を両立。
function NumericInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={value.toLocaleString('ja-JP')}
      onChange={(e) => {
        const stripped = e.target.value.replace(/[^\d]/g, '');
        onChange(stripped === '' ? 0 : Number(stripped));
      }}
    />
  );
}
