import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day, listOf } from '../../../lib/kit';

const d = cs('georgia');
const S = d.schedule!;
const F = d.formula as { exponent: number; lowIncomeAtOrBelow: number; lowIncomePctAtOrBelow1500: number[] };
const LOW = (d as unknown as { extra: { lowIncomeAdjustmentTable: { rows: Array<Array<number | null>> } } }).extra.lowIncomeAdjustmentTable;
const e = F.exponent;
const A = 5000, B = 3000;
const base = csCalc('georgia', A, B, 2);
const nights = [0, 73, 100, 150, 182];
const ladder = nights.map((n) => csCalc('georgia', A, B, 2, { payerOvernights: n }).monthly);
const lowA = 2000;
const lowCase = csCalc('georgia', lowA, lowA, 2);
const lowPlain = (lowCase.basicMonthly * lowA) / (2 * lowA);
const lastRow = (n: number) => { const r = LOW.rows.filter((x) => x[n] != null); return r[r.length - 1][0] as number; };
const lowTops = [1, 2, 3, 4, 5, 6].map(lastRow);
const top = S.rows[S.rows.length - 1];

export default defineStatePage({
  topic: 'child-support',
  slug: 'georgia',
  title: `Georgia Child Support Calculator 2026: Parenting Time Rule`,
  description: `Georgia child support in 2026: the table runs to ${usd(S.maxIncome)} of combined adjusted income and, with ${usd(A)} and ${usd(B)}, two children cost about ${usd(base.monthly)} a month.`,
  intro: 'The O.C.G.A. § 19-6-15 table, the new parenting time adjustment and the low-income table, applied to your two incomes.',
  resume: `In Georgia, a noncustodial parent with ${usd(A)} of monthly adjusted gross income, facing a custodial parent at ${usd(B)}, owes about ${usd(base.monthly)} a month for two children before any parenting time, child care or insurance. That figure is a pro rata share of the ${usd(base.basicMonthly)} that the basic child support obligation table in O.C.G.A. § 19-6-15(o) lists for a combined ${usd(A + B)}. Since January 1, 2026, Georgia no longer uses a parenting time deviation that a judge could grant or refuse: every court-ordered day now feeds a formula that raises both parents' days to the power ${num(e, 1)}, so ${num(nights[2])} days a year bring the same parent down to ${usd(ladder[2])}. A second new rule protects low earners: a parent whose own adjusted income sits below the top of the low-income adjustment table pays the lesser of the normal amount and that table. The table itself has been in force since ${day(d.effective!)} and stops at ${usd(S.maxIncome)} of combined income.`,
  body: (h) => `<h2>The 2026 switch from deviation to formula</h2>
<p>Until the end of 2025, a Georgia parent who had the children every other weekend asked the court for a parenting time deviation, and the result depended on the judge. Senate Bill 454 kept the table in force since ${day(d.effective!)} but made parenting time arithmetic. Each parent's yearly days (overnights averaged over two years, or daytime hours divided by 24) are raised to the power ${num(e, 1)}. The noncustodial parent's days, so transformed, multiply the custodial parent's dollar share; the custodial parent's days multiply the noncustodial share; the difference, divided by the sum of the two powered numbers, is added to the noncustodial share. Section 19-6-15(g)(2)(B)(viii) calls that result the parenting time adjustment.</p>
<p>The statute stops there. It does not spell out, in subsection (g), how Schedule C uses the adjustment. We read it the only way consistent with (g)(1)(B), which says the adjustment may bring the noncustodial share to zero or above the custodial parent's: the adjustment is subtracted from the noncustodial share. Equal days and equal incomes then give zero, which is what the statute describes. If the Child Support Commission's Schedule C ever shows another arrangement, the court's worksheet prevails over this estimate.</p>
${h.table(['Days a year with the paying parent', 'Monthly support, two children'], nights.map((n, i) => [num(n), usd(ladder[i])]), `Georgia, ${usd(A)} and ${usd(B)} of adjusted income, no add-ons`, ['l', 'r'])}
<p>The curve is gentle at first and steep later. Going from no time to ${num(nights[1])} days (roughly alternate weekends) saves ${usd(ladder[0] - ladder[1])} a month; going from ${num(nights[3])} to ${num(nights[4])} days saves ${usd(ladder[3] - ladder[4])}. There is no cliff at a fixed number of nights, unlike the thresholds of neighboring ${h.aIf('child-support:north-carolina', 'North Carolina')}, so a schedule change of a few days moves the order only a little.</p>
<h2>Closest row, not interpolation</h2>
<p>Georgia does not interpolate. Section 19-6-15(b)(4) sends you to the income bracket most closely matched to the combined adjusted gross income, so ${usd(A + B + 20)} and ${usd(A + B - 20)} read the same line. Above ${usd(top[0])} the parents are high-income: the court starts from the top line (${usd(top[2])} for two children) and may deviate upward. Below ${usd(S.minIncome)} there is no line at all, and the low-income rule takes over.</p>
<h3>The low-income table, column by column</h3>
<p>Subsection (p) is a second table, read on one parent's own income rather than on the combined figure. Up to ${usd(F.lowIncomeAtOrBelow)} it is a flat percentage of income: ${listOf(F.lowIncomePctAtOrBelow1500.map((p, i) => `${pct(p)} for ${i + 1}`))} children. Above that, dollar amounts climb in ${usd((LOW.rows[1][0] as number) - (LOW.rows[0][0] as number))} steps until the column ends, at ${usd(lowTops[0])} for one child and ${usd(lowTops[5])} for six. Take two parents at ${usd(lowA)} each with two children: the pro rata share would be ${usd(lowPlain)}, the low-income table gives ${usd(lowCase.monthly)}, and the lower figure is the presumptive order. When an income falls between two rows of this second table, the statute is silent; the calculator uses the closest row, as the main table does.</p>
<p>Work-related child care and the children's health insurance premium are added on Schedule D and split pro rata. A ${h.a('child-support', 'comparison with other states')} shows how unusual a power-curve parenting rule still is.</p>`,
  faqs: [
    { q: 'How many days do I need for the Georgia parenting time adjustment?', a: `None in particular. Since January 1, 2026 the adjustment applies to any court-ordered parenting time, measured in days a year averaged over two years. Because each parent's days are raised to the power ${num(e, 1)}, a few days change little, while moving toward an equal schedule lowers the order quickly. With ${usd(A)} and ${usd(B)} of income and two children, ${num(nights[2])} days give about ${usd(ladder[2])} a month.` },
    { q: 'Does Georgia average the parenting days over one year or two?', a: 'Two. The parenting time unit of measurement in O.C.G.A. § 19-6-15(a)(17.1) counts the days a parent spends with the child over a two-year period and takes the annual average, which smooths alternating holiday schedules. A day is an overnight, or, for regular daytime visits without overnights, the total hours of parenting time divided by 24. Only court-ordered time counts.' },
    { q: 'What if a Georgia parent earns less than the top of the low-income table?', a: `That parent's support is the lesser of the normal guideline amount and the low-income adjustment table amount for the number of children. Up to ${usd(F.lowIncomeAtOrBelow)} a month the table is a percentage of income, from ${pct(F.lowIncomePctAtOrBelow1500[0])} for one child to ${pct(F.lowIncomePctAtOrBelow1500[5])} for six; above it the table lists dollar amounts until the column ends. The Commission's calculator makes the comparison automatically.` },
    { q: 'Is Georgia child support based on gross or net income?', a: `On adjusted gross income. Each parent starts from gross income before taxes, then deducts one-half of self-employment tax, child support already being paid under earlier orders and, if the court allows it, a theoretical order for other children living with the parent. The two adjusted incomes are added and the combined figure is read in the table, which currently stops at ${usd(S.maxIncome)} a month.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:north-carolina', 'child-support:virginia'],
});
