import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, pct, num } from '../../../lib/kit';

const d = cs('new-hampshire');
const R = d.schedule!.rows; // [annual combined net income, %1, %2, %3, %4+]
const first = R[0], last = R[R.length - 1];
const ssr = d.lowIncome!.selfSupportReserve!;
const minOrder = d.lowIncome!.minimumOrder!;
const rowStep = (d.formula as { tableRowStep: number }).tableRowStep;
const A = 3000, B = 2000; // monthly net
const one = csCalc('new-hampshire', A, B, 1);
const two = csCalc('new-hampshire', A, B, 2);
const pctOne = (one.basicMonthly / (A + B)) * 100;
const lo = R.filter((r) => r[0] <= (A + B) * 12).pop()!, hi = R.find((r) => r[0] > (A + B) * 12)!;
const tightA = 2100, tightB = 1500;
const tight = csCalc('new-hampshire', tightA, tightB, 2);
const tightRaw = tight.basicMonthly * (tightA / (tightA + tightB));
const rich = csCalc('new-hampshire', 12000, 4000, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'new-hampshire',
  title: `New Hampshire Child Support 2026: RSA 458-C Percentages`,
  description: `New Hampshire child support 2026: ${pct(first[1])} down to ${pct(last[1])} of combined net income for one child, a ${usdx(ssr)} reserve and a ${usd(minOrder)} minimum order; ${usd(one.monthly)} a month in our example.`,
  intro: 'RSA 458-C:3 applies a percentage of the parents’ combined net income that slides with that income; here is how it is read.',
  resume: `New Hampshire takes a percentage of the parents' combined net income and divides the result between them by income. The percentage is not fixed: RSA 458-C:3 lists it at ${num(R.length)} income levels, from ${pct(first[1])} for one child at ${usd(first[0])} of annual net income or less to ${pct(last[1])} at ${usd(last[0])} or more, and the Department of Health and Human Services interpolates between the levels. Two parents with ${usd(A)} and ${usd(B)} of net income a month, ${usd((A + B) * 12)} a year together, fall between the ${usd(lo[0])} and ${usd(hi[0])} levels, so the one-child rate is about ${pct(Math.round(pctOne * 1000) / 1000)}. The total is ${usd(one.basicMonthly)} a month and the parent with ${pct((A / (A + B)) * 100)} of the income owes ${usd(one.monthly)}, or ${usd(two.monthly)} for two children. A self-support reserve of ${usdx(ssr)} a month for 2026 limits what a low earner pays, with a ${usd(minOrder)} minimum order. Orders are rounded to the nearest dollar.`,
  body: (h) => `<h2>${num(R.length)} income levels and the space between them</h2>
<p>Most states print hundreds of rows. New Hampshire's statute prints ${num(R.length)}, and each holds four percentages, for one, two, three, and four or more children. Between two levels the percentage moves in a straight line, and DHHS turns that into its yearly Guideline Calculation Table, effective April 1 each year, with a row for every ${usd(rowStep)} of combined adjusted gross income. The table goes one step further than the statute: it starts from gross income and deducts federal withholding and FICA itself, which is why its net figures can differ by a few cents from a hand calculation. Our calculator takes net income and applies the statutory interpolation directly.</p>
${h.table(['Annual combined net income', '1 child', '2 children', '3 children', '4 or more'], R.map((r) => [`${usd(r[0])}${r === first ? ' or less' : r === last ? ' or more' : ''}`, pct(r[1]), pct(r[2]), pct(r[3]), pct(r[4])]), 'RSA 458-C:3, I(a): percentage of combined net income', ['left', 'right', 'right', 'right', 'right'])}
<p>The slide is steep at the bottom for large families: with four or more children the rate starts at ${pct(first[4])}. At the top, parents with ${usd(12000)} and ${usd(4000)} a month of net income are well above the last level, so one child is computed at ${pct(last[1])}: the paying parent owes ${usd(rich.monthly)}.</p>
<h2>The reserve test, and what it does to a modest paycheck</h2>
<p>RSA 458-C:3, IV protects the payer in two ways. A payer whose income is below the self-support reserve owes the minimum order, ${usd(minOrder)} a month, unless voluntarily unemployed. A payer above it may not be pushed below it: the order becomes income minus the reserve, but never less than the minimum. With ${usd(tightA)} and ${usd(tightB)} a month and two children, the percentage share is ${usd(tightRaw)}; the reserve cuts it to ${usd(tight.monthly)}. The statute applies the test to the obligor's adjusted gross income; our calculator applies it to the income you enter.</p>
<h3>Equal schedules since January 2025</h3>
<p>There is no parenting-time formula. Since January 1, 2025, when parents split child care, uninsured medical costs and agreed activities 50/50, two presumptions apply: similar incomes (within 10 percent) and each parent above 40 percent of the time point to a ${usd(0)} order; similar incomes and each above 35 percent point to a deviation. The court decides, so the calculator shows the guideline amount. Medical support is separate, 4 percent of each parent's gross income. Compare a state that weighs time in its formula on the ${h.a('child-support:maine', 'Maine page')}.</p>`,
  faqs: [
    { q: 'What percentage of income is child support in New Hampshire?', a: `It depends on the parents' combined net income. RSA 458-C:3 sets ${pct(first[1])} for one child, ${pct(first[2])} for two, ${pct(first[3])} for three and ${pct(first[4])} for four or more at ${usd(first[0])} a year or less, falling to ${pct(last[1])}, ${pct(last[2])}, ${pct(last[3])} and ${pct(last[4])} at ${usd(last[0])} or more. Between the ${num(R.length)} levels the rate is interpolated, then the total is shared by income.` },
    { q: 'What is the New Hampshire self-support reserve for 2026?', a: `${usdx(ssr)} a month in the DHHS Guideline Calculation Table effective April 1, 2026, based on 130 percent of the federal poverty guideline for one person. A payer below it owes the ${usd(minOrder)} minimum order; a payer above it keeps at least the reserve. With ${usd(tightA)} and ${usd(tightB)} of income and two children, support drops from ${usd(tightRaw)} to ${usd(tight.monthly)}.` },
    { q: 'Does equal parenting time mean no child support in New Hampshire?', a: `Not automatically. Since January 1, 2025, a ${usd(0)} order is presumed only when the parents have substantially similar incomes, within 10 percent, each has more than 40 percent of the parenting time, and they split child care, uninsured medical costs and activities equally. If incomes differ, the guideline amount may still apply, and the court looks at whether each home can meet the children's costs.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:maine', 'child-support:new-jersey'],
});
