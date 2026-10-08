import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day, listOf } from '../../../lib/kit';

const d = cs('iowa');
const rows = d.schedule!.rows;
const top = rows[rows.length - 1];
const F = d.formula as { visitationBands: Array<[number, number]>; visitationFloorByChildren: number[]; jointMultiplier: number; jointTimeFactor: number; jointMinOvernights: number; areaATo: number; areaBFrom: number; areaBToByChildren: number[] };
const X = (d as unknown as { extra: { gaps: { missingRows: number[][] } } }).extra;
const gap = X.gaps.missingRows[0];
const before = rows.find((r) => r[1] === gap[0] - 1)!, after = rows.find((r) => r[0] === gap[1] + 1)!;
const A = 4000, B = 2000;
const base = csCalc('iowa', A, B, 2);
const nights = [0, F.visitationBands[0][0] - 1, F.visitationBands[0][0], F.visitationBands[1][0], F.visitationBands[2][0]];
const ladder = nights.map((n) => csCalc('iowa', A, B, 2, { payerOvernights: n }).monthly);
const joint = csCalc('iowa', A, B, 2, { payerOvernights: 183 });
const aIn = F.areaATo, aOut = F.areaBFrom, rich = 3000;
const inA = csCalc('iowa', aIn, rich, 1), inB = csCalc('iowa', aOut, rich, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'iowa',
  title: 'Iowa Child Support Calculator 2026: New Chapter 9 Schedule',
  description: `Iowa child support 2026 with the schedule in force since ${day(d.effective!)}: ${usd(A)} and ${usd(B)} of net monthly income and two kids give ${usd(base.monthly)} a month to pay.`,
  intro: 'Iowa Court Rule 9.26 as amended for January 2026, with the low-income Areas A and B, the visitation credit and joint physical care.',
  resume: `Iowa replaced its schedule of basic support obligations on ${day(d.effective!)}, by a Supreme Court order of September 29, 2025, and the top of the table rose to ${usd(top[1])} of combined adjusted net monthly income. A noncustodial parent with ${usd(A)} of net income, facing ${usd(B)}, owes ${usd(base.monthly)} a month for two children: a two-thirds share of the ${usd(base.basicMonthly)} printed for a combined ${usd(A + B)}. Iowa starts from net income after federal and state tax computed with the guidelines method, payroll taxes, union dues and a few other items. Time is credited in three steps from ${num(F.visitationBands[0][0])} overnights a year, worth ${listOf(F.visitationBands.map(([, c]) => `${c}%`))}, and equally shared physical care follows its own offset method. Below ${usd(aIn)} the paying parent's income is read alone. One detail of the new table: the row for ${usd(gap[0])} to ${usd(gap[1])} was never printed.`,
  body: (h) => `<h2>A missing line in the 2026 table</h2>
<p>The rule 9.26 schedule climbs in ${usd(50)} brackets. Between ${usd(before[0])}-${usd(before[1])} and ${usd(after[0])}-${usd(after[1])} there is nothing: the order's attachment and the consolidated chapter published by the Legislature both jump over ${usd(gap[0])} to ${usd(gap[1])}. A family whose combined net income lands there has no printed amount. The calculator takes the line below (${usd(before[3])} for two children, against ${usd(after[3])} on the next line); a court may well use the next one or average them, so treat any figure in that band as an estimate within about ${usd(after[3] - before[3])}.</p>
<h2>Areas A, B and C</h2>
<p>The low-income adjustment is part of the table. In Area A, up to ${usd(F.areaATo)}, only the noncustodial parent's own income counts and the amounts are small minimums (${usd(rows[0][2])} for one child at the bottom line). Area B starts at ${usd(F.areaBFrom)} and ends at ${listOf(F.areaBToByChildren.map((v, i) => `${usd(v)} for ${i < 4 ? i + 1 : '5 or more'}`))} children; there, two calculations are made and the lower wins. Area C is ordinary income shares.</p>
${h.table(['Paying parent, net monthly', 'Other parent', 'Monthly support, one child'], [[usd(aIn), usd(rich), usd(inA.monthly)], [usd(aOut), usd(rich), usd(inB.monthly)]], 'Iowa, across the Area A / Area B line', ['l', 'r', 'r'])}
<h2>Credits for visitation, and the 50/50 grid</h2>
<p>Rule 9.9 has not moved with the 2026 update: court-ordered visitation over ${num(F.visitationBands[0][0] - 1)} overnights cuts the noncustodial parent's share by a flat percentage, never below ${listOf(F.visitationFloorByChildren.slice(0, 3).map((v) => usd(v)))} for one, two and three or more children.</p>
${h.table(['Overnights a year', 'Monthly support, two children'], nights.map((n, i) => [num(n), usd(ladder[i])]), `Iowa, ${usd(A)} and ${usd(B)} net, no add-ons`, ['l', 'r'])}
<p>Equally shared physical care is a separate grid in rule 9.14(3): combined incomes are always used, even in the shaded areas, each parent's share is multiplied by ${num(F.jointMultiplier, 1)} for the cost of two homes and by ${num(F.jointTimeFactor, 1)} for half the time, and the two amounts are offset. For the same family that leaves ${usd(joint.monthly)} a month. Child care is now an add-on rather than a reason to vary, capped at half of the noncustodial parent's disposable income; the calculator splits it by income without that cap. The official text is on ${h.ext('https://www.legis.iowa.gov/docs/ACO/CourtRulesChapter/9.pdf', 'legis.iowa.gov')}; see also ${h.a('child-support:nebraska', 'Nebraska')} and ${h.a('child-support:illinois', 'Illinois')}.</p>`,
  faqs: [
    { q: 'What changed in the Iowa child support guidelines in 2026?', a: `From ${day(d.effective!)} Iowa uses a new schedule of basic support obligations, extended to ${usd(top[1])} of combined net monthly income, plus an updated medical support table, a child care expense add-on in place of the old child care variance, and revised worksheets. The low-income adjustment and the extraordinary visitation credit were kept. The Supreme Court adopted the changes by order of September 29, 2025.` },
    { q: 'How does the Iowa extraordinary visitation credit work?', a: `When court-ordered visitation exceeds ${num(F.visitationBands[0][0] - 1)} overnights a year, the noncustodial parent's share of the basic obligation drops ${F.visitationBands[0][1]}% from ${num(F.visitationBands[0][0])} to ${num(F.visitationBands[1][0] - 1)} nights, ${F.visitationBands[1][1]}% up to ${num(F.visitationBands[2][0] - 1)}, and ${F.visitationBands[2][1]}% from ${num(F.visitationBands[2][0])} until care is equally shared. The credit cannot push support under ${usd(F.visitationFloorByChildren[0])} for one child. Not exercising the visitation can justify a modification.` },
    { q: 'What if an Iowa parent only receives SSI?', a: 'Then the guideline support is zero. Rule 9.4 says the appropriate amount of child support is nothing when the noncustodial parent\'s only income is Supplemental Security Income. Other disability income, such as Social Security disability benefits, counts as income, and benefits paid to the child on that parent\'s record are handled in the worksheet.' },
    { q: 'Does Iowa child support continue after 18?', a: 'Yes, for a child between 18 and 19 who is engaged full-time in completing high school graduation or equivalency requirements in a way expected to finish before 19, under Iowa Code § 598.1. Support can also cover a child of any age who depends on the parents because of a physical or mental disability. College help is a separate postsecondary education subsidy.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:nebraska', 'child-support:illinois', 'child-support:wisconsin'],
});
