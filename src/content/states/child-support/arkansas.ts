import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day, listOf } from '../../../lib/kit';

const d = cs('arkansas');
const rows = d.schedule!.rows;
const top = rows[rows.length - 1];
const F = d.formula as { selfSupportReserve: number; minimumOrder: number; shadedMaxByChildren: number[] };
const A = 4000, B = 2000;
const base = csCalc('arkansas', A, B, 2);
const sA = 2000, sB = 1000, care = 200, prem = 100;
const sample = csCalc('arkansas', sA, sB, 1, { childcare: care, health: prem, healthBy: 'payer' });
const sampleBasic = csCalc('arkansas', sA, sB, 1);
const loA = 800, loB = 300;
const lo = csCalc('arkansas', loA, loB, 1);
const loRow = rows.find((r) => r[0] === F.shadedMaxByChildren[0] + 50)!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'arkansas',
  title: 'Arkansas Child Support Calculator 2026: Family Support Chart',
  description: `Arkansas child support 2026 on the income shares chart: ${usd(A)} and ${usd(B)} of gross monthly income and two children lead to about ${usd(base.monthly)} a month for the payor.`,
  intro: 'The Arkansas Family Support Chart required since July 2020, with its built-in reserve, minimum order and shaded low-income cells.',
  resume: `Arkansas has used an income shares chart since ${day(d.effective!)}, when the Supreme Court's Administrative Order No. 10 left behind the old charts read on the payor's net income. Both parents' gross monthly incomes are added, the chart gives one basic obligation, and the paying parent owes their percentage of it: with ${usd(A)} and ${usd(B)} and two children, the chart shows ${usd(base.basicMonthly)} and the payor's share is about ${usd(base.monthly)} a month. The chart runs in ${usd(50)} steps from ${usd(rows[0][0])} to ${usd(top[0])} of combined income and covers up to ${num(d.maxChildren)} children. Its heading states the two protections built into every low line: a self-support reserve of ${usd(F.selfSupportReserve)} a month and a minimum order of ${usd(F.minimumOrder)}. Health insurance, extraordinary medical costs and child care are added and shared by the same percentages, and the parent who pays them out of pocket receives a credit.`,
  body: (h) => `<h2>The official example, line by line</h2>
<p>The Administrative Office of the Courts published a sample calculation with the 2020 forms, and it is the best guide to how the chart is meant to be used. A payor earns ${usd(sA)}, the payee ${usd(sB)}, one child. The chart line for ${usd(sA + sB)} reads ${usd(sampleBasic.basicMonthly)}; two thirds of it is ${usdx(Math.round(sampleBasic.monthly * 100) / 100)}. The payor pays a ${usd(prem)} premium and the payee ${usd(care)} of child care, so ${usd(prem + care)} of expenses are shared two thirds and one third, and the payor is credited for the premium already paid. The calculator reaches ${usdx(Math.round(sample.monthly * 100) / 100)}; the sample then rounds down to the whole dollar, and the order is written at ${usd(Math.floor(sample.monthly))}.</p>
<h2>The blue cells</h2>
<p>The lowest part of the chart is shaded blue, and a footnote says that combined gross income does not apply there. The shading covers combined incomes up to ${listOf(F.shadedMaxByChildren.map((v, i) => `${usd(v)} for ${i + 1}`))} children. We read the footnote to mean that a shaded amount is owed as printed rather than split by income: with ${usd(loA)} and ${usd(loB)} and one child, the combined ${usd(loA + loB)} lands in a blue cell and the payor owes ${usd(lo.monthly)}. One step above the shading, at ${usd(loRow[0])}, the one-child amount is ${usd(loRow[1])} and income shares resume. Every blue line already assumes the payor keeps ${usd(F.selfSupportReserve)} to live on, which is why the amounts climb so fast in that band.</p>
<h2>What this page does not compute</h2>
<p>Arkansas courts and the Office of Child Support Enforcement work from the full text of Administrative Order No. 10. We could not retrieve that text from an official server while preparing this page, so three rules are left out on purpose rather than guessed: any reduction for shared or extended parenting time, the method above ${usd(top[0])} of combined income (the calculator stops at the top line, ${usd(top[2])} for two children), and the age at which support ends. If you share time with the children or earn above the chart, the order can differ from this estimate. The ${h.ext('https://www.arcourts.gov/forms-and-publications/arkansas-child-support-guidelines', 'Arkansas Judiciary guidelines page')} lists the chart, the worksheet and the official calculator. Neighbors with a time formula include ${h.a('child-support:oklahoma', 'Oklahoma')} and ${h.a('child-support:mississippi', 'Mississippi')}, which still uses percentages.</p>`,
  faqs: [
    { q: 'When did Arkansas switch to income shares child support?', a: `The Family Support Chart based on both parents' combined gross income has been required since ${day(d.effective!)}. Before that, Arkansas charts were read on the payor's net income alone, with weekly, biweekly, semimonthly and monthly versions. The new chart is monthly only and runs from ${usd(rows[0][0])} to ${usd(top[0])} of combined income for one to ${num(d.maxChildren)} children.` },
    { q: 'What is the minimum child support in Arkansas?', a: `The chart is built with a minimum order of ${usd(F.minimumOrder)} a month: its first line, which covers every combined income up to ${usd(rows[0][0])}, shows ${usd(rows[0][1])} whatever the number of children. It also builds in a self-support reserve of ${usd(F.selfSupportReserve)} a month for the payor, which shapes the blue-shaded low-income lines.` },
    { q: 'How are health insurance and child care handled in Arkansas child support?', a: `They are added to the basic chart amount and divided by the parents' income percentages. In the official sample, ${usd(prem)} of premium paid by the payor and ${usd(care)} of child care paid by the payee are shared two thirds and one third, and the payor then subtracts the ${usd(prem)} already paid, giving ${usd(Math.floor(sample.monthly))} a month after rounding down.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:oklahoma', 'child-support:mississippi', 'child-support:texas'],
});
