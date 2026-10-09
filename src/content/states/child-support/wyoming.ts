import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, pct } from '../../../lib/kit';

const SLUG = 'wyoming';
const d = cs(SLUG);
const F = d.formula as { bandStarts: number[]; base: Record<string, number[]>; marginalPct: Record<string, number[]>; pctOfIncomeAtBandStart: Record<string, number[]>; sharedMultiplier: number; sharedThresholdPctOfYear: number };
const Q = F.sharedThresholdPctOfYear;
const SSR = d.lowIncome!.selfSupportReserve!;
const T = d.shared!.thresholdOvernights!;
const starts = F.bandStarts;
const lastStart = starts[starts.length - 1];
const A = 4000, B = 2000;
const base = csCalc(SLUG, A, B, 2);
const before = csCalc(SLUG, A, B, 2, { payerOvernights: T - 1 });
const shared = csCalc(SLUG, A, B, 2, { payerOvernights: T });
const lowA = 1500, lowB = 3000;
const low = csCalc(SLUG, lowA, lowB, 1);
const lowShare = (low.basicMonthly * lowA) / (lowA + lowB);
const hiA = 12000, hiB = 8000;
const hi = csCalc(SLUG, hiA, hiB, 1);
const care = 500;
const withCare = csCalc(SLUG, A, B, 2, { childcare: care });
const one = (i: number) => [usd(starts[i]), `${pct(F.pctOfIncomeAtBandStart['1'][i])}`, usd(F.base['1'][i]), pct(F.marginalPct['1'][i])];

