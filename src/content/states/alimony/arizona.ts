import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('arizona');
const P = d.params;
const T = d.durationTable as unknown as Array<{ marriageMonthsMin: number; marriageMonthsMax: number | null; minMonths: number; maxMonths: number; orPctOfMarriageIfGreater?: number }>;
const R = P.ruleOf65;
const last = T[T.length - 1];
const ex8 = alCalc('arizona', { payer: 7000, payee: 2000, years: 8 });
const ex25 = alCalc('arizona', { payer: 7000, payee: 2000, years: 25 });
const ex17 = alCalc('arizona', { payer: 7000, payee: 2000, years: 17 });

export default defineStatePage({
  topic: 'alimony',
  slug: 'arizona',
  title: `Arizona Spousal Maintenance Calculator 2026: Duration Ranges`,
  description: `Arizona spousal maintenance 2026: guideline terms run from ${T[0].minMonths} to ${T[0].maxMonths} months after a short marriage up to ${last.maxMonths} months or ${pct(last.orPctOfMarriageIfGreater!)} of a long one; amount via court tool.`,
  intro: 'Arizona fixes how long maintenance may last; the amount comes only from the Supreme Court’s own calculator.',
  resume: `Arizona's Spousal Maintenance Guidelines, adopted by the Supreme Court under A.R.S. § 25-319(B) and in their 2025 edition since September 1, 2025, give a duration range the court cannot leave: ${T[0].minMonths} to ${T[0].maxMonths} months after a marriage under ${T[0].marriageMonthsMax} months, ${T[1].minMonths} to ${T[1].maxMonths} under ${T[1].marriageMonthsMax}, ${T[2].minMonths} to ${T[2].maxMonths} under ${T[2].marriageMonthsMax}, ${T[3].minMonths} to ${T[3].maxMonths} under ${T[3].marriageMonthsMax}, and from ${last.marriageMonthsMin} months ${last.minMonths} months up to ${last.maxMonths} months or ${pct(last.orPctOfMarriageIfGreater!)} of the marriage, whichever is greater. Marriage length runs to the service of the divorce petition. The amount is different: the guidelines build it from household spending data in the court's Spousal Maintenance Calculator, with a high-income adjustment from ${usd(P.highIncomeStartAnnual)} a year, so no percentage reproduces it. Our calculator shows the duration range only and sends you to the official calculator for the amount. Eligibility under § 25-319(A) comes first.`,
  body: (h) => `<h2>Why we show no amount</h2>
<p>Arizona is the only state on this site whose official guideline cannot be written as a percentage. The court's calculator takes family size (up to ${h.num(P.maxFamilySize)} people), both spouses' actual and attributed income, then looks up what a household of that size and income spends according to the Bureau of Labor Statistics Consumer Expenditure Survey. The receiving spouse's share of that spending, in proportion to income, is subtracted, and what remains is the amount range. For high incomes the spending figure rises by ${h.pct(P.highIncomeStepPct)} for every ${h.usd(P.highIncomeStepAnnual)} of family income above ${h.usd(P.highIncomeStartAnnual)}, up to ${h.pct(P.highIncomeMaxPct)}. Under ${h.usd(P.lowIncomeRangeStartsAtZeroBelowAnnual)} of combined income the range starts at zero. The spending tables are inside the ${h.ext(P.calculatorUrl, 'Supreme Court’s calculator')}, not in the guideline text, so any number we printed would be a guess.</p>

<h2>The ranges, applied</h2>
<p>An 8-year marriage gives ${h.num(ex8.durationMinMonths ?? 0)} to ${h.num(ex8.durationMonths ?? 0)} months. Seventeen years gives ${h.num(ex17.durationMinMonths ?? 0)} to ${h.num(ex17.durationMonths ?? 0)} months, because ${h.pct(last.orPctOfMarriageIfGreater!)} of ${h.num(17 * 12)} months is below ${h.num(last.maxMonths)}. Twenty-five years gives ${h.num(ex25.durationMinMonths ?? 0)} to ${h.num(ex25.durationMonths ?? 0)} months, the half-marriage figure now being the larger. The judge picks a point inside the range from the statutory factors and may not go outside it, though the amount itself can be adjusted for listed deviation reasons.</p>

<h2>The Rule of ${h.num(R.ageplusYears)} and other exits</h2>
<p>Three situations take the term out of the table. Under the Rule of ${h.num(R.ageplusYears)}, a requesting spouse aged at least ${h.num(R.minAge)}, after a marriage of at least ${h.num(R.minMarriageMonths)} months, whose age plus years of marriage reaches ${h.num(R.ageplusYears)}, gets a duration set case by case. A permanent disability that will never allow self-sufficiency is handled the same way, while an uncertain disability gets a fixed term the recipient can later ask to extend. Extraordinary circumstances proven by clear and convincing evidence, such as caring for a child who prevents work or a catastrophic illness, also lead to a case-by-case term. There are no lifetime awards; marital misconduct plays no part (§ 25-319(C)).</p>`,
  faqs: [
    {
      q: 'How is spousal maintenance calculated in Arizona?',
      a: 'Through the Arizona Supreme Court’s Spousal Maintenance Calculator, after the court finds a spouse eligible under A.R.S. § 25-319(A). The calculator uses family size, both incomes and Consumer Expenditure Survey spending data to produce an amount range, from which the judge picks a figure or deviates for listed reasons. The guidelines also set a duration range based on the months of marriage.',
    },
    {
      q: `What is the Rule of ${R.ageplusYears} in Arizona spousal maintenance?`,
      a: `When the Arizona spouse requesting maintenance is at least ${R.minAge} years old, the marriage lasted at least ${R.minMarriageMonths} months, and age plus years of marriage reach ${R.ageplusYears} or more at service of the petition, the guideline duration ranges no longer apply and the court sets the term case by case. Someone aged 40 after 25 years does not qualify, because the minimum age is not met.`,
    },
    {
      q: 'Can an Arizona judge go outside the maintenance duration range?',
      a: 'No, not under the standard ranges. The Arizona guidelines let the court deviate from the amount range for listed reasons, but the statute gives no authority to deviate from the duration ranges. Duration is set case by case only in the situations the guidelines name: the Rule of 65, a permanent disability, or extraordinary circumstances proven by clear and convincing evidence.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:california', 'alimony:new-mexico', 'alimony:utah'],
});
