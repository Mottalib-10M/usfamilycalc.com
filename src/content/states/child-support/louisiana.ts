import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day } from '../../../lib/kit';

const d = cs('louisiana');
const S = d.schedule!;
const F = d.formula as { sharedConventionOvernights: number; daysPerYear: number };
const M = d.shared!.multiplier!;
const A = 7000, B = 3000;
const base = csCalc('louisiana', A, B, 3);
const nights = [0, 100, F.sharedConventionOvernights - 1, F.sharedConventionOvernights, 182];
const ladder = nights.map((n) => csCalc('louisiana', A, B, 3, { payerOvernights: n }).monthly);
const step = S.rows[1][0] - S.rows[0][0];
const mid = S.rows[100][0] + step / 2;
const lo = S.rows[100], hi = S.rows[101];
const midCase = csCalc('louisiana', mid, 0, 1);
const top = S.rows[S.rows.length - 1];
const bigA = 45000, bigB = 15000;
const big = csCalc('louisiana', bigA, bigB, 2);
const first = S.rows[0];

export default defineStatePage({
  topic: 'child-support',
  slug: 'louisiana',
  title: `Louisiana Child Support Calculator 2026: R.S. 9:315.19`,
  description: `Louisiana child support 2026: the R.S. 9:315.19 schedule in force since ${day(d.effective!)}, read up to ${usd(S.maxIncome)} a month; ${usd(base.monthly)} for three children in our example.`,
  intro: 'The 2025 Louisiana schedule of La. R.S. 9:315.19, the shared custody rule of 9:315.9 and the floor above the table, applied to your incomes.',
  resume: `A Louisiana parent with ${usd(A)} of adjusted monthly gross income and a co-parent at ${usd(B)} owes about ${usd(base.monthly)} a month for three children under the guidelines of La. R.S. 9:315 and following. The figure starts from the schedule that the legislature enacted in Act 86 of 2024 and that applies from ${day(d.effective!)}: it gives ${usd(base.basicMonthly)} for three children at a combined ${usd(A + B)}, and the paying parent's share follows his or her ${num(base.payerShare * 100)}% of income. The new schedule climbs to ${usd(S.maxIncome)} of combined monthly income, and amounts between two of its ${usd(step)} lines are extrapolated rather than rounded. Above the last line the judge has discretion but may never order less than the top figure. Shared custody, meaning roughly equal time, multiplies the basic obligation by ${M} and nets the two parents' amounts; with ${num(nights[4])} overnights for the paying parent the order here drops to ${usd(ladder[4])}.`,
  body: (h) => `<h2>A schedule written into Title 9</h2>
<p>Louisiana keeps its schedule inside the Revised Statutes, in section 9:315.19, and changes it by act of the legislature. The current table came with Act 86 of the 2024 regular session and took effect on ${day(d.effective!)}. It opens at ${usd(first[0])} (${usd(first[1])} for one child) and closes at ${usd(top[0])}. The columns for two to six children carry the word TOTAL: each figure is the obligation for all the children together, not per child. The legislature's own web page repeats a block of rows in the upper range; the duplicates are identical and do not change any amount.</p>
<p>Where most tables are read on the nearest line, R.S. 9:315.13(B) asks for an extrapolation between the two amounts. For one child at ${usd(mid)}, halfway between the ${usd(lo[0])} and ${usd(hi[0])} lines (${usd(lo[1])} and ${usd(hi[1])}), the basic obligation is ${usdx(midCase.basicMonthly)}. Below ${usd(first[0])}, the court sets support from actual earnings and the ability to pay, and a parent with no proof of income is presumed able to earn 32 hours a week at minimum wage (R.S. 9:315.11).</p>
<h2>Above ${usd(top[0])}: the top line is a floor</h2>
<p>Many states let the judge go lower or higher once income passes the table. Louisiana only lets the judge go higher. Section 9:315.13(C) refers the court to the child's best interest and Civil Code article 141 but says the amount may never be less than the highest figure in the schedule, and allows part of it to go into a spendthrift trust for education or medical care. Parents with ${usd(bigA)} and ${usd(bigB)} a month and two children start from ${usd(big.basicMonthly)}, the top figure, and the payer's share of it is ${usd(big.monthly)}; the calculator shows that floor.</p>
<h3>Shared custody and joint custody are not the same</h3>
<p>Under R.S. 9:315.9, shared custody means each parent has physical custody for an approximately equal amount of time. The statute gives no number of days, so the calculator applies Worksheet B from ${num(F.sharedConventionOvernights)} overnights a year, our own convention. Worksheet B multiplies the basic obligation by ${M}, splits it by income, multiplies each parent's part by the share of time the children spend with the other parent, and nets the two. The result can never exceed what the payer would owe as a non-domiciliary parent. Ordinary joint custody is handled by R.S. 9:315.8(E) instead: past 73 days the court may grant a credit, but how much is left to its judgment, so the calculator does not deduct it.</p>
${h.table(['Overnights with the paying parent', 'Monthly support, three children'], nights.map((n, i) => [num(n), usdx(ladder[i])]), `Louisiana, ${usd(A)} and ${usd(B)} of adjusted gross income, no add-ons`, ['l', 'r'])}
<p>Next door, ${h.aIf('child-support:texas', 'Texas')} uses a percentage of net resources and ${h.aIf('child-support:mississippi', 'Mississippi')} a percentage of the payer's adjusted income, so a family moving across the Sabine or the Pearl River can see a very different figure.</p>`,
  faqs: [
    { q: 'When did the new Louisiana child support schedule take effect?', a: `On ${day(d.effective!)}. Act 86 of the 2024 regular session rewrote the schedule in La. R.S. 9:315.19, which now runs from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined adjusted monthly gross income for one to six children. The new table does not modify existing orders on its own; a parent must file for a modification, and the judgment can only reach back to the date of judicial demand.` },
    { q: 'How does Louisiana calculate support when income is above the schedule?', a: `The court uses its discretion in the child's best interest and the parents' circumstances, but under R.S. 9:315.13(C) the basic obligation can never be lower than the highest amount in the schedule. For two children that floor is ${usd(top[2])} a month. The judge may also place part of the award in a spendthrift trust for the child's education or medical needs.` },
    { q: 'Does Louisiana reduce child support for shared custody?', a: `Yes, when each parent has physical custody about half the time. R.S. 9:315.9 multiplies the basic obligation by ${M}, cross-multiplies each parent's income share by the other parent's time, and the parent owing more pays the difference, capped at the sole-custody amount. With ${usd(A)} and ${usd(B)} of income and three children, ${num(nights[4])} overnights give ${usd(ladder[4])} a month instead of ${usd(base.monthly)}.` },
    { q: 'Is a Louisiana parent with joint custody entitled to a credit?', a: 'Only possibly. In joint custody that is not shared custody, a parent ordered to pay who has physical custody for more than 73 days a year may receive a credit under R.S. 9:315.8(E). The court decides the amount after weighing the time spent, the added burden on the paying parent, the reduced burden on the other one and the child\'s best interest, and the parent who asks for the credit carries the burden of proving it. Worksheet A of R.S. 9:315.20 is used for the calculation.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:texas', 'child-support:mississippi', 'workers-comp:louisiana'],
});