export default defineStatePage({
  topic: 'child-support',
  slug: SLUG,
  title: 'Wyoming Child Support 2026: Statutory Income Bands',
  description: `Wyoming child support 2026 by W.S. 20-2-304: ${usd(A)} and ${usd(B)} of net income, two children, ${usd(base.monthly)} a month; shared responsibility past ${pct(Q)} of overnights.`,
  intro: 'The W.S. 20-2-304 tables written as a base plus a percentage per income band, the 150% shared responsibility rule and the poverty-line reserve.',
  resume: `Under W.S. 20-2-304, a Wyoming parent with ${usd(A)} of monthly net income, opposite a parent with ${usd(B)}, owes ${usd(base.monthly)} a month for two children. Wyoming does not publish a grid of rows: the statute itself gives, for each number of children up to five or more, a handful of income bands with a base amount and a percentage of the income above the band start. The percentage falls as income rises, from ${pct(F.marginalPct['1'][0])} at the bottom to ${pct(F.marginalPct['1'][starts.length - 1])} above ${usd(lastStart)} for one child, and nothing caps it. Net income is after taxes, Social Security and the children's health coverage. When each parent keeps the children more than ${pct(Q)} of the year, about ${num(T)} nights, shared responsibility applies and the total grows by half before time is credited: ${usd(shared.monthly)} in our example. The obligor never pays below the poverty line for one person, ${usd(SSR)} a month in 2026.`,
  body: (h) => `<h2>A table written as arithmetic</h2>
<p>The Legislature wrote the tables as formulas. Each line of subsection (a) gives a band start, the percentage of income that the base represents at that point, the base itself and the marginal rate on the income above it. For one child the bands read as follows.</p>
${h.table(['Combined net monthly income from', 'Share of income at that point', 'Base support', 'Plus, on income above the start'], starts.map((_, i) => one(i)), 'Wyoming, W.S. 20-2-304(a)(i), one child', ['left', 'right', 'right', 'right'])}
<p>Reading it is quick. Our family has ${usd(A + B)} combined, which sits in the ${usd(starts[4])} band: the two-child base of ${usd(F.base['2'][4])} plus ${pct(F.marginalPct['2'][4])} of the ${usd(A + B - starts[4])} above it gives ${usd(base.basicMonthly)}, and the parent with two thirds of the income pays two thirds. There is no ceiling: at ${usd(hiA + hiB)} combined, one child, the last line keeps adding ${pct(F.marginalPct['1'][starts.length - 1])} of every dollar over ${usd(lastStart)}, so the parent earning ${usd(hiA)} owes ${usd(hi.monthly)}. Below ${usd(starts[0])} the statute has no line; the calculator carries the first band down and says so. The Department of Family Services must review the presumptive support every four years, and its 2021 review noted that the figures still reflect 2012 prices.</p>
<h2>More than ${pct(Q)} of the year in each home</h2>
<p>Subsection (c) uses a low threshold compared with many states: each parent must keep the children overnight for more than ${pct(Q)} of the year, and both must contribute substantially to the children's expenses beyond the support itself. The total is then multiplied by ${pct(F.sharedMultiplier * 100)}, split by net income, and each share is multiplied by the time the children spend with the other parent before the two are netted. With our figures, ${num(T - 1)} nights leave ${usd(before.monthly)}; ${num(T)} nights give ${usd(shared.monthly)}. Split custody, where each parent has at least one child full time, follows its own per-child offset in subsection (d), which the calculator does not run.</p>
<h3>The reserve and what stays outside the formula</h3>
<p>Subsection (f) protects the obligor through the federal poverty guideline for one person rather than a figure of its own, so the reserve moves every year with no amendment. A parent with ${usd(lowA)} of net income, facing ${usd(lowB)}, one child, would owe ${usd(lowShare)} as an income share; only ${usd(low.monthly)} lies above ${usd(SSR)}, and that is the order. Child care is not an add-on in Wyoming: W.S. 20-2-307(b) lists it among the reasons to deviate, so ${usd(care)} a month of day care leaves the presumptive amount at ${usd(withCare.monthly)}. The cost of the children's health coverage is taken out of the net income of whichever parent pays it. For a neighboring income shares grid, see ${h.a('child-support:colorado', 'Colorado')}.</p>`,
  faqs: [
    { q: `How does Wyoming calculate child support above ${usd(lastStart)} a month?`, a: `It keeps going. The last line of each W.S. 20-2-304 table is a base at ${usd(lastStart)} plus a percentage of anything over it: ${pct(F.marginalPct['1'][starts.length - 1])} for one child up to ${pct(F.marginalPct['5'][starts.length - 1])} for five or more. With ${usd(hiA)} and ${usd(hiB)} of net income and one child, the total is ${usd(hi.basicMonthly)} and the parent with ${usd(hiA)} owes ${usd(hi.monthly)} a month, with no cap.` },
    { q: 'How many overnights count as shared responsibility in Wyoming?', a: `More than ${pct(Q)} of the year with each parent, so ${num(T)} nights or more, and both parents must contribute substantially to the children's expenses on top of support (W.S. 20-2-304(c)). The total obligation is multiplied by ${pct(F.sharedMultiplier * 100)} before each parent is credited for time. With ${usd(A)} against ${usd(B)} and two children, the order drops from ${usd(base.monthly)} to ${usd(shared.monthly)}.` },
    { q: 'What is the Wyoming child support self-support reserve in 2026?', a: `${usd(SSR)} a month. W.S. 20-2-304(f) does not print a number: the reserve is the current federal poverty guideline for one person, and the 2026 guideline is ${usd(SSR * 12)} a year. If the obligor's net income minus that reserve is smaller than the table amount, support is set at the difference, ${usd(low.monthly)} for a parent earning ${usd(lowA)} next to ${usd(lowB)}.` },
    { q: 'Is day care added to child support in Wyoming?', a: `Not automatically. Wyoming's statute has no add-on line for child care: the cost of necessary day care is one of the factors in W.S. 20-2-307(b) that let a court deviate from the presumptive amount, with written findings. Health coverage for the children is handled earlier, as a deduction from the net income of the parent who pays the premium.` },
  ],
  related: ['child-support', 'child-support:colorado', 'child-support:utah', 'child-support:idaho', 'workers-comp:wyoming'],
});
