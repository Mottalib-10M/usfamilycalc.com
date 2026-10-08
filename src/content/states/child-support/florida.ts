import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, pct, num, listOf } from '../../../lib/kit';

const d = cs('florida');
const S = d.schedule!;
const SH = d.shared!;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const A = 4000, B = 2000;
const sole = csCalc('florida', A, B, 2);
const below = csCalc('florida', A, B, 2, { payerOvernights: T - 1 });
const atT = csCalc('florida', A, B, 2, { payerOvernights: T });
const at146 = csCalc('florida', A, B, 2, { payerOvernights: 146 });
const at182 = csCalc('florida', A, B, 2, { payerOvernights: 182 });
const between = csCalc('florida', A + 25, B, 2);
const hiA = 14000, hiB = 4000;
const hi = csCalc('florida', hiA, hiB, 1);
const topRow = S.rows[S.rows.length - 1];
const extra = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'florida',
  title: `Florida Child Support Calculator 2026: the ${num(T)}-Night Rule`,
  description: `Florida child support 2026 under § 61.30: net income table to ${usd(S.maxIncome)}, the ${num(T)}-overnight time-sharing formula, and ${usd(sole.monthly)} a month for two children at ${usd(A + B)}.`,
  intro: 'Fla. Stat. § 61.30 worked through: the net income table, the 20% time-sharing switch and what happens above the table.',
  resume: `A Florida parent with ${usd(A)} of monthly net income, whose co-parent nets ${usd(B)} and keeps the two children nearly all year, owes ${usd(sole.monthly)} a month under Fla. Stat. § 61.30, before day care and health insurance. The figure starts from the statutory table of minimum child support need: ${usd(sole.basicMonthly)} for two children at ${usd(A + B)} of combined net income, split by each parent's slice of that income. What makes Florida different is the time-sharing switch. As soon as each parent has the children for at least 20% of the overnights, which is ${num(T)} nights a year, the court must use a cross-credit formula that inflates the table amount by ${num(M, 1)}. In this family the payment is ${usd(at146.monthly)} at ${num(146)} nights, but it first climbs to ${usd(atT.monthly)} at exactly ${num(T)}. Above ${usd(S.maxIncome)} combined, the statute adds a fixed percentage of the excess.`,
  body: (h) => `<h2>The ${num(T)}-overnight cliff that runs the wrong way</h2>
<p>Section 61.30(11)(b) says "substantial amount of time" means at least 20% of the overnights of the year. Once a parenting plan reaches that line, the judge has no choice: the support must be recomputed with the time-sharing formula. Each parent's share of the table amount, without day care and insurance, is multiplied by ${num(M, 1)}, then by the other parent's percentage of overnights, and the two results are netted.</p>
<p>The ${num(M, 1)} factor is meant to cover the cost of running two homes, and at the low end of shared time it outweighs the credit for nights. Our family shows it. At ${num(T - 1)} overnights the paying parent owes ${usd(below.monthly)}. One more night, ${num(T)}, and the formula kicks in: ${usd(atT.monthly)}. The payment only falls under the ordinary figure as the schedule grows, to ${usd(at146.monthly)} at ${num(146)} nights and ${usd(at182.monthly)} at ${num(182)}. Parents negotiating a plan around the 20% mark should look at both numbers. The court can still deviate under § 61.30(11)(b)7., for instance when a parent is unlikely to use the time on paper, and a parent who stops exercising the schedule can see the adjustment undone back to the date the visits stopped.</p>
<h2>How the calculator reads a table built in $${num(S.rows[1][0] - S.rows[0][0])} steps</h2>
<p>The table in § 61.30(6) runs from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined monthly net income in rows ${usd(S.rows[1][0] - S.rows[0][0])} apart. The statute never says what to do with an income that falls between two rows. We read the row at or below the income: ${usd(A + B + 25)} combined uses the ${usd(A + B)} row, so the paying parent's amount moves only with his or her share, to ${usdx(Math.round(between.monthly * 100) / 100)}. Some practitioners interpolate instead; the gap is at most one step of the table.</p>
<h3>Above ${usd(S.maxIncome)} and below ${usd(S.minIncome)}</h3>
<p>Past the last row, § 61.30(6)(b) takes the ${usd(topRow[0])} amount and adds ${listOf(extra.map((p, i) => `${pct(p)} for ${i + 1}`))} children of the income above it. With ${usd(hiA)} and ${usd(hiB)} of net income and one child, the need becomes ${usd(hi.basicMonthly)} and the higher earner pays ${usd(hi.monthly)}. At the bottom, a parent whose net income sits under the table is ordered an amount set case by case, capped at 90% of the gap between that income and the federal poverty guideline for one person. The calculator does not apply that cap, because the guideline figure is not in the statute; enter the case with care.</p>
<p>The judge may move the result up or down by 5% after looking at the family as a whole, and further only with written reasons. For the neighboring state's very different custody adjustment, see ${h.a('child-support:georgia', 'Georgia')}, and for spousal support in Florida, the ${h.a('alimony:florida', 'alimony page')}.</p>`,
  faqs: [
    { q: 'Does sharing 73 nights a year lower Florida child support?', a: `Not always. At ${num(T)} overnights the § 61.30(11)(b) formula replaces the ordinary one and multiplies the table amount by ${num(M, 1)} before crediting time. For parents netting ${usd(A)} and ${usd(B)} with two children, the payment goes from ${usd(below.monthly)} at ${num(T - 1)} nights to ${usd(atT.monthly)} at ${num(T)}, and only drops below the ordinary amount with more time: ${usd(at146.monthly)} at ${num(146)}.` },
    { q: 'How is child support figured in Florida when parents earn more than $10,000 a month together?', a: `Florida keeps a formula past its table. The obligation is the amount printed for ${usd(topRow[0])} plus a percentage of every dollar above it: ${pct(extra[0])} for one child up to ${pct(extra[extra.length - 1])} for six. With ${usd(hiA)} and ${usd(hiB)} of monthly net income and one child, the total need is ${usd(hi.basicMonthly)}, of which the higher earner pays ${usd(hi.monthly)}.` },
    { q: 'Which income does Florida use for child support, gross or net?', a: 'Net. Section 61.30 starts from gross income of every kind, including bonuses, business income, social security and spousal support received, then subtracts income taxes, FICA, mandatory union dues and retirement, health insurance for the parent, support paid for other children and alimony paid. The two net incomes are added, the combined figure is looked up in the table, and each parent pays in proportion to his or her net income.' },
    { q: 'Can a Florida judge order a different amount than the guideline?', a: 'Yes, within limits. The judge can move up to 5% either way after weighing the child\'s needs, age, standard of living and each parent\'s finances. Anything wider needs a written finding that the guideline amount would be unjust or inappropriate. Section 61.30(11)(a) lists the grounds, such as extraordinary medical costs, a child\'s own income, seasonal earnings, or an amount above 55% of the payer\'s gross income.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:georgia', 'alimony:florida'],
});
