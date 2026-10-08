import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('wisconsin');
const P = d.percent!;
const R = P.byChildren;
const T = P.tiers!;
const F = d.formula as { sharedThresholdPercent: number; sharedThresholdDays: number; sharedMultiplier: number; proRataPerChild: Record<string, number>; highIncomeThresholdsMonthly: number[] };
const [hi1, hi2] = F.highIncomeThresholdsMonthly;
const M = F.sharedMultiplier;
const days = F.sharedThresholdDays;
const low = d.schedule!.rows as unknown as Array<[number, ...Array<[number, number]>]>;
const lowTop = low[low.length - 1][0];
const lowBottom = low[0][0];

const std = csCalc('wisconsin', 5000, 0, 2);
const big = csCalc('wisconsin', 15000, 0, 1);
const bigFlat = (15000 * R[0]) / 100;
const shA = 3000, shB = 2000;
const below = csCalc('wisconsin', shA, shB, 2, { payerOvernights: days - 1 });
const shared = csCalc('wisconsin', shA, shB, 2, { payerOvernights: 146 });
const half = csCalc('wisconsin', shA, shB, 2, { payerOvernights: 182 });
const poor = csCalc('wisconsin', 1500, 0, 1);
const poorRow = low.find((r) => 1500 <= r[0])!;
const poorFlat = (1500 * R[0]) / 100;

export default defineStatePage({
  topic: 'child-support',
  slug: 'wisconsin',
  title: `Wisconsin Child Support 2026: ${pct(R[0])} of Gross, ${num(days)}-Day Rule`,
  description: `Wisconsin child support in 2026 under DCF 150: ${pct(R[0])} to ${pct(R[R.length - 1])} of gross income, ${usd(std.monthly)} for two kids at ${usd(5000)} a month, and the ${num(days)}-day shared placement formula.`,
  intro: 'DCF 150 in practice: a flat share of the paying parent’s gross pay, bent at both ends and replaced by a two-household formula once each parent has the children a quarter of the year.',
  resume: `A Wisconsin parent earning ${usd(5000)} a month before taxes, with two children placed with the other parent, owes ${usd(std.monthly)} a month under DCF 150, because the state takes ${pct(R[1])} of gross income for two children and ignores the other parent's pay. The percentages run from ${pct(R[0])} for one child to ${pct(R[R.length - 1])} for five or more, and nothing is deducted for taxes first. Three adjustments change that figure. Above ${usd(hi1)} a month the court may switch to lower marginal rates, so ${usd(15000)} with one child gives ${usd(big.monthly)} instead of ${usd(bigFlat)}. Under ${usd(lowTop)} a month the Appendix C table, rebuilt each year from the federal poverty guidelines, sets a smaller amount. And once both parents have at least ${num(days)} overnights a year, each one's percentage is raised by ${num(M * 100)}% and charged for the other's time, then the two figures are netted.`,
  body: (h) => `<h2>A percentage of one paycheck, not of two</h2>
<p>Wisconsin is one of the few states that still sets support from the paying parent's income alone. DCF 150 calls the base "monthly income available for child support": annual gross income plus any imputed income, divided by twelve. Taxes, Social Security and health premiums stay in. The receiving parent's salary plays no role in a standard order, which is why two families with the same payer and very different households can end up with the same check. The rule's preface explains the choice: the custodial parent is presumed to share his or her own income with the children directly.</p>
<h2>The ${num(days)}-night threshold and the ${num(M * 100)}% markup</h2>
<p>Shared placement starts when each parent has court-ordered placement of at least ${pct(F.sharedThresholdPercent)} of the year, ${num(days)} overnights or the daytime equivalent. Then each parent's percentage amount is multiplied by ${num(M * 100)}%, a markup meant for the second bedroom, the second set of clothes, the duplicated basics. Each result is charged for the share of time the children spend in the other home, and the higher figure is reduced by the lower one.</p>
<p>The effect at the line is large. Take a payer at ${usd(shA)} and a co-parent at ${usd(shB)}, two children. With ${num(days - 1)} nights the formula does not apply and the payer owes ${usd(below.monthly)}. At 146 nights, the 40% split used in the rule's own worked example, the order is ${usd(shared.monthly)}. At an even 182 nights it falls to ${usd(half.monthly)}. The payer never owes more than the plain percentage would require.</p>
<p>Daytime care can count. Under the equivalent-care rule, a block of six hours or more that includes a meal is a half day, and two half days equal one overnight, so a parent working nights can still reach the threshold.</p>
<h3>When income is very high or very low</h3>
<p>The high-income rates are permissive, not automatic. Below ${usd(hi1)} the standard applies in full; between ${usd(hi1)} and ${usd(hi2)} the court may use ${pct(T[1].pct[0])} for one child; above ${usd(hi2)}, ${pct(T[2].pct[0])}. Our calculator applies them, so read its result as the lower edge of the likely range.</p>
<p>At the bottom, Appendix C covers payers earning from ${usd(lowBottom)} to ${usd(lowTop)} a month, 75% to 150% of the poverty line. A parent at ${usd(1500)} with one child falls in the row ending at ${usd(poorRow[0])} and owes ${usd(poor.monthly)}, against ${usd(poorFlat)} at the full rate. The current table took effect ${day(d.effective!)}; below its first row a judge sets what the payer can bear.</p>
<p>Child care, tuition and activity fees are "variable costs" here: in shared placement the court divides them by placement time, outside the percentage. For a state where the same night count is tied to a different formula, compare ${h.a('child-support:michigan', 'Michigan')}; for the national picture, see ${h.a('how-much-is-child-support', 'how much child support is')}.</p>`,
  faqs: [
    { q: 'Does Wisconsin child support depend on the other parent’s income?', a: `Not in a standard order. DCF 150 applies a fixed share of the paying parent's gross monthly income: ${pct(R[0])} for one child, ${pct(R[1])} for two. The receiving parent's income only enters when both parents have at least ${num(days)} overnights and the shared placement formula runs, or when a party asks the court to deviate because the percentage is unfair.` },
    { q: 'How is shared placement child support figured in Wisconsin?', a: `Each parent's percentage amount is multiplied by ${num(M * 100)}%, then by the share of the year the children spend with the other parent, and the two results are offset. With ${usd(shA)} and ${usd(shB)} of monthly income, two children and a 60/40 split, the payer owes ${usd(shared.monthly)}, less than the ${usd(below.monthly)} owed below the ${num(days)}-night mark.` },
    { q: 'Is there a cap on Wisconsin child support for high earners?', a: `There is no cap: the full income counts. The court may, however, apply reduced marginal rates to the slice between ${usd(hi1)} and ${usd(hi2)} a month and lower ones above ${usd(hi2)}. For one child that means ${pct(R[0])}, ${pct(T[1].pct[0])} and ${pct(T[2].pct[0])}, so ${usd(15000)} a month yields ${usd(big.monthly)} rather than ${usd(bigFlat)}.` },
    { q: 'What does a low-income parent pay in Wisconsin?', a: `If monthly gross income is between ${usd(lowBottom)} and ${usd(lowTop)}, the court may use the Appendix C table instead of the full percentage. It lists a reduced rate and dollar amount for each income step. At ${usd(1500)} with one child the table gives ${usd(poor.monthly)} a month. The table is revised every year when the federal poverty guidelines change.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:michigan', 'child-support:new-york'],
});
