import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, num, day } from '../../../lib/kit';

const d = cs('north-carolina');
const S = d.schedule!;
const SH = d.shared!;
const X = (d as unknown as { extra: { shadedThroughIncome: number[]; minimumOrder: { amount: number; belowObligorIncome: number } } }).extra;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
const A = 5000, B = 3000;
const wa = csCalc('north-carolina', A, B, 2);
const below = csCalc('north-carolina', A, B, 2, { payerOvernights: T - 1 });
const wb = csCalc('north-carolina', A, B, 2, { payerOvernights: T });
const lowA = 2000, lowB = 2700;
const shaded = csCalc('north-carolina', lowA, lowB, 2);
const unshaded = (shaded.basicMonthly * lowA) / (lowA + lowB);
const primaryNights = 365 - T + 1;

export default defineStatePage({
  topic: 'child-support',
  slug: 'north-carolina',
  title: `North Carolina Child Support 2026: Worksheets A and B`,
  description: `North Carolina child support 2026: Worksheet A or B, the ${num(T)}-night line, the shaded low-income cells and a ${usd(wa.monthly)} worked example for two young children.`,
  intro: 'The AOC schedule of basic support obligations, read the way Worksheets A and B read it.',
  resume: `A North Carolina parent earning ${usd(A)} a month of adjusted gross income, when the other parent earns ${usd(B)} and keeps the two children most nights, owes about ${usd(wa.monthly)} a month on Worksheet A before child care and insurance. Everything turns on overnights: at ${num(T - 1)} nights a year with the paying parent the figure is unchanged, at ${num(T)} nights the case moves to Worksheet B, the combined obligation is multiplied by ${num(M, 1)}, each share is weighted by the other parent's nights, and the payment falls to ${usd(wb.monthly)}. The schedule comes from the Conference of Chief District Judges and has applied to actions heard since ${day(d.effective!)}; it is interpolated between rows ${usd(S.rows[1][0] - S.rows[0][0])} apart and stops at ${usd(S.maxIncome)} of combined income. At the bottom, two protections apply on Worksheet A only: a ${usd(X.minimumOrder.amount)} minimum order for an obligor under ${usd(X.minimumOrder.belowObligorIncome)}, and the shaded area, where support is computed on the obligor's income alone.`,
  body: (h) => `<h2>Which worksheet, and why one night matters</h2>
<p>North Carolina does not slide support down as visits increase. It sorts each case into a worksheet. Worksheet A is primary custody: one household has the children ${num(primaryNights)} nights or more. Worksheet B is shared custody: each parent has at least ${num(T)} nights and pays the children's expenses while they are there. Worksheet C handles split custody, where each parent keeps at least one child. Because the switch is binary, the ${num(T)}th night is worth real money. In our example family the order is ${usd(below.monthly)} at ${num(T - 1)} nights and ${usd(wb.monthly)} at ${num(T)}, a gap of ${usd(below.monthly - wb.monthly)} a month for a single extra overnight across a year.</p>
<p>The ${num(M, 1)} multiplier exists because two homes cost more than one: each parent keeps a bedroom, clothes and food for the children. Worksheet B therefore inflates the basic obligation by half, splits it by income, then charges each parent for the share of the year the children spend in the other home. The parent with the larger figure pays the difference. Courts look at actual practice as well as the order, so a parent claiming Worksheet B should be ready to show the nights were really exercised.</p>
<h2>The shaded cells of the schedule</h2>
<p>Open the AOC schedule and the top-left corner is grey. Those shaded cells build in a self-support reserve, set from the federal poverty level for one person (${usd(d.lowIncome!.selfSupportReserve!)} a month in the current version), so that a low-earning obligor keeps enough to live on. The grey zone reaches higher incomes as the number of children grows:</p>
${h.table(['Children', 'Shaded through (obligor income)'], X.shadedThroughIncome.map((v, i) => [num(i + 1), usd(v)]), 'Last shaded row of each column, NC schedule effective ' + day(d.effective!), ['l', 'r'])}
<p>When the paying parent's own income lands in a shaded cell and Worksheet A applies, the obligation is read on that income alone, and child care and health premiums are left out (either can still justify a deviation). Take an obligor at ${usd(lowA)} and a custodial parent at ${usd(lowB)} with two children: the ordinary combined method would give ${usd(unshaded)}, while the shaded cell for ${usd(lowA)} gives ${usd(shaded.monthly)}. The shading is not printed in the PDF's text, so we read it from the version of the same schedule that NC Child Support Services publishes on its site; the calculator applies it automatically.</p>
<h3>Below the shading</h3>
<p>Under ${usd(X.minimumOrder.belowObligorIncome)} of adjusted gross income, the guidelines call for a ${usd(X.minimumOrder.amount)} minimum order, absent deviation. The shaded area and the minimum order do not apply on Worksheets B or C. Neighboring ${h.a('child-support:virginia', 'Virginia')} handles the same problem with a statutory minimum instead of grey cells, and ${h.a('child-support:georgia', 'Georgia')} with a separate low-income table.</p>
<p>Above ${usd(S.maxIncome)} a month of combined income the schedule no longer decides: the judge sets support from the child's reasonable needs and the parents' estates and standard of living, using the table only as a floor.</p>`,
  faqs: [
    { q: 'How many overnights make shared custody in North Carolina?', a: `At least ${num(T)} nights a year with each parent, with each parent paying the child's expenses during that time. Below that line the case uses Worksheet A and the noncustodial parent pays a straight income share of the schedule. From ${num(T)} nights, Worksheet B multiplies the obligation by ${num(M, 1)} and offsets each parent's time, which usually lowers the payment by a large step.` },
    { q: 'What is the shaded area of the North Carolina child support schedule?', a: `It is the low-income zone of the AOC schedule where a self-support reserve is built in. If the obligor's own adjusted gross income falls in a shaded cell and Worksheet A applies, support is computed on the obligor's income alone and child care and insurance premiums are not added. The shading ends at ${usd(X.shadedThroughIncome[0])} for one child and ${usd(X.shadedThroughIncome[5])} for six.` },
    { q: 'Is there a minimum child support order in North Carolina?', a: `Yes. When the obligor's adjusted gross income is below ${usd(X.minimumOrder.belowObligorIncome)} a month, the guidelines require a minimum order of ${usd(X.minimumOrder.amount)} unless the judge deviates. The rule keeps an order in place, so it can be raised later if income improves, without taking money the parent needs to live. It applies to Worksheet A cases.` },
    { q: 'When will North Carolina update its child support guidelines?', a: `The current guidelines apply to actions heard on or after ${day(d.effective!)}. The Conference of Chief District Judges must review them at least every four years, and the 2026 review is under way. Until a revised version is adopted and takes effect, courts keep using the present schedule and worksheets, which is what this calculator applies.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:virginia', 'child-support:georgia'],
});
