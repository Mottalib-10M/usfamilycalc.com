import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, usdx, num, day, listOf } from '../../../lib/kit';

const d = cs('south-carolina');
const S = d.schedule!;
const F = d.formula as { sharedMoreThanOvernights: number; graduatedBelowOvernights: number; graduatedDivisorFrom: number; daysPerYear: number };
const M = d.shared!.multiplier!;
const SHADE = (d as unknown as { extra: { ssrShadedMaxIncome: number[] } }).extra.ssrShadedMaxIncome;
const SSR = d.lowIncome!.selfSupportReserve!;
const MIN = d.lowIncome!.minimumOrder!;
const A = 5500, B = 2000;
const at = (n: number) => csCalc('south-carolina', A, B, 2, { payerOvernights: n }).monthly;
const base = csCalc('south-carolina', A, B, 2);
const first = F.sharedMoreThanOvernights + 1;
const nights = [F.sharedMoreThanOvernights, first, 115, 120, F.graduatedBelowOvernights - 1, F.graduatedBelowOvernights, 160, 182];
const ladder = nights.map(at);
const lowA = 1450, lowB = 200;
const low = csCalc('south-carolina', lowA, lowB, 2);
const lowShare = low.basicMonthly * (lowA / (lowA + lowB));
const step = S.rows[1][0] - S.rows[0][0];

