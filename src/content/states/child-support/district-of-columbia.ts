import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, pct, day } from '../../../lib/kit';

const SLUG = 'district-of-columbia';
const d = cs(SLUG);
const rows = d.schedule!.rows;
const first = rows[0][0];
const top = rows[rows.length - 1];
const F = d.formula as { capPctOfAdjustedGross: number; lowIncomeMinAbilityAnnual: number; presumedMinimumMonthly: number; sharedPctOfYear: number; sharedMultiplier: number };
const SSR = d.lowIncome!.selfSupportReserve!;
const T = d.shared!.thresholdOvernights!;
const A = 4000, B = 2000;
const base = csCalc(SLUG, A, B, 2);
// a combined income just past a schedule row: the next higher row applies
const offA = A + 10;
const off = csCalc(SLUG, offA, B, 2);
const below = csCalc(SLUG, A, B, 2, { payerOvernights: T - 1 });
const shared = csCalc(SLUG, A, B, 2, { payerOvernights: T });
const forty = 146;
const shared40 = csCalc(SLUG, A, B, 2, { payerOvernights: forty });
// low income: annual income just under the reserve, then a little above it
const poorA = 1300, poorB = 3000;
const poor = csCalc(SLUG, poorA, poorB, 1);
const nearA = 1500;
const near = csCalc(SLUG, nearA, poorB, 1);
const nearShare = (near.basicMonthly * nearA) / (nearA + poorB);
// the 35% ceiling with four children and a sole earner
const capA = 2500;
const capped = csCalc(SLUG, capA, 0, 4);
// the published three-child cell that drops below the row before it
const odd = rows.findIndex((r, i) => i > 0 && r[3] < rows[i - 1][3]);
const oddRow = rows[odd], prevRow = rows[odd - 1], nextRow = rows[odd + 1];

