import { useEffect, useMemo, useState } from 'react';
import { InputForm } from './components/InputForm';
import { CalcStep } from './components/CalcStep';
import { DualCalcStep } from './components/DualCalcStep';
import { Summary } from './components/Summary';
import { calculateAll } from './services/pipeline';
import { inputToSearchParams, searchParamsToInput } from './utils/urlState';
import type { CalcInput } from './utils/types';

const initialInput: CalcInput = {
  monthlySalary: 450_000,
  summerBonus: 1_000_000,
  winterBonus: 1_600_000,
  hasNursingInsurance: false,
  hasSpouse: true,
  spouseIncome: 0,
  dependents: { general: 0, specific: 0, elderly: 0, livingWithElderlyParent: 0 },
};

export function App() {
  const [input, setInput] = useState<CalcInput>(() =>
    searchParamsToInput(window.location.search, initialInput),
  );
  const r = useMemo(() => calculateAll(input), [input]);

  useEffect(() => {
    const qs = inputToSearchParams(input, initialInput);
    const newUrl = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [input]);

  return (
    <main className="app">
      <h1>日本の給与所得 税・社会保険料 計算機</h1>

      <section>
        <h2>入力欄</h2>
        <InputForm value={input} onChange={setInput} />
      </section>

      <Summary result={r} />

      <section>
        <h2>給与所得</h2>
        <div className="grid-cards">
          <CalcStep title="年収（合計）" result={r.grossAnnualIncome} />
          <CalcStep title="給与所得控除" result={r.employmentIncomeDeduction} />
          <CalcStep title="給与所得（= 合計所得）" result={r.employmentIncome} className="span-all" />
        </div>
      </section>

      <section>
        <h2>社会保険料（本人負担分）</h2>
        <p className="note">
          ※ 月給から標準報酬月額を、賞与から各回の標準賞与額を別途決定する正規ルートで計算。
          厚年は1回150万円、健保は年累計573万円が標準賞与額の上限です。
        </p>
        <div className="grid-cards">
          <CalcStep title="標準報酬月額" result={r.social.standardMonthlyRemuneration} className="span-all" />
          <CalcStep title="健康保険料（月給分）" result={r.social.healthMonthly} />
          <CalcStep title="介護保険料（月給分）" result={r.social.nursingCareMonthly} />
          <CalcStep title="厚生年金保険料（月給分）" result={r.social.pensionMonthly} />
          <CalcStep title="雇用保険料（月給分・年額）" result={r.social.employmentInsuranceMonthlyAnnual} />
          <CalcStep title="夏ボーナスの社保（1回分）" result={r.social.summerBonusInsurance.bonusTotal} />
          <CalcStep title="冬ボーナスの社保（1回分）" result={r.social.winterBonusInsurance.bonusTotal} />
          <CalcStep title="社会保険料 合計（年額）" result={r.social.totalAnnual} className="span-all" />
        </div>
      </section>

      <section>
        <h2>所得控除</h2>
        <p className="note">
          ※ 所得税と住民税で控除額が異なる項目を併記。社会保険料控除はどちらも同額。
        </p>
        <DualCalcStep title="基礎控除" result={r.basicDeduction} />
        <DualCalcStep title="配偶者控除・配偶者特別控除" result={r.spouseDeduction} />
        <DualCalcStep title="扶養控除" result={r.dependentDeduction} />
      </section>

      <section>
        <h2>課税所得</h2>
        <DualCalcStep title="課税所得（所得控除を引いた後）" result={r.taxableIncome} />
      </section>

      <section>
        <h2>所得税</h2>
        <div className="grid-cards">
          <CalcStep title="基準所得税額" result={r.incomeTax.baseTax} />
          <CalcStep title="復興特別所得税" result={r.incomeTax.reconstructionTax} />
          <CalcStep title="所得税 合計（年額）" result={r.incomeTax.totalTax} className="span-all" />
        </div>
      </section>

      <section>
        <h2>住民税（東京・標準）</h2>
        <p className="note">
          ※ 住民税は本来「前年所得に対して翌年度課税」されますが、本ツールでは同年度の年収に対して計算する単純化を採用しています。
          実際の納付は1年遅れて始まります。
        </p>
        <div className="grid-cards">
          <CalcStep title="調整控除" result={r.residenceTax.adjustmentDeduction} />
          <CalcStep title="所得割(調整控除後)" result={r.residenceTax.incomeBasedTax} />
          <CalcStep title="均等割 + 森林環境税" result={r.residenceTax.flatRateTax} />
          <CalcStep title="住民税 合計(年額)" result={r.residenceTax.totalTax} className="span-all" />
        </div>
      </section>

      <footer className="disclaimer">
        <p>
          <strong>※ 本ツールの計算結果は概算です。</strong>正式な税額・納付額の確定には、税務署または税理士等の専門家にご相談ください。
        </p>
        <p className="disclaimer-sub">
          <span>対象: 令和7年度 / 協会けんぽ東京支部 / 東京都内（特別区・市町村）の個人住民税（標準税率） / 65歳未満。</span>
          <br />
          既知の単純化: 住民税は同年度の年収で計算（実際は前年所得に対する翌年度課税）／所得税は年間税額を先に概算し、月給・賞与の支給額比率で按分（実際は毎月の給与・賞与ごとに源泉徴収し、年末調整で年間税額との差額を精算）／調整控除の人的控除差は実際の控除額の差を簡略適用／雇用保険は支払源（月給・夏ボ・冬ボ）で按分／月給は実額で標準報酬月額を決定し、賞与は別途標準賞与額で計算。
        </p>
        <p className="disclaimer-sub">
          スコープ外（実装していない）: iDeCo、ふるさと納税、生命保険料控除、地震保険料控除、住宅ローン控除、医療費控除、障害者控除、寡婦・ひとり親控除、勤労学生控除。
        </p>
      </footer>
    </main>
  );
}
