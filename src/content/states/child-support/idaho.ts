import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num } from '../../../lib/kit';

const d = cs('idaho');
const SH = d.shared!;
const F = d.formula as { bracketWidths: number[]; pctByChildren: Record<string, number[]>; maxCombinedAnnualIncome: number; minimumPerChildMonthly: number; sharedThresholdPctOvernights: number; sharedMultiplier: number; lowIncomeReviewMonthly: number };
const p1 = F.pctByChildren['1'], p2 = F.pctByChildren['2'];
const W = F.bracketWidths;
const T = SH.thresholdOvernights!;
const A = 3000, B = 1500; // monthly
const sole = csCalc('idaho', A, B, 2);
const before = csCalc('idaho', A, B, 2, { payerOvernights: T - 1 });
const after = csCalc('idaho', A, B, 2, { payerOvernights: T });
const more = csCalc('idaho', A, B, 2, { payerOvernights: 150 });
const cap = F.maxCombinedAnnualIncome;
const firstBand = W[0];
const lastWidth = W[W.length - 1];
const fiveTens = W.slice(0, 5).reduce((s, w) => s + w, 0);
const tenBands = W.slice(0, 10).reduce((s, w) => s + w, 0);
const lowA = 400;
const low = csCalc('idaho', lowA, 0, 2);

export default defineStatePage({
  topic: 'child-support',
  slug: 'idaho',
  title: `Idaho Child Support 2026: Bracket Rates of I.R.F.L.P. 120`,
  description: `Idaho child support 2026: falling rates on combined Guidelines Income, ${pct(p1[0])} then less for one child, shared custody past ${pct(F.sharedThresholdPctOvernights)} of nights; ${usd(sole.monthly)} in our case.`,
  intro: 'Rule 120 of the Idaho Rules of Family Law Procedure has no lookup table: it works like a tax schedule run in reverse.',
  resume: `Idaho does not publish a grid of incomes and amounts. Rule 120 of the Idaho Rules of Family Law Procedure applies a falling percentage to each slice of the parents' combined annual Guidelines Income, the way a tax schedule applies rates to slices of income. For one child the first ${usd(firstBand)} is taken at ${pct(p1[0])}, the next slice at ${pct(p1[1])}, and the rate keeps sliding to ${pct(p1[p1.length - 1])} above ${usd(tenBands)}; for two children it starts at ${pct(p2[0])}. With ${usd(A)} and ${usd(B)} of gross monthly income and two children, the combined obligation is ${usd(sole.basicMonthly)} a month and the higher earner owes ${usd(sole.monthly)}. Parenting time enters through one number: once each parent has more than ${pct(F.sharedThresholdPctOvernights)} of the overnights, the obligation is multiplied by ${num(F.sharedMultiplier, 1)} and offset, which takes this example to ${usd(after.monthly)}. The schedules stop at ${usd(cap)} of combined income a year.`,
  body: (h) => `<h2>Slices of income instead of rows</h2>
<p>The Supreme Court of Idaho wrote its guideline as ${num(W.length)} brackets for each number of children, one to ${num(Object.keys(F.pctByChildren).length)}: ${num(W.filter((w) => w === firstBand).length)} slices of ${usd(firstBand)}, ${num(W.filter((w) => w === W[5]).length)} of ${usd(W[5])}, then one of ${usd(lastWidth)}. Each slice has its own rate, and only the income inside the slice gets that rate. For two children the rates read ${p2.map((x) => pct(x)).join(', ')}. The effect is that a family's average rate drifts down gently as income rises; there is no jump from one row to the next and no rounding to a table line. The rule prints a monthly figure for each slice, rounded to the dollar, which is why its own example adds up to a dollar more than the exact computation.</p>
<p>Our case works like this: ${usd(A)} plus ${usd(B)} is ${usd((A + B) * 12)} a year. The first ${usd(fiveTens)} pass through the first five slices, the rest through the sixth, and the total divided by 12 gives ${usd(sole.basicMonthly)}. The parent who earns two thirds of the income owes two thirds of it.</p>
<h2>The ${pct(F.sharedThresholdPctOvernights)} line on the calendar</h2>
<p>Rule 120(i)(3) counts overnights in a calendar year. A schedule of alternate weekends, Friday to Sunday, stays well below the line, and that parent pays the full share. Shared physical custody begins when the child spends more than ${pct(F.sharedThresholdPctOvernights)} of the overnights with each parent, ${num(T)} nights in our calculator. Then the obligation is multiplied by ${num(F.sharedMultiplier, 1)}, each parent's part is weighted by the time the child spends with the other one, and the two amounts offset. At ${num(T - 1)} nights our example stays at ${usd(before.monthly)}; at ${num(T)} it is ${usd(after.monthly)}; at 150 it is ${usd(more.monthly)}. The rule adds a guard: nobody pays more under shared custody than without it.</p>
<h3>Small incomes, large incomes, five children</h3>
<p>Rule 120 says support should rarely be zero. Below ${usd(F.lowIncomeReviewMonthly)} of monthly income the court looks at living expenses, and the presumed minimum is ${usd(F.minimumPerChildMonthly)} per child per month: a parent earning ${usd(lowA)} with two children shows ${usd(low.monthly)} in the calculator. At the other end, the brackets cover the first ${usd(cap)} of combined income a year; anything above is weighed against the child's needs, so we do not compute it. The schedules stop at ${num(Object.keys(F.pctByChildren).length)} children. For a state that reads net income in a classic table, compare ${h.a('child-support:nebraska', 'Nebraska')}.</p>`,
  faqs: [
    { q: 'Does Idaho have a child support table?', a: `Not a lookup table. Idaho Rule of Family Law Procedure 120 sets marginal percentages on slices of the parents' combined annual Guidelines Income: for one child ${pct(p1[0])} of the first ${usd(firstBand)}, then ${pct(p1[1])}, ${pct(p1[2])} and lower rates on the next slices. The total is divided between the parents by income. The rule prints the monthly amount of each full slice to help with the arithmetic.` },
    { q: 'What counts as shared custody for Idaho child support?', a: `More than ${pct(F.sharedThresholdPctOvernights)} of the overnights in a year with each parent. Below that the parent with less time pays his or her full share; above it the obligation is multiplied by ${num(F.sharedMultiplier, 1)}, weighted by the other parent's time and offset. With ${usd(A)} and ${usd(B)} a month and two children, support moves from ${usd(before.monthly)} to ${usd(after.monthly)} when the payer reaches ${num(T)} nights.` },
    { q: 'What is the minimum child support in Idaho?', a: `Rule 120(c)(4) creates a rebuttable presumption of at least ${usd(F.minimumPerChildMonthly)} per child per month, and says support should rarely be set at zero. If the paying parent earns less than ${usd(F.lowIncomeReviewMonthly)} a month, the court reviews both households' income and expenses to decide how much can be paid while leaving that parent a minimum subsistence level.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:nebraska', 'child-support:california'],
});
