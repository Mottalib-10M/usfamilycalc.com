import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day, toMonthly } from '../../../lib/kit';

const d = cs('indiana');
const S = d.schedule!;
const PCT = (d as unknown as { extra: { aboveMaxPct: number[] } }).extra.aboveMaxPct;
const PT = (d.shared as unknown as { table: Array<{ from: number; to: number; total: number; duplicated: number }> }).table;
const wk = (m: number) => (m * 12) / 52;
const mo = (w: number) => toMonthly(w, 'weekly');
const AW = 1200, BW = 800;
const A = mo(AW), B = mo(BW);
const base = csCalc('indiana', A, B, 2);
const ptStart = PT.find((r) => r.total > 0)!;
const eq = PT[PT.length - 1];
const nights = [0, ptStart.from, 98, 130, eq.from];
const ladder = nights.map((n) => wk(csCalc('indiana', A, B, 2, { payerOvernights: n }).monthly));
const rowOf = (n: number) => PT.find((r) => n >= r.from && n <= r.to);
const bigW = 12000;
const big = csCalc('indiana', mo(bigW * 0.75), mo(bigW * 0.25), 3);
const step = S.rows[1][0] - S.rows[0][0];

export default defineStatePage({
  topic: 'child-support',
  slug: 'indiana',
  title: `Indiana Child Support Calculator 2026: Weekly Schedules`,
  description: `Indiana child support 2026: weekly guideline schedules up to ${usd(S.maxIncome)}, a parenting time table from ${num(ptStart.from)} overnights, and ${usd(wk(base.monthly))} a week for two children in our example.`,
  intro: 'The Guideline Schedules for Weekly Support Payments and the Parenting Time Table of the Indiana Child Support Guidelines, applied to two weekly incomes.',
  resume: `Indiana counts child support by the week. A noncustodial parent with ${usd(AW)} of weekly adjusted income and a custodial parent at ${usd(BW)} owe, between them, a Basic Child Support Obligation of ${usd(wk(base.basicMonthly))} a week for two children, and the noncustodial share comes to about ${usd(wk(base.monthly))} a week, or ${usd(base.monthly)} a month, before child care, insurance and parenting time. The figures come from the Guideline Schedules for Weekly Support Payments revised for ${day(d.effective!)}, which run in ${usd(step)} steps from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined weekly income and cover up to eight children. Parenting time is not a threshold here: a table of overnights starting at ${num(ptStart.from)} turns each band into a credit built from transferred and duplicated costs, so ${num(nights[2])} overnights cut the same order to ${usd(ladder[2])} a week. Above ${usd(S.maxIncome)} a week, the schedule prints a percentage per number of children instead of rows.`,
  body: (h) => `<h2>Why the Hoosier numbers are weekly</h2>
<p>Indiana courts set support in dollars per week, and every line of the Child Support Obligation Worksheet is weekly. Paychecks paid twice a month or once a month have to be converted first: multiply a monthly figure by twelve and divide by fifty-two. The calculator above takes monthly amounts like the other states and does that conversion for you, then shows the weekly order next to its monthly equivalent. The 2024 schedules rose at every income level after the review found that intact families spend more on children than the old table assumed; ${h.ext('https://rules.incourts.gov/Content/child-support/guideline1/current.htm', 'Guideline 1')} ties the change to child-spending estimates drawn from the 2013 to 2019 Consumer Expenditure Survey.</p>
<p>Between two rows, Guideline 3D says to round to the nearest amount, so a combined ${usd(AW + BW + 4)} reads the same line as ${usd(AW + BW)}. Below ${usd(S.minIncome)} a week there is no schedule line and no fixed minimum: Guideline 2 asks the court to protect a subsistence level and allows a $0.00 order where it fits.</p>
<h2>The Parenting Time Table</h2>
<p>Guideline 6 replaced the old flat visitation credit with Table PT. Each band of annual overnights gives two fractions of the Basic Child Support Obligation: a TOTAL share (spending that moves with the child, plus the duplicated part) and a DUPLICATED share (housing and other costs both homes carry). The credit equals the obligation times TOTAL, minus the obligation times DUPLICATED times the noncustodial parent's percentage of income. That last term is why a well-paid noncustodial parent gets a smaller credit than a modest earner with the same schedule.</p>
${h.table(['Overnights a year', 'TOTAL / DUPLICATED', 'Weekly support, two children'], nights.map((n, i) => { const r = rowOf(n); return [num(n), r && r.total > 0 ? `${r.total} / ${r.duplicated}` : 'no credit', usdx(ladder[i])]; }), `Indiana, ${usd(AW)} and ${usd(BW)} of weekly adjusted income, no add-ons`, ['l', 'r', 'r'])}
<p>The ${h.ext('https://rules.incourts.gov/Content/child-support/guideline6/current.htm', 'Guideline 6 commentary')} notes that the standard Parenting Time Guidelines, without turning midweek evenings into overnights, produce roughly 96 to 100 nights; that is the band most Indiana families land in. Equal time means ${num(eq.from)} to ${num(eq.to)} overnights, and then the court picks which parent carries the controlled expenses (clothing, school fees, ordinary medical bills) and gives the credit to the other one. The credit is not automatic, and a parent who skips scheduled time can lose it.</p>
<h3>Very high incomes</h3>
<p>The schedule stops at ${usd(S.maxIncome)} a week and prints a percentage per number of children in its footer, from ${PCT[0]}% for one child to ${PCT[PCT.length - 1]}% for eight. The footer does not say whether that rate applies to the whole combined income or only to the excess; applied to the whole income it reproduces the last row almost exactly, so that is how the calculator reads it. For ${usd(bigW)} a week of combined income and three children, the obligation would be ${usd(wk(big.basicMonthly))} a week. A judge can treat such incomes differently. Neighbors handle the same question in their own way: see ${h.aIf('child-support:illinois', 'Illinois')}, ${h.aIf('child-support:ohio', 'Ohio')} or ${h.aIf('child-support:kentucky', 'Kentucky')}.</p>`,
  faqs: [
    { q: 'Is Indiana child support calculated per week or per month?', a: `Per week. The Indiana guideline schedules, the worksheet and most orders are weekly. To compare with a monthly budget, multiply the weekly order by fifty-two and divide by twelve. With ${usd(AW)} and ${usd(BW)} of weekly adjusted income and two children, the noncustodial parent pays about ${usd(wk(base.monthly))} a week, which is ${usd(base.monthly)} a month, before any parenting time credit.` },
    { q: 'How many overnights start the Indiana parenting time credit?', a: `${num(ptStart.from)} overnights a year, the equivalent of alternate weekends. Below that, Table PT shows zero, though the court may grant a credit for an infant schedule or a long distance. From ${num(ptStart.from)} nights the credit grows band by band; with our example incomes it is worth ${usd(ladder[0] - ladder[1])} a week at ${num(ptStart.from)} nights and ${usd(ladder[0] - ladder[2])} at ${num(nights[2])}.` },
    { q: 'Who pays child support in Indiana when parenting time is equal?', a: `With ${num(eq.from)} to ${num(eq.to)} overnights each, the court first decides which parent pays the controlled expenses, such as clothing, school fees and ordinary uninsured medical costs, and the other parent receives the parenting time credit. The factors include who has paid them so far, who can pay them more readily, who takes the child to the doctor and who follows school activities.` },
    { q: 'When can an Indiana child support order be modified?', a: 'Guideline 4 allows a change on a substantial and continuing change of circumstances, or when the order is at least twelve months old and the amount now computed under the guidelines differs from it by more than 20%. A new schedule alone does not change existing orders; a parent has to file a petition, and any reduction can only reach back to the filing date.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:illinois', 'child-support:ohio', 'child-support:michigan', 'child-support:kentucky'],
});
