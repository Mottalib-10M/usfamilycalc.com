import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day, listOf } from '../../../lib/kit';

const d = cs('kentucky');
const S = d.schedule!;
const F = d.formula as { ssrIncomeThresholdsByChildren: number[]; minimumOrder: number };
const BANDS = (d.shared as unknown as { table: Array<{ fromDays: number; toDays: number; pct: number }> }).table;
const SSR = d.lowIncome!.selfSupportReserve!;
const A = 4500, B = 3500;
const base = csCalc('kentucky', A, B, 2);
const first = BANDS[0], last = BANDS[BANDS.length - 1];
const days = [0, first.fromDays - 1, first.fromDays, 120, 150, last.fromDays];
const ladder = days.map((n) => csCalc('kentucky', A, B, 2, { payerOvernights: n }).monthly);
const credit88 = (base.basicMonthly * first.pct) / 100;
const lowA = 1050, lowB = 3000;
const low = csCalc('kentucky', lowA, lowB, 1);
const lowShare = low.basicMonthly * (lowA / (lowA + lowB));
const step = S.rows[1][0] - S.rows[0][0];
const top = S.rows[S.rows.length - 1];
const zeroTo = S.rows.filter((r) => r[1] === F.minimumOrder).pop()![0];

export default defineStatePage({
  topic: 'child-support',
  slug: 'kentucky',
  title: `Kentucky Child Support Calculator 2026: KRS 403.212 Table`,
  description: `Kentucky child support 2026: the KRS 403.212 table in force since ${day(d.effective!)}, the ${first.pct}% credit from ${num(first.fromDays)} days, and ${usd(base.monthly)} a month in our two-child example.`,
  intro: 'The statutory table of KRS 403.212, the shared parenting time credit of KRS 403.2122 and the self-support reserve, applied to two incomes.',
  resume: `A Kentucky parent with ${usd(A)} of monthly adjusted gross income, raising two children with a co-parent who earns ${usd(B)}, owes about ${usd(base.monthly)} a month under the guidelines table that the General Assembly wrote into KRS 403.212 itself. The table took effect on ${day(d.effective!)}, runs in ${usd(step)} rows up to ${usd(S.maxIncome)} of combined income, and lists ${usd(base.basicMonthly)} for two children at ${usd(A + B)}; each parent carries a share in proportion to income. Since 2024 parenting time has its own statute, KRS 403.2122, which replaced the repealed KRS 403.2121: a parent with at least ${num(first.fromDays)} days a year subtracts a percentage of the table amount, ${first.pct}% at first and ${last.pct}% for equal time, so ${num(days[3])} days bring the same parent to ${usd(ladder[3])}. Low earners fall under a self-support reserve of ${usd(SSR)}, and no order goes under ${usd(F.minimumOrder)} unless the parenting credit pushes it there.`,
  body: (h) => `<h2>A table that lives in the statute</h2>
<p>Most states print their schedule in a court rule or an agency regulation. Kentucky puts it in KRS 403.212(9), so every change goes through the legislature: the version used here came with 2024 Ky. Acts ch. 219 and has applied since ${day(d.effective!)}. Rows climb by ${usd(step)}. From ${usd(0)} to ${usd(zeroTo)} of combined income every cell reads ${usd(F.minimumOrder)}, the statutory floor, and the top line, ${usd(top[0])}, shows ${usd(top[2])} for two children. Above it, subsection (7) leaves the amount to the judge; the calculator stays on that top line. The statute does not say what to do with an income between two lines, so the estimate reads the line at or below it; a worksheet built by the Office of the Attorney General may round differently.</p>
<h2>The ${num(first.fromDays)}-day credit of KRS 403.2122</h2>
<p>The 2024 session repealed KRS 403.2121 and created a chart-based credit. A "day" means more than twelve consecutive hours in the parent's care, and the time must be court-ordered or exercised by agreement. The obligated parent looks up his or her days in the chart, multiplies the percentage by the total obligation, and subtracts the result from his or her own share.</p>
${h.table(['Days a year with the paying parent', 'Credit', 'Monthly support, two children'], days.map((n, i) => { const b = BANDS.find((x) => n >= x.fromDays && n <= Math.ceil(x.toDays)); return [num(n), b ? `${b.pct}%` : 'none', usd(ladder[i])]; }), `Kentucky, ${usd(A)} and ${usd(B)} of adjusted income, no add-ons`, ['l', 'r', 'r'])}
<p>The jump at the threshold is the thing to watch. One day short, at ${num(days[1])}, the order stays at ${usd(ladder[1])}; at ${num(first.fromDays)} the credit of ${usd(credit88)} applies at once. Because the percentage hits the whole table amount and not only the payer's share, a parent who earns less than the other can see the credit swallow most of the order at equal time. The court keeps discretion to adjust after weighing the payer's ability to keep a home for the child, distance, military duty and health coverage, and it may refuse the credit when the receiving parent gets KTAP, SNAP, Medicaid or KCHIP.</p>
<h3>Self-support reserve thresholds</h3>
<p>KRS 403.212(5)(b) protects a payer whose own adjusted income sits at or under ${listOf(F.ssrIncomeThresholdsByChildren.slice(0, 4).map((t, i) => `${usd(t)} for ${i + 1}`))} children (and ${usd(F.ssrIncomeThresholdsByChildren[5])} for six or more). The table is then read a second time at that parent's income alone and the lower figure wins. A payer at ${usd(lowA)} with one child and a co-parent at ${usd(lowB)} would owe ${usd(lowShare)} as a share, but the reserve gives ${usd(low.monthly)}. The reserve and the parenting credit cannot be stacked; the smaller result applies. Compare the day-based charts of ${h.aIf('child-support:indiana', 'Indiana')} and ${h.aIf('child-support:tennessee', 'Tennessee')}, or the ${h.a('child-support', 'national overview')}.</p>`,
  faqs: [
    { q: 'How many days do I need for the Kentucky shared parenting time credit?', a: `At least ${num(first.fromDays)} days a year under KRS 403.2122, counting a day as more than twelve consecutive hours of care. The credit is ${first.pct}% of the total obligation from ${num(first.fromDays)} to ${num(first.toDays)} days and rises in steps to ${last.pct}% for equal time. With ${usd(A)} and ${usd(B)} of income and two children, ${num(days[3])} days bring the order from ${usd(base.monthly)} to ${usd(ladder[3])} a month.` },
    { q: 'What happened to KRS 403.2121 in Kentucky?', a: `The General Assembly repealed it in 2024 and moved parenting time into a new section, KRS 403.2122, with a day-based chart, a twelve-hour definition of a day and a credit the parent must ask for by motion. The guidelines table was rewritten by the same 2024 act and applies from ${day(d.effective!)}, so worksheets printed before that date use outdated numbers.` },
    { q: 'What is the minimum child support order in Kentucky?', a: `${usd(F.minimumOrder)} a month, under KRS 403.212(6). The table shows that amount for every family size up to ${usd(zeroTo)} of combined income. The only exception named by the statute is the shared parenting time credit of KRS 403.2122(3), which may bring an order below the floor. A payer near the bottom of the scale is also covered by the ${usd(SSR)} self-support reserve.` },
    { q: 'Does Kentucky child support change when the table is updated?', a: 'Not by itself. Under KRS 403.213 a parent must file a motion, and a new calculation that moves the monthly amount by 15% or more is presumed to be a material change in circumstances. A smaller gap is presumed not to be one. The commission named in that statute reviews the table at least every four years and recommends changes to the General Assembly.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:ohio', 'child-support:indiana', 'child-support:tennessee', 'workers-comp:kentucky'],
});