export default defineStatePage({
  topic: 'child-support',
  slug: 'south-carolina',
  title: `South Carolina Child Support Calculator 2026: Gross Pay`,
  description: `South Carolina child support 2026: the DSS schedule to ${usd(S.maxIncome)} a month, shared custody above ${num(F.sharedMoreThanOvernights)} overnights, and ${usd(base.monthly)} for two children in our example.`,
  intro: 'The 2024 South Carolina Child Support Guidelines (Regs. 114-4710 to 114-4750): the DSS schedule, Worksheet C and the graduated band of overnights.',
  resume: `In South Carolina, a parent grossing ${usd(A)} a month whose co-parent grosses ${usd(B)} owes about ${usd(base.monthly)} a month for two children under the guidelines that took effect on ${day(d.effective!)}. The Department of Social Services schedule lists ${usd(base.basicMonthly)} for two children at a combined ${usd(A + B)} and covers incomes from ${usd(S.minIncome)} to ${usd(S.maxIncome)} a month, in ${usd(step)} steps; the paying parent's share follows his or her part of gross income. The state's shared-custody rule is unusual twice over. It starts only above ${num(F.sharedMoreThanOvernights)} overnights a year, about 30% of the nights, and then uses Worksheet C, which multiplies the schedule amount by ${M} before splitting it by income and by time. Between ${num(first)} and ${num(F.graduatedBelowOvernights - 1)} overnights the order glides from the sole-custody figure toward the shared one, so ${num(nights[3])} overnights give ${usd(ladder[3])}. A self-support reserve of ${usdx(SSR)} protects the lowest earners.`,
  body: (h) => `<h2>Where the 2024 schedule comes from</h2>
<p>Regulation 114-4750 does not print the table. It incorporates "the Schedule and worksheets" by reference and sends readers to the Department of Social Services, the Legislative Council or a clerk of court. The working copy is ${h.ext(d.guidelinesUrl, 'DSS Booklet 2819')}, the 2024 edition dated November 2024, whose rows match line for line the ${h.ext('https://dss.sc.gov/media/mtwi1a5m/proposed-schedule-of-basic-support-obligations-2022-sc-guidelines-002.pdf', 'updated schedule')} the Department posted for the 2022 review. Compared with the previous version the ceiling moved from $360,000 to ${usd(S.maxIncome * 12)} of combined yearly income, which is the ${usd(S.maxIncome)} a month the calculator stops at. Higher incomes are set case by case. Below ${usd(S.minIncome)} a month the guidelines also leave the court free, and expect at least ${usd(MIN)} in most cases.</p>
<p>When an income falls between two rows, Regulation 114-4720(A)(10) encourages the court to "extrapolate upwardly". The calculator reads that as a straight line between the two neighboring rows, so ${usd(A + B + 25)} lands halfway between two lines rather than on one of them.</p>
<h2>Worksheet C and the graduated band</h2>
<p>Shared physical custody in South Carolina means court-ordered overnights above ${num(F.sharedMoreThanOvernights)} for the parent without primary custody, plus real spending by both parents. Worksheet C then raises the basic obligation by half (×${M}), divides it by income, weights each parent's part by the time the children spend in the other home, and nets the two. The jump from Worksheet A to Worksheet C would be a cliff, so Regulation 114-4730(A)(3) spreads it: between ${num(first)} and ${num(F.graduatedBelowOvernights - 1)} overnights the order equals Worksheet A minus the gap between A and C times (overnights minus ${num(F.sharedMoreThanOvernights)}) divided by ${num(F.graduatedBelowOvernights - F.graduatedDivisorFrom)}.</p>
${h.table(['Overnights a year with the paying parent', 'Monthly support, two children'], nights.map((n, i) => [num(n), usdx(ladder[i])]), `South Carolina, ${usd(A)} and ${usd(B)} of gross income, no add-ons`, ['l', 'r'])}
<p>The adjustment is yearly. A month-long summer stay does not lower the support for that month, and a parent who does not use the ordered time can be sent back to the sole-custody amount on the other parent's petition.</p>
<h3>Shaded cells: the paying parent's income alone</h3>
<p>The schedule's shading marks where the reserve of ${usdx(SSR)} a month applies. It covers payers with up to ${listOf(SHADE.map((v, i) => `${usd(v)} for ${i + 1}`))} children. In that zone, the guidelines say support must be computed on the payer's income only, and child care or insurance must not be added, because either would push the payer under the reserve. A parent at ${usd(lowA)} with two children and a co-parent at ${usd(lowB)} would have a pro rata share of ${usd(lowShare)}; the shaded rule gives ${usd(low.monthly)}. When the other parent earns far more, the payer-alone figure can exceed the pro rata share; the regulation exists to protect the payer, so the calculator then keeps the lower share, a reading the court may not share. Child care for working parents is reduced first by a simulated tax credit, and the schedule already includes $250 per child per year of ordinary medical costs. ${h.aIf('child-support:north-carolina', 'North Carolina')} and ${h.aIf('child-support:georgia', 'Georgia')} treat shared time quite differently.</p>`,
  faqs: [
    { q: 'How many overnights count as shared custody in South Carolina?', a: `More than ${num(F.sharedMoreThanOvernights)} court-ordered overnights a year, roughly 30% of the nights, with both parents paying part of the children's expenses. From ${num(first)} to ${num(F.graduatedBelowOvernights - 1)} nights a graduated amount applies; from ${num(F.graduatedBelowOvernights)} the full Worksheet C result does. With ${usd(A)} and ${usd(B)} of gross income and two children, ${num(F.graduatedBelowOvernights)} overnights bring the order from ${usd(base.monthly)} to ${usd(ladder[5])} a month.` },
    { q: 'Is South Carolina child support based on gross income?', a: `Yes. The guidelines use each parent's gross income so that nobody argues over deductions, then subtract alimony paid in the case, support paid under earlier orders and a credit for other children living in the home. Taxes and FICA are already priced into the DSS schedule, which runs from ${usd(S.minIncome)} to ${usd(S.maxIncome)} of combined monthly gross income.` },
    { q: `What does South Carolina do above ${usd(S.maxIncome)} a month of combined income?`, a: `The guidelines stop at ${usd(S.maxIncome)} a month, or ${usd(S.maxIncome * 12)} a year, and leave higher incomes to a case-by-case decision by the family court. The judge looks at the children's actual needs and the family's standard of living. The calculator keeps the top row of the schedule as a reference point, so treat any figure above that ceiling as a floor for discussion, not a result.` },
    { q: 'Does South Carolina DSS review child support orders?', a: 'Yes, in its own caseload. Regulation 114-4740 has the Department review an order every three years when the family receives TANF assistance, or at a parent\'s request in a IV-D case, and adjust it to the guidelines when the amounts differ. Parents outside the DSS program file a request to modify with the family court.' },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:north-carolina', 'child-support:georgia', 'child-support:tennessee'],
});
