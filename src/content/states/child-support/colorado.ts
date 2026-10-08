import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day, listOf } from '../../../lib/kit';

const d = cs('colorado');
const S = d.schedule!;
const PT = new Map((d as unknown as { extra: { parentingTimeTable: { rows: number[][] } } }).extra.parentingTimeTable.rows.map(([k, v]) => [k, v]));
const L = d.formula as unknown as { minimumOrderIncomeMax: number; minimumOrder: number; reducedLowIncomeOrders: number[]; reducedOrderCapPctOfAGI: number; aboveSsrPctOfDifference: number[]; minimumWageBandCapPctOfAGI: number; ssrHoursPerWeek: number; ssrWeeksPerYear: number };
const A = 5000, B = 3000;
const at = (n: number) => csCalc('colorado', A, B, 2, { payerOvernights: n });
const zero = at(0);
const oldLine = Number(d.sharedText.match(/(\d+)-overnight threshold/)?.[1] ?? 0);
const justBelow = at(oldLine - 1), atLine = at(oldLine);
const fewNights = 36;
const few = at(fewNights);
const half = at(182);
const low = csCalc('colorado', L.minimumOrderIncomeMax - 10, 4000, 1);
const big = csCalc('colorado', 50000, 10000, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'colorado',
  title: `Colorado Child Support 2026: A Credit for Every Overnight`,
  description: `Colorado child support 2026 after HB 25-1159: a schedule to ${usd(S.maxIncome)}, parenting credit from the first night, and ${usd(zero.monthly)} for two kids at ${usd(A)} vs ${usd(B)}.`,
  intro: `Colorado rewrote its child support schedule and its parenting time rule; the new version applies from ${day(d.effective!)}.`,
  resume: `Since ${day(d.effective!)}, Colorado credits a paying parent for every overnight with the children, not only past a threshold. A parent earning ${usd(A)} a month in adjusted gross income, with a co-parent at ${usd(B)} and two children, owes ${usd(zero.monthly)} a month with no overnights, ${usd(few.monthly)} with ${num(fewNights)} overnights, ${usd(atLine.monthly)} at ${num(oldLine)}, and ${usd(half.monthly)} at 182. Before HB 25-1159, the first ${num(oldLine - 1)} overnights changed nothing and overnight number ${num(oldLine)} switched the case to a separate shared-care formula; that cliff is gone. The new schedule, enacted by the same act, runs from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined monthly income and is interpolated between its rows. A paying parent with ${usd(L.minimumOrderIncomeMax)} a month or less owes a minimum order of ${usd(L.minimumOrder)}. The self-support reserve is now tied to the state minimum wage, a figure this calculator does not yet hold for 2026.`,
  body: (h) => `<h2>From a cliff to a curve</h2>
<p>Under the version of C.R.S. § 14-10-115 in force until the end of February 2026, a parent with ${num(oldLine - 1)} overnights a year was treated like a parent with none. HB 25-1159, signed in May 2025, replaced that with the parenting time table of subsection (8)(h): one percentage for each possible count of overnights, from 0 to 365, plus ${pct(PT.get(182.5) ?? 0)} for an exact half year. The percentages rise slowly at first (${pct(PT.get(fewNights) ?? 0)} at ${num(fewNights)} nights, ${pct(PT.get(oldLine) ?? 0)} at ${num(oldLine)}) and quickly near equal time.</p>
<p>For the family above, ${num(oldLine - 1)} and ${num(oldLine)} overnights now give almost the same order, ${usd(justBelow.monthly)} and ${usd(atLine.monthly)}. One more weekend no longer moves hundreds of dollars, which answers the cliff effect that the Child Support Commission's 2023 review described as a source of conflict between parents.</p>
<h2>How the credit is applied here</h2>
<p>Each parent's credit is the basic obligation multiplied by that parent's percentage, and it is subtracted from that parent's income share. The parent left with the larger amount pays the difference, and the result can never exceed what the same parent would owe with no overnights. Our calculator treats a share that the credit pushes below zero as zero before netting. The statute's text supports that reading, but Colorado's court worksheet was not available to us, so treat the shared figures as an estimate to check against the official worksheet.</p>
${h.table(['Overnights with the paying parent', 'Credit', 'Monthly support'], [0, fewNights, oldLine, 120, 146, 182].map((n) => [num(n), pct(PT.get(n) ?? 0), usd(at(n).monthly)]), `Colorado parenting time credit, ${usd(A)} and ${usd(B)} of adjusted gross income, two children`, ['left', 'right', 'right'])}
<h3>Low incomes: one rule applied, three waiting for a figure</h3>
<p>The minimum order is applied: with ${usd(L.minimumOrderIncomeMax - 10)} of monthly income, a parent owes ${usd(low.monthly)} whatever the other parent earns. The other low-income rules hang on the new self-support reserve, defined as the state minimum wage times ${num(L.ssrHoursPerWeek)} hours a week times ${num(L.ssrWeeksPerYear)} weeks, divided by twelve. Between ${usd(L.minimumOrderIncomeMax)} and that reserve, the basic obligation drops to ${listOf(L.reducedLowIncomeOrders.map((x, i) => `${usd(x)} for ${i + 1}`))} children, with all add-ons capped at ${pct(L.reducedOrderCapPctOfAGI)} of income. Just above the reserve, support is ${listOf(L.aboveSsrPctOfDifference.map((x) => pct(x)))} of the income left over, by number of children, and a ${pct(L.minimumWageBandCapPctOfAGI)} cap applies up to full-time minimum wage earnings. The calculator does not apply these three until an official 2026 minimum wage figure is in its data, so for a parent earning near minimum wage the court's figure will usually be lower than the one shown.</p>
<p>At the other end, families above ${usd(S.maxIncome)} start from the top row: ${usd(big.basicMonthly)} for one child at ${usd(60000)} of combined income, and the judge may set more. Colorado's spousal maintenance has its own formula, explained on the ${h.a('alimony:colorado', 'Colorado alimony page')}; ${h.a('child-support:new-mexico', 'New Mexico')} still uses a fixed shared-custody line.</p>`,
  faqs: [
    { q: 'How many overnights does Colorado need before parenting time lowers child support?', a: `One. Since ${day(d.effective!)}, Colorado's parenting time table gives a credit from the first overnight: ${pct(PT.get(1) ?? 0)} of the basic obligation for one night, ${pct(PT.get(fewNights) ?? 0)} for ${num(fewNights)}, ${pct(PT.get(oldLine) ?? 0)} for ${num(oldLine)}. With ${usd(A)} and ${usd(B)} of income and two children, ${num(fewNights)} overnights take the order from ${usd(zero.monthly)} to ${usd(few.monthly)} a month.` },
    { q: `What changed in Colorado child support on ${day(d.effective!)}?`, a: `HB 25-1159 brought in a new schedule reaching ${usd(S.maxIncome)} of combined monthly income, replaced the old shared-care formula and its overnight threshold with a credit for every overnight, and tied the self-support reserve to the state minimum wage. It also cut the cap on low-income orders with add-ons from twenty to ${pct(L.reducedOrderCapPctOfAGI)} of the paying parent's income.` },
    { q: 'What is the minimum child support order in Colorado?', a: `${usd(L.minimumOrder)} a month when the paying parent's adjusted gross income is ${usd(L.minimumOrderIncomeMax)} a month or less, whatever the number of children and whatever the other parent earns. If shared parenting time already brings the presumptive amount below ${usd(L.minimumOrder)}, the lower amount applies. Above that income, reduced orders tied to the self-support reserve take over.` },
    { q: 'Until what age is child support paid in Colorado?', a: `Normally until the last or only child turns 19, which is later than in most states. Support continues past 19 for a disabled child, by written agreement of the parents, or while the child is still in high school, up to the end of the month after graduation but not beyond 21. Marriage or active military duty ends it earlier.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:new-mexico', 'child-support:nebraska', 'alimony:colorado'],
});
