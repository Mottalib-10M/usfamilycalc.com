import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const SLUG = 'north-dakota';
const d = cs(SLUG);
const rows = d.schedule!.rows;
const floorRow = rows[0];
const top = rows[rows.length - 1];
const F = d.formula as { incomeRoundTo: number; extendedParentingOvernightsOver: number; extendedParentingFactor: number; daysInYear: number };
const OVER = F.extendedParentingOvernightsOver;
const A = 4000, B = 2000, richB = 9000;
const base = csCalc(SLUG, A, B, 2);
const richOther = csCalc(SLUG, A, richB, 2);
const nightsLadder = [0, OVER, OVER + 1, 120, 150];
const ladder = nightsLadder.map((n) => csCalc(SLUG, A, B, 2, { payerOvernights: n }).monthly);
const equalN = 182;
const equal = csCalc(SLUG, A, B, 2, { payerOvernights: equalN });
const otherAlone = csCalc(SLUG, B, 0, 2);
const lowEdge = A + F.incomeRoundTo / 2 - 1, highEdge = A + F.incomeRoundTo / 2;
const edgeLo = csCalc(SLUG, lowEdge, 0, 1), edgeHi = csCalc(SLUG, highEdge, 0, 1);
const bigA = 40000;
const big = csCalc(SLUG, bigA, 0, 1);
const keep = (n: number) => (F.daysInYear - n * F.extendedParentingFactor) / F.daysInYear;

