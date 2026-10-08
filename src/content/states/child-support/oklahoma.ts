import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('oklahoma');
const F = d.formula as { sharedBands: Array<[number, number]>; maxOvernightsOfPayingParent: number };
const rows = d.schedule!.rows;
const top = rows[rows.length - 1];
const row = (inc: number) => rows.find((r) => r[0] === inc)!;
const A = 4000, B = 2000;
const base = csCalc('oklahoma', A, B, 2);
const nights = [120, F.sharedBands[0][0], F.sharedBands[1][0] - 1, F.sharedBands[1][0], F.sharedBands[2][0] - 1, F.sharedBands[2][0], 182];
const ladder = nights.map((n) => csCalc('oklahoma', A, B, 2, { payerOvernights: n }).monthly);
const [b1, b2, b3] = F.sharedBands;
const odd = row(11300), before = row(11250), after = row(11350);
const tinyA = 400, tinyB = 200;
const tiny = csCalc('oklahoma', tinyA, tinyB, 3);

export default defineStatePage({
  topic: 'child-support',
  slug: 'oklahoma',
  title: 'Oklahoma Child Support Calculator 2026: 121-Night Rule',
  description: `Oklahoma child support 2026 under 43 O.S. § 119: ${usd(A)} and ${usd(B)} of gross income give about ${usd(base.monthly)} a month for two children before any overnight credit.`,
  intro: 'The 43 O.S. § 119 schedule, the 121-overnight adjustment with its three multipliers, and the add-ons, on your two gross incomes.',
  resume: `In Oklahoma a parent earning ${usd(A)} a month gross, with the other parent at ${usd(B)}, owes about ${usd(base.monthly)} a month for two children under the schedule of 43 O.S. § 119, before child care and medical support. The schedule is read on combined gross income in ${usd(50)} rows, each row applying from its amount up, and it has not been rewritten since ${day(d.effective!)}. Time with the paying parent changes nothing until ${num(b1[0])} overnights a year. From that night the combined amount is multiplied by ${num(b1[1])}, then ${num(b2[1], 2)} from ${num(b2[0])} nights and ${num(b3[1], 1)} from ${num(b3[0])}, and each parent's share is weighted by the other parent's time: at ${num(b3[0])} nights the same parent pays ${usd(ladder[5])}. A parent with more than ${num(F.maxOvernightsOfPayingParent)} overnights never pays support, and the adjusted figure can never exceed the unadjusted one.`,
  body: (h) => `<h2>Three multipliers, then a hard stop at ${num(F.maxOvernightsOfPayingParent)}</h2>
<p>Section 118E of Title 43 is built in steps. Below ${num(b1[0])} overnights, nothing. Between ${num(b1[0])} and ${num(b2[0] - 1)} the combined amount doubles before being split, because two homes each carry rent, food and transport; the factor falls to ${num(b2[1], 2)} up to ${num(b3[0] - 1)} nights and to ${num(b3[1], 1)} from ${num(b3[0])} on. Each parent's slice of the multiplied amount is then multiplied by the share of the year the children spend with the other parent, and the two results are offset. The adjustment is presumptive but not automatic: a court may refuse it when the extra nights do not create extra spending.</p>
${h.table(['Overnights with the paying parent', 'Monthly support, two children'], nights.map((n, i) => [num(n), usd(ladder[i])]), `Oklahoma, ${usd(A)} and ${usd(B)} gross, no add-ons`, ['l', 'r'])}
<p>For this family the first band does nothing: doubling the amount and weighting it by time gives more than the unadjusted ${usd(ladder[0])}, and the statute caps the result at the unadjusted figure. The savings arrive when the multiplier drops. At ${num(b2[0])} nights the order falls to ${usd(ladder[3])}, at ${num(b3[0])} to ${usd(ladder[5])}. The steps are uneven, so a parenting plan a few nights below a band edge can cost real money every month. Section 118E also treats exercising fewer nights than ordered as a material change, and the court can turn the support underpaid into a judgment.</p>
<h2>An old schedule with an odd cell</h2>
<p>The table runs from a first line of ${usd(rows[0][1])} for any number of children to ${usd(top[0])} of combined income, where two children cost ${usd(top[2])}. Above that the court adds an amount of its own choosing to the ${usd(top[0])} figure, and the calculator stops at the top line. Very low incomes all land on the floor: ${usd(tinyA)} and ${usd(tinyB)} with three children give ${usd(tiny.monthly)} a month for the paying parent.</p>
<p>Reading the statute line by line turns up two cells that break the pattern. At ${usd(odd[0])} the three-child column shows ${usd(odd[3])}, below the ${usd(before[3])} printed for ${usd(before[0])} and far from the ${usd(after[3])} of ${usd(after[0])}. The ${h.ext('https://oklahoma.gov/content/dam/ok/en/okdhs/documents/okdhs-document-library/excel/CSGuidelinesAccessible050125.xlsm', 'Oklahoma Human Services spreadsheet')} computes about ${usd(1988.62)} for that cell, which suggests a transposed digit. The calculator copies the statute as published; a family in that income band may want the worksheet checked.</p>
<h3>Who runs the numbers</h3>
<p>Oklahoma Human Services, Child Support Services, publishes the computation form and an ${h.ext('https://oklahoma.gov/okdhs/services/child-support-services/computation.html', 'Excel calculator')}. For the way neighboring states handle shared time, compare ${h.a('child-support:texas', 'Texas')} and ${h.a('child-support:kansas', 'Kansas')}.</p>`,
  faqs: [
    { q: 'How many overnights trigger the Oklahoma parenting time adjustment?', a: `${num(b1[0])} overnights a year, or an average of ${num(b1[0])} across all the children when time differs by child. Under 43 O.S. § 118E the combined schedule amount is then multiplied by ${num(b1[1])}, ${num(b2[1], 2)} or ${num(b3[1], 1)} depending on the band, split by income and weighted by time. The adjustment is presumptive, so the court can deny it if the extra time does not raise the parent's spending.` },
    { q: 'Can an Oklahoma parent with half the time still pay child support?', a: `Yes, when incomes differ. With equal time the multiplied amount is split by income and offset, so the higher earner usually pays something. What the statute rules out is support paid by a parent who has more than ${num(F.maxOvernightsOfPayingParent)} overnights a year, and any adjusted order above the amount the parent would owe without the adjustment.` },
    { q: `What happens above ${usd(top[0])} of combined income in Oklahoma?`, a: `43 O.S. § 119(B) takes the amount for ${usd(top[0])}, which is ${usd(top[1])} for one child and ${usd(top[2])} for two, and lets the court add an amount it decides. There is no formula for the excess. More than six children works the same way: the six-child figure plus an amount set by the court.` },
    { q: 'Does Oklahoma child support use gross income?', a: `Yes. Both parents' gross incomes from all sources are added, after small adjustments: Social Security paid to the child on a parent's account is added, and support alimony actually paid in an earlier case and a deduction for other children the parent supports are subtracted. Self-employment income is reduced by ordinary expenses and a 7.65% deduction.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:texas', 'child-support:kansas', 'child-support:arkansas'],
});
