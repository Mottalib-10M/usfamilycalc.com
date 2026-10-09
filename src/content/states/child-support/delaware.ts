import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('delaware');
const F = d.formula as {
  selfSupportAllowance: number; primarySupportAllowance: { first: number; eachAdditional: number; half: number; eachAdditionalHalf: number };
  solaPct: Record<string, number>; highIncomeThreshold: number; highIncomeOffsetPct: number; parentingTimeTable: Array<[number, number]>;
  sharedFromOvernights: number; selfSupportProtectionPct: { default: number; threeOrMoreHouseholds: number };
  minimumOrder: Record<string, number>; sharedNoObligationBelow: number; presumptiveMinimumIncome: number; nontaxableSurcharge: number; effective: string;
};
const P = F.primarySupportAllowance;
const [pt1, pt2] = F.parentingTimeTable;
const A = 4000, B = 2000;
const base = csCalc('delaware', A, B, 1);
const visits = csCalc('delaware', A, B, 1, { payerOvernights: 100 });
const longer = csCalc('delaware', A, B, 1, { payerOvernights: 140 });
const shared = csCalc('delaware', A, B, 1, { payerOvernights: 182 });
const two = csCalc('delaware', A, B, 2);
const minCase = csCalc('delaware', 1800, 3000, 1);
const net = A - F.selfSupportAllowance;

