import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day, listOf } from '../../../lib/kit';

const d = cs('tennessee');
const S = d.schedule!;
const F = d.formula as { perDiem: number; creditFromDays: number; increaseBelowDays: number; daysPerYear: number; minimumOrder: number };
const SHADE = (d as unknown as { extra: { ssrShadedMaxIncome: number[] } }).extra.ssrShadedMaxIncome;
const SSR = d.lowIncome!.selfSupportReserve!;
const A = 6000, B = 2500;
const at = (n: number) => csCalc('tennessee', A, B, 2, { payerOvernights: n }).monthly;
const std = at(80);
const days = [0, F.increaseBelowDays - 1, 80, F.creditFromDays - 1, F.creditFromDays, 120, 146, 182];
const ladder = days.map(at);
const base = csCalc('tennessee', A, B, 2, { payerOvernights: 80 });
const share = base.payerShare;
const step = S.rows[2][0] - S.rows[1][0];
const up = (x: number) => Math.ceil(x / step) * step;
const odd = A + B + 10;
const oddCase = csCalc('tennessee', A + 10, B, 2, { payerOvernights: 80 });
const lowA = 1100, lowB = 3500;
const low = csCalc('tennessee', lowA, lowB, 1, { payerOvernights: 80 });
const lowShare = low.basicMonthly * (lowA / (lowA + lowB));
const top = S.rows[S.rows.length - 1];
const pctTop = S.aboveMax.pct!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'tennessee',
  title: `Tennessee Child Support Calculator 2026: BCSO and Days`,
  description: `Tennessee child support 2026: the 1240-02-04 schedule rounds up to the next row, credits start at ${num(F.creditFromDays)} days, and our two-child example comes to ${usd(std)} a month.`,
  intro: 'The Tennessee Department of Human Services schedule (Rule 1240-02-04), its variable multiplier for parenting time and the shaded self-support area.',
  resume: `Tennessee's guidelines assume the alternate residential parent has the children ${num(80)} days a year; at that schedule, a parent with ${usd(A)} of adjusted gross income facing a co-parent at ${usd(B)} owes about ${usd(std)} a month for two children. The Basic Child Support Obligation for their combined ${usd(A + B)} is ${usd(base.basicMonthly)}, read in the schedule of Rule 1240-02-04-.09 after rounding the income up to the next ${usd(step)} line, and the paying parent carries ${num(share * 100, 0)}% of it. Days change the order in both directions. From ${num(F.creditFromDays)} days a "variable multiplier" of ${F.perDiem} per day enlarges the obligation to price the second household, and the other parent's share of the extra is credited: ${num(days[5])} days bring the order to ${usd(ladder[5])}. Under ${num(F.increaseBelowDays)} days the share goes up instead, to ${usd(ladder[0])} with no parenting time at all. The rules in force date from ${day(d.effective!)}.`,
  body: (h) => `<h2>Rounding up, never down</h2>
<p>Rule 1240-02-04-.04(6)(b) settles the in-between incomes in one sentence: round the combined adjusted gross income up to the next amount shown. A family at ${usd(odd)} therefore reads the ${usd(up(odd))} line, and the order is ${usd(oddCase.monthly)} rather than the ${usd(std)} of a family ${usd(10)} poorer. The schedule starts with a single line for everything from ${usd(150)} to ${usd(S.rows[0][0])}, which shows ${usd(S.rows[0][1])} whatever the number of children, and ends at ${usd(top[0])}. Past that, the last page of the rule adds ${listOf(pctTop.slice(0, 3).map((p, i) => `${p}% for ${i + 1}`))} children (up to ${pctTop[pctTop.length - 1]}% for five or more) of every dollar above ${usd(top[0])}.</p>
<h2>The variable multiplier in practice</h2>
<p>The Department designed the parenting time rule as a sliding cost, not a fixed discount. At ${num(F.creditFromDays)} days or more, the alternate residential parent's days are multiplied by ${F.perDiem}, which is 2 divided by 182.5. The result multiplies the whole obligation; the excess over the original obligation stands for what the second home spends. That excess is divided by income, and the primary residential parent's part becomes a credit. At equal time the multiplier is close to 2, so the obligation nearly doubles before the credit is taken.</p>
${h.table(['Days with the alternate residential parent', 'Monthly support, two children'], days.map((n, i) => [num(n), usdx(ladder[i])]), `Tennessee, ${usd(A)} and ${usd(B)} of adjusted gross income, no add-ons`, ['l', 'r'])}
<p>Two things stand out in the table. Between ${num(F.increaseBelowDays)} and ${num(F.creditFromDays - 1)} days nothing moves. Below ${num(F.increaseBelowDays)} the rule presumes the parent who sees the children less should pay more: (${num(F.increaseBelowDays)} minus the days) divided by ${num(F.daysPerYear)}, times that parent's share. A parent can rebut the increase with evidence, and the court can decline it, so the calculator's figure at low day counts is the presumption, not the last word. In an equal schedule, the rule names the father, or Parent 2, as the alternate residential parent for the arithmetic.</p>
<h3>The shaded cells and the ${usd(F.minimumOrder)} floor</h3>
<p>The reserve of ${usd(SSR)} a month (90% of the 2020 poverty guideline for one person) is built into the shaded cells of the schedule, which run up to ${listOf(SHADE.map((v, i) => `${usd(v)} for ${i + 1}`))} children. When the obligor's own income falls in that zone, the schedule is read again at that income alone and the smaller figure counts, without any parenting time credit. With ${usd(lowA)} against ${usd(lowB)} and one child, the share would be ${usd(lowShare)}; the shaded amount gives ${usd(low.monthly)}. Every order is at least ${usd(F.minimumOrder)} a month, except for an obligor living on SSI or when the parenting time credit itself goes lower. For comparison, ${h.aIf('child-support:kentucky', 'Kentucky')} uses a chart of percentages and ${h.aIf('child-support:georgia', 'Georgia')} a power formula.</p>`,
  faqs: [
    { q: 'How many days do I need to lower child support in Tennessee?', a: `${num(F.creditFromDays)} days a year. From that point the variable multiplier of Rule 1240-02-04-.04(7)(h) applies, ${F.perDiem} times the days, and the credit grows with every extra day. Between ${num(F.increaseBelowDays)} and ${num(F.creditFromDays - 1)} days there is no adjustment. With ${usd(A)} and ${usd(B)} of income and two children, ${num(F.creditFromDays)} days give ${usd(ladder[4])} a month and ${num(days[6])} days give ${usd(ladder[6])}.` },
    { q: 'Can Tennessee child support go up if the other parent rarely sees the children?', a: `Yes. When the alternate residential parent has ${num(F.increaseBelowDays - 1)} days or fewer, the guidelines presume an increase equal to (${num(F.increaseBelowDays)} minus the days) divided by ${num(F.daysPerYear)}, applied to that parent's share. The presumption can be rebutted. In our example, the order at ${num(80)} days is ${usd(std)}; with no parenting time it would be ${usd(ladder[0])}, a difference of ${usd(ladder[0] - std)} a month.` },
    { q: 'Does Tennessee round the combined income up or down in the schedule?', a: `Up. Rule 1240-02-04-.04(6)(b) says that when the combined adjusted gross income falls between two amounts, the next higher amount is used. A combined income of ${usd(odd)} is read on the ${usd(up(odd))} line. The rule then multiplies the obligation found there by each parent's percentage of income to set the two shares.` },
    { q: 'What is the self-support reserve in Tennessee?', a: `${usd(SSR)} of gross income a month, which the Department set at 90% of the 2020 federal poverty level for one person. It is not subtracted on the worksheet; it is built into the shaded cells of the schedule. An obligor whose own income lies in the shaded zone pays the lesser of the usual share and the schedule amount at his or her income alone, and loses the parenting time credit.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:kentucky', 'child-support:georgia', 'child-support:north-carolina', 'child-support:alabama'],
});