export default defineStatePage({
  topic: 'child-support',
  slug: SLUG,
  title: 'District of Columbia Child Support 2026: Annual Schedule',
  description: `DC child support 2026: ${usd(A)} and ${usd(B)} a month of adjusted gross income, two children, about ${usd(base.monthly)} a month; shared custody presumed from ${pct(F.sharedPctOfYear)} of the year.`,
  intro: 'D.C. Code § 16-916.01 and its annual schedule, with the round-up rule, the 35% ceiling and the low-income adjustment applied to your figures.',
  resume: `A parent in the District of Columbia earning ${usd(A)} a month of adjusted gross income, facing ${usd(B)} on the other side, owes about ${usd(base.monthly)} a month for two children under D.C. Code § 16-916.01. The District reads its schedule on yearly figures, from ${usd(first)} up to ${usd(top[0])} of combined adjusted gross income, with one column for four or more children, and it never interpolates: an income between two rows takes the next higher row. Three limits then shape the order. The total, child care and health premiums included, may not exceed ${pct(F.capPctOfAdjustedGross)} of the payer's adjusted gross income. A low-income adjustment keeps the self-support reserve of ${usd(SSR)} a year out of reach and presumes ${usd(F.presumedMinimumMonthly)} a month near that level. And once the child spends ${pct(F.sharedPctOfYear)} of the year with each parent, shared physical custody is presumed, here bringing the same order to ${usd(shared40.monthly)} at ${num(forty)} nights.`,
  body: (h) => `<h2>A yearly table that always rounds up</h2>
<p>Most guideline tables are monthly. The District's Appendix I in § 16-916.01a is annual, opens at ${usd(first)} (the 2007 self-support reserve) and then climbs in steps of ${usd(rows[2][0] - rows[1][0])}. Subsection (f)(1)(B) settles the gap between steps in the parent's disfavor: the basic obligation is "rounded up to the next higher amount". Raise the paying parent of our example from ${usd(A)} to ${usd(offA)} a month and the combined figure passes a row by ${usd((offA - A) * 12)} a year; the next row applies and the order moves from ${usd(base.monthly)} to ${usd(off.monthly)}, so most of a ${usd(offA - A)} raise goes straight to support. The calculator reproduces that ceiling lookup instead of reading the row below.</p>
<p>The schedule has not moved since the revision effective ${day(d.effective!)}, which the OAG calculator still cites. One published cell looks wrong: at ${usd(oddRow[0])}, three children, the code prints ${usd(oddRow[3])} while the rows around it read ${usd(prevRow[3])} and ${usd(nextRow[3])}. We keep the figure as published and flag it, because only the Council can correct the text; a family at that exact income should check it with the court.</p>
<h2>Shared custody at ${pct(F.sharedPctOfYear)} of the year</h2>
<p>Subsection (q) speaks of time, not overnights; ${pct(F.sharedPctOfYear)} of a year is ${num(T)} nights once rounded up. Below that line, at ${num(T - 1)} nights, the order stays at ${usd(below.monthly)}. From ${num(T)} nights the basic obligation is multiplied by ${num(F.sharedMultiplier, 1)}, each parent keeps the part matching his or her own time, the remainders are offset, and the result here falls to ${usd(shared.monthly)}. Paragraph (G) adds a ceiling of its own: the shared result may never exceed the sole-custody amount, which can happen when one parent earns nearly everything. Either parent can rebut the presumption by showing that the time split does not reflect who actually pays for the child.</p>
<h3>Where the ${pct(F.capPctOfAdjustedGross)} ceiling and the reserve bite</h3>
<p>A parent with ${usd(capA)} a month, four children and no income on the other side would owe the full row amount; subsection (n) stops the total at ${pct(F.capPctOfAdjustedGross)} of that parent's income, ${usd(capped.monthly)} a month. Lower down, the low-income adjustment of subsection (m) is the very last step. At ${usd(nearA)} a month against ${usd(poorB)}, one child, the income share would be ${usd(nearShare)}, but only ${usd(near.monthly)} sits above the reserve, so that is the order. At ${usd(poorA)} a month the yearly income falls under ${usd(SSR)} and the remainder under ${usd(F.lowIncomeMinAbilityAnnual)} a year: subsection (g) then presumes the parent can pay ${usd(poor.monthly)}, a presumption the judge may move down to zero or above. The reserve itself is the figure the code prints for April 1, 2015; the Mayor is supposed to update it every two years, and no later notice was found on official pages, so the calculator keeps the printed amount. Compare the neighboring ${h.a('child-support:maryland', 'Maryland schedule')}, which works on monthly income.</p>`,
  faqs: [
    { q: 'Does DC child support round the schedule up or down?', a: `Up. D.C. Code § 16-916.01(f)(1)(B) says that when combined adjusted gross income falls between two amounts in the schedule, the basic obligation is rounded up to the next higher amount. The rows are yearly and spaced ${usd(rows[2][0] - rows[1][0])} apart, so a small raise can push a family into the next row: in our example ${usd(offA - A)} more a month moves the order from ${usd(base.monthly)} to ${usd(off.monthly)}.` },
    { q: 'How much time triggers shared custody support in the District of Columbia?', a: `${pct(F.sharedPctOfYear)} or more of the year with each parent, about ${num(T)} nights. At that point § 16-916.01(q) presumes shared physical custody: the basic amount is multiplied by ${num(F.sharedMultiplier, 1)}, each parent keeps the share for his or her own time and the difference is paid. With ${usd(A)} against ${usd(B)} and two children, ${num(forty)} nights give ${usd(shared40.monthly)} a month instead of ${usd(base.monthly)}.` },
    { q: 'Is there a cap on child support in DC as a share of income?', a: `Yes. Under § 16-916.01(n) the order, including health insurance, extraordinary medical costs and child care, cannot exceed ${pct(F.capPctOfAdjustedGross)} of the paying parent's adjusted gross income. It mostly matters with several children and a parent who earns most of the household money: with ${usd(capA)} a month, four children and no other income, the order stops at ${usd(capped.monthly)}.` },
    { q: 'What is the minimum child support order in Washington, DC?', a: `When a paying parent's adjusted gross income is below the self-support reserve, or exceeds it by less than ${usd(F.lowIncomeMinAbilityAnnual)} a year, § 16-916.01(g) presumes the parent can pay ${usd(F.presumedMinimumMonthly)} a month. The judge can lower it to zero or raise it after hearing about disability, incarceration, housing costs or benefits. The same amount may be ordered when a parent fails to appear or to disclose income.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:maryland', 'child-support:virginia', 'workers-comp:district-of-columbia'],
});
