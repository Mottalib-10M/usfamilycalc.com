import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day, listOf } from '../../../lib/kit';

const SLUG = 'south-dakota';
const d = cs(SLUG);
const rows = d.schedule!.rows;
const first = rows[0];
const last = rows[rows.length - 1];
const SSR = d.lowIncome!.selfSupportReserve!;
const bold = (d as unknown as { extra: { emboldenedTo: number[] } }).extra.emboldenedTo;
const T = d.shared!.thresholdOvernights!;
const M = d.shared!.multiplier!;
const A = 4000, B = 2000;
const base = csCalc(SLUG, A, B, 2);
const justShort = csCalc(SLUG, A, B, 2, { payerOvernights: T - 1 });
const cross = csCalc(SLUG, A, B, 2, { payerOvernights: T });
const lowA = 1100, lowB = 3000;
const low = csCalc(SLUG, lowA, lowB, 1);
const lowShare = (low.basicMonthly * lowA) / (lowA + lowB);
const aloneRow = rows.find((r) => r[0] <= lowA && lowA <= r[1])!;
const outA = 1300;
const out = csCalc(SLUG, outA, lowB, 1);
const careA = 3500, careB = 3500, care = 600;
const withCare = csCalc(SLUG, careA, careB, 1, { childcare: care });
const noCare = csCalc(SLUG, careA, careB, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: SLUG,
  title: 'South Dakota Child Support 2026: Net Income Brackets',
  description: `South Dakota child support 2026 under SDCL 25-7-6.2: ${usd(A)} and ${usd(B)} of net income, two children, ${usd(base.monthly)} a month; a cross credit from ${num(T)} nights a home.`,
  intro: 'The SDCL 25-7-6.2 schedule in $50 brackets, the emboldened self-support area and the shared parenting cross credit, applied to your net incomes.',
  resume: `A South Dakota parent with ${usd(A)} of monthly net income, when the other parent has ${usd(B)}, pays ${usd(base.monthly)} a month for two children under the schedule of SDCL 25-7-6.2. The Legislature writes the whole table into the statute in ${usd(50)} brackets of combined net income, from a first bracket of ${usd(first[0])} to ${usd(first[1])} up to ${usd(last[1])}, last amended in 2022. Two features set the state apart. The low end of the table is printed in bold: those cells already hold a self-support reserve of ${usd(SSR)} a month, and a parent whose own income lands there pays the lesser of that amount and the income share. Shared parenting is not a sliding scale either: the cross credit of SDCL 25-7-6.27 needs a detailed plan giving each home at least ${num(T)} nights, and even then the court may refuse it. Below that, a discretionary abatement for nights can apply instead.`,
  body: (h) => `<h2>Bold cells in the statute</h2>
<p>The official text of SDCL 25-7-6.2 prints part of its table in bold, and the bold has legal weight. Those cells build in the ${usd(SSR)} reserve for a parent with little income. The test runs on the noncustodial parent's income alone: look up that income as if it were the combined figure; if the cell is bold, compare it with the normal proportionate share and order the lower one. The bold area is short, ending at ${listOf(bold.map((x, i) => `${usd(x)} for ${i + 1} ${i === 0 ? 'child' : 'children'}`))}.</p>
<p>Take a parent with ${usd(lowA)} next to a parent with ${usd(lowB)}, one child. The combined bracket gives a share of ${usd(lowShare)}. Read alone, ${usd(lowA)} falls in the ${usd(aloneRow[0])} to ${usd(aloneRow[1])} bracket, a bold ${usd(aloneRow[2])}, so the order is ${usd(low.monthly)}. Move the same parent to ${usd(outA)} and the single-income cell is no longer bold for one child: the order is the plain share, ${usd(out.monthly)}. The plain-text version of the statute drops the bold, so our script reads the official page's styling to know where the area ends.</p>
<h2>${num(T)} nights in each home, or nothing automatic</h2>
<p>SDCL 25-7-6.27 is narrow. The custody order must contain a detailed shared parenting plan, the child must sleep at least ${num(T)} nights a year in each home, and the parents must also share expenses in proportion to income. The schedule amount is then multiplied by ${num(M, 1)}, each parent's share is prorated by the nights the child spends with the other, and the two figures are offset. With our first family, ${num(T - 1)} nights leave the order at ${usd(justShort.monthly)}; ${num(T)} nights bring it to ${usd(cross.monthly)}. Because each home needs ${num(T)} nights, only a schedule close to an even split qualifies.</p>
<p>Below that line, SDCL 25-7-6.14 lets the court abate support for the nights the child stays with the obligor, once there are six or more a month. The rate is a range set case by case and the obligor must prove extra non-duplicated costs, so the calculator leaves it out. If the time is not exercised, the abated amount must be repaid.</p>
<h3>Child care, medical bills and the hardship line</h3>
<p>Work-related child care is allocated by income; with ${usd(careA)} on each side and ${usd(care)} a month of care, one child, the order grows from ${usd(noCare.monthly)} to ${usd(withCare.monthly)}. The court may count the federal child care credit at a quarter of the expense when the custodial parent can claim it. The custodial parent pays the first uninsured health costs of each year before the excess is split. A total order, health insurance and child care included, above half of the obligor's monthly net income is presumed to be a financial hardship, a ground to deviate (SDCL 25-7-6.10). Income tax enters net income at the single-taxpayer rate on a monthly payroll period, whatever the parent's real filing status. The schedule used here dates from ${day(d.effective!)}, an inferred start date for the 2022 act. Compare ${h.a('child-support:north-dakota', 'North Dakota')}, which looks at one income only.</p>`,
  faqs: [
    { q: 'What does the bold area of the South Dakota child support schedule mean?', a: `It marks the cells that include a self-support reserve of ${usd(SSR)} a month for a parent with a limited ability to pay. If the amount read on the noncustodial parent's net income alone falls in a bold cell, SDCL 25-7-6.2 orders the lesser of that amount and the normal income share. With ${usd(lowA)} against ${usd(lowB)} and one child, that gives ${usd(low.monthly)} instead of ${usd(lowShare)}.` },
    { q: 'How many nights do you need for the South Dakota shared parenting cross credit?', a: `At least ${num(T)} nights a year in each parent's home, under a detailed shared parenting plan in the custody order (SDCL 25-7-6.27). The court may still refuse the credit if it would substantially hurt the child's standard of living. With ${usd(A)} and ${usd(B)} of net income and two children, the credit takes the order from ${usd(base.monthly)} to ${usd(cross.monthly)} a month.` },
    { q: 'What happens above the top of the South Dakota child support table?', a: `The schedule stops at ${usd(last[1])} of combined monthly net income, where two children cost ${usd(last[3])}. Above it, SDCL 25-7-6.9 tells the court to set support at an appropriate level using the child's actual needs and standard of living, with no percentage to extend the table. The calculator shows the top bracket and flags the case as discretionary.` },
    { q: 'Is the South Dakota child support schedule based on gross or net income?', a: `Net. Each parent's monthly net income is gross income minus income tax figured at the single-taxpayer rate for a monthly payroll period, Social Security and Medicare, qualified retirement contributions within a limit, unreimbursed business expenses and other support orders paid (SDCL 25-7-6.7). The two net incomes are added to find the bracket, then the amount is split in proportion to them.` },
  ],
  related: ['child-support', 'child-support:north-dakota', 'child-support:nebraska', 'child-support:iowa', 'workers-comp:south-dakota'],
});
