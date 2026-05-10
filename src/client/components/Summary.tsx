import { useState } from 'react';
import type { PipelineResult } from '../services/pipeline';

type Props = {
  result: PipelineResult;
};

type SelectedKey = 'annual' | 'monthly' | 'summer' | 'winter' | null;

const yen = (n: number) => n.toLocaleString('ja-JP');

const breakdownKeyMap = {
  annual: 'annual',
  monthly: 'monthlySalaryMonthly',
  summer: 'summerBonus',
  winter: 'winterBonus',
} as const;

const detailTitles: Record<Exclude<SelectedKey, null>, string> = {
  annual: '年額の控除内訳',
  monthly: '月給1ヶ月あたりの控除内訳',
  summer: '夏ボーナス1回の控除内訳',
  winter: '冬ボーナス1回の控除内訳',
};

export function Summary({ result }: Props) {
  const { takeHome } = result;
  const [selected, setSelected] = useState<SelectedKey>(null);

  const toggle = (key: Exclude<SelectedKey, null>) =>
    setSelected((prev) => (prev === key ? null : key));

  const breakdown = selected ? takeHome.breakdowns[breakdownKeyMap[selected]] : null;

  return (
    <div className="summary">
      <div className="summary-row">
        <Item
          label="年間手取り（概算）"
          value={takeHome.annualTakeHome.value}
          active={selected === 'annual'}
          onClick={() => toggle('annual')}
        />
        <Item
          label="月給の手取り（月額）"
          value={takeHome.monthlySalaryTakeHomeMonthly.value}
          active={selected === 'monthly'}
          onClick={() => toggle('monthly')}
        />
        <Item
          label="夏ボの手取り"
          value={takeHome.summerBonusTakeHome.value}
          active={selected === 'summer'}
          onClick={() => toggle('summer')}
        />
        <Item
          label="冬ボの手取り"
          value={takeHome.winterBonusTakeHome.value}
          active={selected === 'winter'}
          onClick={() => toggle('winter')}
        />
      </div>

      {selected && breakdown && (
        <div className="summary-detail">
          <div className="summary-detail-title">{detailTitles[selected]}</div>
          <div className="breakdown">
            <div>
              <div className="b-label">社会保険料</div>
              <div className="b-value">{yen(breakdown.social)} 円</div>
            </div>
            <div>
              <div className="b-label">所得税</div>
              <div className="b-value">{yen(breakdown.incomeTax)} 円</div>
            </div>
            <div>
              <div className="b-label">住民税</div>
              <div className="b-value">{yen(breakdown.residenceTax)} 円</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="summary-item" onClick={onClick} aria-expanded={active}>
      <div className="label">{label}</div>
      <div className="value">{yen(value)} 円</div>
    </button>
  );
}