export default defineStatePage({
  topic: 'child-support',
  slug: 'delaware',
  title: `Delaware Child Support 2026: Melson Formula and $${num(F.selfSupportAllowance)} Rule`,
  description: `Delaware child support 2026 by the Melson formula: ${usd(F.selfSupportAllowance)} self-support allowance, ${usd(P.first)} primary support per child, SOLA ${pct(F.solaPct['1'])}; ${usd(base.monthly)} a month in our example.`,
  intro: 'How the Family Court of Delaware turns two gross incomes into one order, line by line on Form 509.',
  resume: `A Delaware parent earning ${usd(A)} a month gross, with the other parent at ${usd(B)} and one child living with that parent, owes about ${usd(base.monthly)} a month under the formula the Family Court revised on ${day(F.effective)}. Delaware invented the Melson formula and still applies it through Family Court Civil Rules 500 to 510. Every parent first keeps a self-support allowance of ${usd(F.selfSupportAllowance)} a month. The remaining income sets each parent's share of the child's primary need, which starts at ${usd(P.first)} for the first child and adds ${usd(P.eachAdditional)} for each additional one, plus work-related child care and part of the children's medical premium. Whatever income survives that step feeds the standard of living adjustment: ${pct(F.solaPct['1'])} for one child, ${pct(F.solaPct['2'])} for two, ${pct(F.solaPct['3'])} for three. The order is capped at ${pct(F.selfSupportProtectionPct.default)} of the parent's net available income and, outside shared placement, cannot fall below ${usd(F.minimumOrder['1'])} for one child.`,
  body: (h) => `<h2>The Melson formula at home</h2>
<p>Judge Elwood Melson's method was built in Delaware's Family Court, and the 2026 version keeps its three layers: protect the parent, cover the child's primary need, then share the standard of living. The allowances are reset by February 1 of every year from the federal poverty guidelines, which is why Form 509i carries a year in its title. With ${usd(A)} of gross pay, Line 6 leaves ${usd(net)} after the ${usd(F.selfSupportAllowance)} allowance; a parent at ${usd(B)} keeps ${usd(B - F.selfSupportAllowance)}. That puts ${pct(Math.round(base.payerShare * 1000) / 10)} of the primary need on the higher earner.</p>
<p>Income is gross, but not every dollar counts the same. Nontaxable income such as VA benefits or post-2018 alimony is raised by ${pct(F.nontaxableSurcharge * 100)} to reach a taxable equivalent, and a parent who is unemployed without good cause is imputed at least the presumptive minimum income of ${usd(F.presumptiveMinimumIncome)} a month.</p>
<h2>Overnights: two steps, then half a child</h2>
<p>Line 22 rewards regular contact. A parent with ${num(pt1[0])} to ${num(pt2[0] - 1)} overnights a year keeps ${pct(pt1[1])} of the other household's retained primary support and SOLA; from ${num(pt2[0])} overnights it is ${pct(pt2[1])}. In our example the order goes from ${usd(base.monthly)} to ${usd(visits.monthly)} at 100 overnights and ${usd(longer.monthly)} at 140. From ${num(F.sharedFromOvernights)} overnights in each home the child counts as half a child in each household, the half-child allowance of ${usd(P.half)} applies on both sides, and the two obligations offset each other: ${usd(shared.monthly)} a month at an even split. Nothing is owed in shared placement when the result is under ${usd(F.sharedNoObligationBelow)}.</p>
<h3>Where the floor and the ceiling meet</h3>
<p>Line 23 limits any order to ${pct(F.selfSupportProtectionPct.default)} of the parent's net available income, ${pct(F.selfSupportProtectionPct.threeOrMoreHouseholds)} when the parent supports children in three or more households. The minimum order then pushes back up: a parent earning ${usd(1800)} next to a parent earning ${usd(3000)} would be capped below the minimum, yet the court imposes ${usd(minCase.monthly)} for one child unless the parent is disabled. For two children at our main incomes the formula lands on ${usd(two.monthly)}, held there by that same Line 23 ceiling. When both parents keep more than ${usd(F.highIncomeThreshold)} for SOLA, ${pct(F.highIncomeOffsetPct)} of the excess is set aside before the SOLA percentage applies.</p>
<p>The court's ${h.ext('https://courts.delaware.gov/family/support/supportcalculator.aspx', 'Child Support Calculator and Form 509i instructions')} are the reference. For the same model in another state, see ${h.a('child-support:hawaii', 'Hawaii')}.</p>`,
  faqs: [
    { q: 'What is the self-support allowance in Delaware child support for 2026?', a: `${usd(F.selfSupportAllowance)} a month for each parent, under the formula effective ${day(F.effective)}. It is subtracted on Line 5 of the calculation after allowable deductions, and it represents the minimum a parent needs to stay productive at work. It is adjusted each year with the federal poverty guidelines, so the figure in an older order will differ from today's.` },
    { q: 'How many overnights reduce child support in Delaware?', a: `${num(pt1[0])} a year is the first step: from ${num(pt1[0])} to ${num(pt2[0] - 1)} overnights the paying parent keeps ${pct(pt1[1])} of the other household's retained support, from ${num(pt2[0])} to ${num(F.sharedFromOvernights - 1)} it is ${pct(pt2[1])}, and at ${num(F.sharedFromOvernights)} or more the placement is shared. With ${usd(A)} and ${usd(B)} of gross income and one child, support moves from ${usd(base.monthly)} to ${usd(visits.monthly)} at 100 overnights.` },
    { q: 'What is the minimum child support order in Delaware?', a: `${usd(F.minimumOrder['1'])} a month for one child and ${usd(F.minimumOrder['2+'])} for two or more, unless the children are in shared or split placement or the obligated parent is disabled. The minimum applies even when the ${pct(F.selfSupportProtectionPct.default)} cap of Line 23 would produce less, as in a case where a parent earns ${usd(1800)} a month gross. For an incarcerated parent the figures are halved.` },
    { q: 'Does Delaware count my new spouse’s income for child support?', a: `No line of Form 509i adds a stepparent's income. The formula uses the two parents' own incomes, with a ${pct(F.nontaxableSurcharge * 100)} surcharge on nontaxable income. A stepparent's policy can matter in one place: medical insurance obtained through a stepparent may be entered on Line 12C if the stepparent's own children are not on the policy.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:hawaii', 'child-support:maryland', 'child-support:pennsylvania', 'workers-comp:delaware'],
});
