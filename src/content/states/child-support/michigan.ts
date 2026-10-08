import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, pct, num, listOf } from '../../../lib/kit';

type Band = { incomeAmount: number; basePercentage: number; baseSupport: number; marginalPercentage: number };
const d = cs('michigan');
const F = d.formula as { lowIncomeThreshold: number; lowIncomePct: number; transitionPctByChildren: number[]; offsetExponent: number; generalCareTables: Record<string, Band[]> };
const two = F.generalCareTables['2'];
const H = F.lowIncomeThreshold;
const A = 5000, B = 3000;
const C = A + B;
const band = [...two].reverse().find((b) => b.incomeAmount <= C)!;
const r0 = csCalc('michigan', A, B, 2);
const pts = [0, 52, 100, 146, 182];
const offs = pts.map((n) => csCalc('michigan', A, B, 2, { payerOvernights: n }).monthly);
const tA = 1600, tB = 3000;
const trans = csCalc('michigan', tA, tB, 2);
const tGen = (() => { const b2 = [...two].reverse().find((b) => b.incomeAmount <= tA + tB)!; return Math.round((b2.baseSupport + (b2.marginalPercentage / 100) * (tA + tB - b2.incomeAmount)) * (Math.round((tA / (tA + tB)) * 10000) / 10000)); })();
const shareA = Math.round((A / C) * 10000) / 100;

export default defineStatePage({
  topic: 'child-support',
  slug: 'michigan',
  title: `Michigan Child Support Formula 2026: MCSF Bands, Offset`,
  description: `Michigan child support 2026 under the MCSF: net income bands, a ${usdx(H)} low-income threshold and the overnight offset. Example: ${usd(r0.monthly)} a month for two kids.`,
  intro: 'The Michigan Child Support Formula of the State Court Administrative Office, worked through with real numbers.',
  resume: `Michigan has no lookup table: the Michigan Child Support Formula computes base support from the parents' combined net income with a band equation, and a parent with ${usd(A)} of monthly net income facing ${usd(B)} owes ${usd(r0.monthly)} a month for two children when the children sleep at the other home every night. The equation takes a base amount and a marginal percentage from the band that holds the family's income, multiplies by the parent's share rounded to a hundredth of a percent, and rounds to the dollar. Overnights then enter through the parental time offset, which raises each parent's yearly overnights to the power ${num(F.offsetExponent, 1)}: ${num(pts[2])} nights bring the same order to ${usd(offs[2])}, ${num(pts[3])} nights to ${usd(offs[3])}. Parents at or below the ${usdx(H)} Low Income Threshold pay ${pct(F.lowIncomePct)} of net income, and those just above it are protected by a transition equation. The 2025 manual and supplement remain the current guideline in 2026.`,
  body: (h) => `<h2>${num(two.length)} bands instead of a schedule</h2>
<p>The State Court Administrative Office publishes, for each number of children, a General Care Support Table of only ${num(two.length)} lines. Each line gives an income amount, a base support figure and a marginal percentage. Find the last line whose income amount does not exceed the family's net income, add the marginal percentage of the excess to the base support, and you have the family's general care figure. For two children the lines start at ${usdx(two[0].incomeAmount)} and end at ${usdx(two[two.length - 1].incomeAmount)}; above that last line the same equation simply continues, though the court may use discretion when income greatly exceeds it.</p>
<p>Our family has ${usd(C)} of combined net income, so the line at ${usdx(band.incomeAmount)} applies: ${usdx(band.baseSupport)} plus ${pct(band.marginalPercentage)} of the amount above ${usdx(band.incomeAmount)}, or ${usd(r0.basicMonthly)} in all. The parent earning ${usd(A)} carries ${pct(shareA)} of it, which rounds to ${usd(r0.monthly)}. Nothing else in the formula uses a table lookup.</p>
<h2>The offset curve</h2>
<p>Michigan computes base support for both parents, then nets them against time. The offset is (Ao<sup>${num(F.offsetExponent, 1)}</sup> × Bs − Bo<sup>${num(F.offsetExponent, 1)}</sup> × As) ÷ (Ao<sup>${num(F.offsetExponent, 1)}</sup> + Bo<sup>${num(F.offsetExponent, 1)}</sup>), where Ao and Bo are overnights and As and Bs each parent's base support. A negative result means parent A pays. There is no minimum number of nights before it applies:</p>
${h.table(['Overnights with the paying parent', 'Monthly base support'], pts.map((n, i) => [num(n), usd(offs[i])]), `Michigan, ${usd(A)} and ${usd(B)} net, two children`, ['l', 'r'])}
<p>The power makes early nights cheap and late nights expensive. A weekly overnight barely moves the order, while the stretch toward equal time cuts it fast. Because every order must state the number of overnights it used, a gap of 21 or more between that number and actual practice is a ground to ask the friend of the court for a review.</p>
<h2>The threshold and the transition</h2>
<p>A parent whose net income is at or below ${usdx(H)} (the 2024 federal poverty guideline the supplement adopted) pays ${pct(F.lowIncomePct)} of that income, and that income is dropped from the family total used for the other parent. Just above the threshold, a second equation competes with the band formula: ${pct(F.lowIncomePct)} of the threshold plus a percentage of the income above it (${listOf(F.transitionPctByChildren.map((p, i) => `${pct(p)} for ${i + 1}`))} or more children). The parent pays whichever is lower. A parent at ${usd(tA)} next to one at ${usd(tB)} would owe ${usd(tGen)} under the band equation, but the transition caps base support at ${usd(trans.monthly)}.</p>
<p>Child care and health premiums are then divided by each parent's share of income, and the formula adds an ordinary medical amount per child that this estimate leaves to the order. The ${h.a('child-support', 'state-by-state calculator')} lets you compare Michigan's curve with table states.</p>`,
  faqs: [
    { q: 'Does Michigan use a child support table or a formula?', a: `A formula. The Michigan Child Support Formula takes the family's combined net income, finds its band in a ${num(two.length)}-line General Care Support Table, adds a marginal percentage of the income above the band's starting point and multiplies by each parent's share. The result is rounded to the dollar, then adjusted for overnights. With ${usd(A)} and ${usd(B)} of net income and two children, the payer's base support is ${usd(r0.monthly)}.` },
    { q: 'How do overnights reduce child support in Michigan?', a: `Through the parental time offset, which applies to any number of overnights. Each parent's yearly overnights are raised to the power ${num(F.offsetExponent, 1)} and used to weight the other parent's base support. The effect is small for occasional nights and large near equal time: in our example ${num(pts[1])} nights save ${usd(offs[0] - offs[1])} a month, while ${num(pts[4])} nights save ${usd(offs[0] - offs[4])}.` },
    { q: 'What is the Michigan low income threshold for child support?', a: `${usdx(H)} of monthly net income in the current supplement, equal to the 2024 federal poverty guideline for one person. A parent at or below it owes ${pct(F.lowIncomePct)} of net income as base support. A parent above it pays the lower of the general care equation and the low income transition equation, which phases support in as income rises above the threshold.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-jersey'],
});