export default defineStatePage({
  topic: 'child-support',
  slug: SLUG,
  title: 'North Dakota Child Support 2026: Obligor Income Only',
  description: `North Dakota child support 2026: only the obligor's net income counts, so ${usd(A)} a month means ${usd(base.monthly)} for two children; past ${num(OVER)} overnights the order shrinks.`,
  intro: 'The schedule of N.D. Admin. Code 75-02-04.1-10 read on the obligor alone, with the extended parenting time formula and the equal residential responsibility offset.',
  resume: `In North Dakota a parent with ${usd(A)} of monthly net income owes ${usd(base.monthly)} a month for two children, and that figure does not change whether the parent with the children earns ${usd(B)} or ${usd(richB)}. The state is one of the few that ignore the obligee's income: the schedule in section 75-02-04.1-10 of the Administrative Code, written by the Department of Health and Human Services and last amended effective ${day(d.effective!)}, is read on the obligor's income alone. Net income is rounded to the nearest ${usd(F.incomeRoundTo)} before the lookup, it yields nothing at ${usd(floorRow[0])} or less and it stops rising at ${usd(top[0])}, where one child costs ${usd(top[1])}. Time counts in two ways. More than ${num(OVER)} court-ordered overnights a year trigger the extended parenting time reduction, and an equal residential responsibility order replaces the whole calculation by an offset between two obligations, ${usd(equal.monthly)} in our example.`,
  body: (h) => `<h2>One income on the worksheet</h2>
<p>An income shares state adds both incomes and splits a combined amount. North Dakota does neither. The rules presume that one parent provides the home and the other pays, and the amount owed comes straight from the obligor's net income line. In our example the obligee could earn ${usd(B)} or ${usd(richB)} a month: the calculator returns ${usd(base.monthly)} with the first figure and ${usd(richOther.monthly)} with the second. The obligee's income can only come back as a ground for a downward deviation when it reaches three times the obligor's (75-02-04.1-09(2)(p)), and that is the court's call, not the calculator's.</p>
<p>Net income has its own construction. Taxes are hypothetical: a federal amount at single filing status with the standard deduction, plus a state amount fixed at a share of that federal figure, whatever the parent really pays. Premiums for the children's health, dental and vision coverage are subtracted at this stage; if you enter one as paid by the obligor, the calculator removes it from that income. Child care has no line at all: it is a reason to deviate, so the tool shows it but does not add it.</p>
<h2>The ${usd(F.incomeRoundTo)} rounding and the dollar rounding</h2>
<p>Section 75-02-04.1-02(5) rounds monthly net income ending in ${usd(F.incomeRoundTo / 2)} or more up to the next hundred, anything less down. The effect is visible at the edge: one child, ${usd(lowEdge)} of net income gives ${usd(edgeLo.monthly)}, while ${usd(highEdge)} gives ${usd(edgeHi.monthly)}. Every other computed amount is rounded to the whole dollar, fifty cents going up. At the top, the line reading "${num(top[0], 0)} or more" applies to any higher income: an obligor at ${usd(bigA)} still owes ${usd(big.monthly)} for one child unless the obligee proves the child's needs justify more.</p>
<h3>Extended parenting time, overnight by overnight</h3>
<p>Section 75-02-04.1-08.1 applies only when a court order schedules more than ${num(OVER)} overnights a year with the obligor and states the number. The amount is divided by the number of children; each child's share is multiplied by ${num(F.daysInYear)} minus ${num(F.extendedParentingFactor, 2)} times that child's overnights, over ${num(F.daysInYear)}. At ${num(nightsLadder[3])} nights the obligor keeps paying ${num(keep(nightsLadder[3]) * 100, 1)}% of the schedule amount.</p>
${h.table(['Court-ordered overnights with the obligor', 'Share of the schedule amount kept', 'Monthly support, two children'], nightsLadder.map((n, i) => [num(n), n > OVER ? `${num(keep(n) * 100, 1)}%` : '100%', usd(ladder[i])]), `North Dakota, obligor net income ${usd(A)} a month`, ['left', 'right', 'right'])}
<p>Crossing to ${num(OVER + 1)} nights removes about ${usd(ladder[0] - ladder[2])} a month at once, because the formula then counts every overnight, not just those above ${num(OVER)}; after that, each extra night is worth roughly ${usd((F.extendedParentingFactor / F.daysInYear) * ladder[0], 2)}. Equal residential responsibility (75-02-04.1-08.2) works differently: each parent is treated as an obligor of the other, here ${usd(base.monthly)} against ${usd(otherAlone.monthly)}, and only the difference of ${usd(equal.monthly)} changes hands; the extended parenting time reduction is then excluded. The calculator treats ${num(equalN)} or ${num(equalN + 1)} overnights as an equal order. To compare with an income shares neighbor, see ${h.a('child-support:minnesota', 'Minnesota')}.</p>`,
  faqs: [
    { q: 'Does the other parent’s income matter for North Dakota child support?', a: `Not for the guideline amount. North Dakota reads its schedule on the obligor's net income only, so ${usd(A)} a month gives ${usd(base.monthly)} for two children whether the parent with the children earns ${usd(B)} or ${usd(richB)}. The obligee's income becomes relevant only as a deviation ground when it is at least three times the obligor's, or when the parents have equal residential responsibility and each one's obligation is computed.` },
    { q: 'How many overnights reduce child support in North Dakota?', a: `More than ${num(OVER)} a year, set by court order. Above that line, 75-02-04.1-08.1 multiplies each child's share by (${num(F.daysInYear)} minus ${num(F.extendedParentingFactor, 2)} times the overnights) divided by ${num(F.daysInYear)}. With ${usd(A)} of net income and two children, ${num(nightsLadder[3])} overnights take the order from ${usd(base.monthly)} to ${usd(ladder[3])}. Visits that are not in the order do not count.` },
    { q: 'How is child support set in North Dakota with equal residential responsibility?', a: `Each parent's obligation is calculated as if the other parent had the children, using that parent's own net income, and the smaller amount is subtracted from the larger. With ${usd(A)} against ${usd(B)} and two children the figures are ${usd(base.monthly)} and ${usd(otherAlone.monthly)}, so ${usd(equal.monthly)} is paid. The court may also split child care and school activity fees on top of that offset.` },
    { q: 'What is the highest income on the North Dakota child support schedule?', a: `${usd(top[0])} of monthly net income. The last line applies to that income or more: ${usd(top[1])} for one child up to ${usd(top[6])} for six or more. An obligee who wants more for a high earner must show the child's demonstrated needs under 75-02-04.1-09(2)(b). At the bottom, ${usd(floorRow[0])} or less of net income gives no scheduled support.` },
  ],
  related: ['child-support', 'child-support:minnesota', 'child-support:south-dakota', 'workers-comp:north-dakota', 'how-much-is-child-support'],
});
