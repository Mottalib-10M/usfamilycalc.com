import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day, listOf } from '../../../lib/kit';

const d = cs('pennsylvania');
const S = d.schedule!;
const X = (d as unknown as { extra: { shadedAreaMaxIncomeByChildren: number[]; sharedCustody: { minOvernightPct: number; subtractPctPoints: number } } }).extra;
const SC = X.sharedCustody;
const SSR = d.lowIncome!.selfSupportReserve!;
const A = 5000, B = 2300;
const base = csCalc('pennsylvania', A, B, 2);
const n145 = csCalc('pennsylvania', A, B, 2, { payerOvernights: 145 });
const n146 = csCalc('pennsylvania', A, B, 2, { payerOvernights: 146 });
const n182 = csCalc('pennsylvania', A, B, 2, { payerOvernights: 182 });
const lowA = 1500, lowB = 2500;
const low = csCalc('pennsylvania', lowA, lowB, 2);
const lowShares = csCalc('pennsylvania', lowA, lowB, 2).basicMonthly * (lowA / (lowA + lowB));
const eqA = 3000, eqB = 2500;
const eq = csCalc('pennsylvania', eqA, eqB, 2, { payerOvernights: 182 });
const bigA = 36000, bigB = 9000;
const big = csCalc('pennsylvania', bigA, bigB, 2);
const top = S.rows[S.rows.length - 1];
const extra = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'pennsylvania',
  title: `Pennsylvania Child Support Calculator 2026: New Schedule`,
  description: `Pennsylvania child support 2026: the Rule 1910.16-3 schedule in force since ${day(d.effective!)}, the ${pct(SC.minOvernightPct)} custody rule and ${usd(base.monthly)} a month for two children at ${usd(A + B)}.`,
  intro: 'Pa.R.Civ.P. 1910.16-1 to 1910.16-6 applied to your numbers: the schedule that took effect in January 2026, the Self-Support Reserve and the custody adjustment.',
  resume: `With ${usd(A)} of monthly net income against the other parent's ${usd(B)} and two children living mainly with that parent, a Pennsylvania obligor owes about ${usd(base.monthly)} a month of basic child support under the Rule 1910.16-3 schedule that took effect on ${day(d.effective!)}. Pennsylvania's guidelines are court rules, not a statute, and the Supreme Court replaced the whole table for 2026: combined income of ${usd(A + B)} now reads ${usd(base.basicMonthly)} for two children. Time with the children changes the result only from ${pct(SC.minOvernightPct)} of the year's overnights, about ${num(146)} nights; at that point the obligor's percentage drops by ten points, here to ${usd(n146.monthly)}, and by up to twenty points at equal time. A Self-Support Reserve of ${usd(SSR)} a month protects low earners, and above ${usd(S.maxIncome)} of combined income a separate high-income formula takes over.`,
  body: (h) => `<h2>A table rewritten for ${day(d.effective!).slice(-4)}</h2>
<p>The order of August 11, 2025, published at 55 Pa.B. 5978, replaced the Basic Child Support Schedule from ${day(d.effective!)}. Every row moved, the first row now starts at ${usd(S.minIncome)} of combined net income, and the reserve built into the low rows rose to ${usd(SSR)}. The schedule assumes no shared time at all, a change made in 2022 when the old hidden 30% custody assumption was taken out.</p>
<h2>What "40% custody" really subtracts</h2>
<p>Parents often hear that Pennsylvania cuts support by 40% for shared custody. The rule is different. Under Rule 1910.16-4(c), once the children spend ${pct(SC.minOvernightPct)} or more of the annual overnights with the obligor, the obligor's percentage of combined income is reduced by the custody percentage minus ${num(SC.subtractPctPoints)} points. At exactly ${pct(SC.minOvernightPct)} that is ten points; at half the year it is twenty. In our family the obligor's ${pct(Math.round(base.payerShare * 1000) / 10)} share becomes about ${pct(Math.round((base.payerShare * 100 - (146 / 365 * 100 - SC.subtractPctPoints)) * 10) / 10)} at ${num(146)} nights, so the payment falls from ${usd(n145.monthly)} at ${num(145)} nights to ${usd(n146.monthly)}. At ${num(182)} nights it is ${usd(n182.monthly)}.</p>
<p>Equal time adds two guard rails. Only the parent with the higher income can be the obligor, whoever filed. And the order cannot leave the receiving parent with more than half of the two incomes combined. With ${usd(eqA)} and ${usd(eqB)} and two children shared evenly, the formula would give more than the gap allows, so support is held to ${usd(eq.monthly)}, the amount that puts both households at the same income.</p>
<h3>The shaded rows and the ${usd(SSR)} reserve</h3>
<p>Part of the printed schedule is shaded: the rows where the obligor's own income is so low that the reserve, not the table, sets the amount. The shaded block ends at ${listOf(X.shadedAreaMaxIncomeByChildren.map((v, i) => `${usd(v)} for ${i + 1}`))} children. In that zone Rule 1910.16-2(e) runs two calculations and keeps the lower. A parent netting ${usd(lowA)} with two children, facing a co-parent at ${usd(lowB)}, would owe ${usd(lowShares)} under ordinary income shares, but the table read at his or her own income gives ${usd(low.monthly)}, and that is the order. At or under ${usd(SSR)}, the court looks at real expenses before ordering anything.</p>
<h3>Families above ${usd(S.maxIncome)}</h3>
<p>Rule 1910.16-3.1 starts from the ${usd(top[0])} amounts and adds ${listOf(extra.map((p, i) => `${pct(p)} for ${i + 1}`))} children of the income above. With ${usd(bigA)} and ${usd(bigB)} and two children, the preliminary figure is ${usd(big.basicMonthly)}, the obligor's part ${usd(big.monthly)}; the judge then weighs the children's reasonable needs and may adjust, never below the ${usd(top[0])} level. The calculator reads the row at or below the income, our convention for amounts between the ${usd(S.rows[1][0] - S.rows[0][0])} steps. Neighbors handle custody time differently: compare ${h.a('child-support:new-jersey', 'New Jersey')} and ${h.a('child-support:ohio', 'Ohio')}.</p>`,
  faqs: [
    { q: 'Did Pennsylvania child support amounts change in 2026?', a: `Yes. The Pennsylvania Supreme Court adopted a new Basic Child Support Schedule effective ${day(d.effective!)} (55 Pa.B. 5978), and raised the Self-Support Reserve to ${usd(SSR)} a month. At ${usd(A + B)} of combined net income the table now gives ${usd(base.basicMonthly)} for two children. The previous schedule, in force since January 1, 2022, no longer applies to new calculations, and the August 2025 order also rewrote the worked examples in the rule comments.` },
    { q: 'How many overnights reduce child support in Pennsylvania?', a: `The children must spend at least ${pct(SC.minOvernightPct)} of the year's overnights with the paying parent, roughly ${num(146)} nights. The reduction is not a flat percentage: the obligor's share of combined income drops by the custody percentage minus ${num(SC.subtractPctPoints)} points, so ten points at ${pct(SC.minOvernightPct)} and twenty at an even split. Below the threshold, extra time does not change the guideline amount.` },
    { q: 'What is the Pennsylvania Self-Support Reserve in 2026?', a: `It is ${usd(SSR)} of monthly net income, the amount Rule 1910.16-2(e) leaves to the obligor for basic needs. It is built into the shaded rows of the schedule. If the obligor's own income falls in the shaded area, support is the lower of the table amount at that income alone and the normal income-shares amount. At or below the reserve, the court must review actual living expenses first.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-jersey', 'child-support:ohio', 'alimony:pennsylvania'],
});
