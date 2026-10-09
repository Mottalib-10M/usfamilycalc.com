import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('montana');
const F = d.formula as {
  personalAllowanceAnnual: number; primaryAllowanceAnnual: Record<string, number>; solaFactor: Record<string, number>;
  minimumPct: number; standardParentingDays: number; creditFactorPerDay: number; tablesEffective: string;
  minimumSupport: { incomeRatioTable: Array<[number, number]> };
};
const PA = F.personalAllowanceAnnual;
const prim1 = F.primaryAllowanceAnnual['1'], prim2 = F.primaryAllowanceAnnual['2'];
const sola1 = F.solaFactor['1'] * 100, sola2 = F.solaFactor['2'] * 100, sola8 = F.solaFactor['8'] * 100;
const A = 4000, B = 2000;
const one = csCalc('montana', A, B, 1);
const two = csCalc('montana', A, B, 2);
const days = 146;
const split = csCalc('montana', A, B, 1, { payerOvernights: days });
const low = 1500;
const lowRes = csCalc('montana', low, 3500, 1);
const lowRatio = (low * 12) / PA;
const lowMult = F.minimumSupport.incomeRatioTable.find(([upTo]) => lowRatio <= upTo)![1] * 100;
const minPct = F.minimumPct * 100;

export default defineStatePage({
  topic: 'child-support',
  slug: 'montana',
  title: `Montana Child Support 2026: Personal Allowance and SOLA`,
  description: `Montana child support 2026: each parent keeps a ${usd(PA)} personal allowance, then shares ${usd(prim1)} for one child plus SOLA; ${usd(one.monthly)} a month in our worked example.`,
  intro: 'The Montana guidelines worksheet run on an annual figure, from the personal allowance to the 110-day parenting rule.',
  resume: `With ${usd(A)} a month of income after deductions, against ${usd(B)} for the other parent and one child living with that parent, the Montana guidelines give about ${usd(one.monthly)} a month for 2026. Montana does not publish a support chart. The Child Support Services Division (CSSD) works on yearly amounts in a Melson-type sequence set by ARM 37.62. Each parent first keeps a personal allowance of ${usd(PA)} a year, equal to 1.3 times the federal poverty guideline for one person. What is left is the income available for support, and its split between the parents fixes who carries what share of the primary allowance: ${usd(prim1)} a year for one child, ${usd(prim2)} for two, plus child care and the children's premium. Above that, a standard of living adjustment of ${pct(sola1)} for one child, rising to ${pct(sola8)} for eight or more, is applied to whatever income still remains. The CSSD tables behind these figures took effect on ${day(F.tablesEffective)}.`,
  body: (h) => `<h2>Why the Montana worksheet starts from a yearly figure</h2>
<p>ARM 37.62.101 sets the guideline on an annual basis and turns the result into twelve equal payments only at the end. So the inputs are yearly: a parent with ${usd(A)} a month after taxes and other allowed deductions enters ${usd(A * 12)} on line 3 of Worksheet A, and the other parent ${usd(B * 12)}. The deductions themselves are broad: federal and state income tax, FICA and Medicare, mandatory retirement, ordered alimony and support for other children all come off before anything else. The calculator above expects that after-deduction figure, not gross pay.</p>
<p>The personal allowance of ${usd(PA)} then comes off each income. In our example the higher earner keeps ${usd(A * 12 - PA)} of income available and the other parent ${usd(Math.max(0, B * 12 - PA))}, which puts ${pct(one.payerShare * 100)} of the child's primary allowance and supplements on the higher earner. CSSD reprices the allowance every year from the poverty guideline, which is why a Montana order computed in 2025 does not match one computed today on the same pay.</p>
<h2>The 12 percent floor and the minimum contribution</h2>
<p>Line 6 of Worksheet A sets a floor for every parent: ${pct(minPct)} of income after deductions when some income is available, or, for a parent at or below the personal allowance, a slice taken from the income-ratio table of ARM 37.62.126. A parent with ${usd(low)} a month after deductions has a ratio of ${num(Math.round(lowRatio * 100) / 100)} to the allowance, which calls for a multiplier of ${pct(lowMult)}: ${usd(lowRes.monthly)} a month. Below a ratio of ${num(F.minimumSupport.incomeRatioTable[0][0])} the minimum is zero.</p>
<h3>Parenting days and the ${num(F.standardParentingDays)}-day line</h3>
<p>Montana counts days, not overnights: a day is the larger part of a 24-hour calendar period. Up to ${num(F.standardParentingDays)} days a year with the other parent, nothing changes. Once a child spends more than ${num(F.standardParentingDays)} days in each home, Worksheet B reduces each parent's obligation by ${num(F.creditFactorPerDay)} for every day above ${num(F.standardParentingDays)} and offsets the two results. With ${num(days)} days for the higher earner, the payment in our example drops from ${usd(one.monthly)} to ${usd(split.monthly)} a month. Two children with the same incomes cost ${usd(two.monthly)}, since the SOLA factor climbs to ${pct(sola2)}.</p>
<p>The worksheets and the yearly tables are published by ${h.ext('https://dphhs.mt.gov/CSSD/services/Guidelines', 'the DPHHS Child Support Services Division')}. For another Melson-type state with a different structure, compare ${h.a('child-support:hawaii', 'Hawaii')}.</p>`,
  faqs: [
    { q: 'What is the personal allowance in Montana child support for 2026?', a: `${usd(PA)} a year for each parent, under CSSD policy 404.2 effective ${day(F.tablesEffective)}. ARM 37.62.114 defines it as 1.3 times the federal poverty guideline for a one-person household, so it moves every year. It is subtracted from income after deductions before the parents' shares are computed; it contributes to a parent's subsistence but is not meant to cover all of it.` },
    { q: 'Does Montana child support change if my child stays with me more than 110 days?', a: `Yes, once the child spends more than ${num(F.standardParentingDays)} days a year in each home. Worksheet B then cuts each parent's obligation by ${num(F.creditFactorPerDay)} per day above ${num(F.standardParentingDays)} and nets the two. In our example with ${usd(A)} and ${usd(B)} a month after deductions, ${num(days)} days lower the payment from ${usd(one.monthly)} to ${usd(split.monthly)} a month for one child.` },
    { q: 'What is the minimum child support a Montana parent can be ordered to pay?', a: `It depends on income. Above the personal allowance the floor is ${pct(minPct)} of income after deductions. At or below it, ARM 37.62.126 applies a multiplier from ${pct(0)} to ${pct(F.minimumSupport.incomeRatioTable[F.minimumSupport.incomeRatioTable.length - 1][1] * 100)} according to the ratio of income to the allowance. A parent with ${usd(low)} a month after deductions would pay ${usd(lowRes.monthly)} a month. The court can depart from it with a written finding.` },
    { q: 'How is SOLA calculated in Montana?', a: `Each parent's income left after the personal allowance and his or her share of the primary allowance and supplements is multiplied by a factor set by ARM 37.62.128: ${pct(sola1)} for one child, ${pct(sola2)} for two, up to ${pct(sola8)} for eight or more. The result is added to that parent's share of the primary allowance, so higher incomes pass part of their standard of living to the child.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:hawaii', 'child-support:north-dakota', 'child-support:wyoming', 'workers-comp:montana'],
});
