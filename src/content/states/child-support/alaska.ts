import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num } from '../../../lib/kit';

const d = cs('alaska');
const F = d.formula as {
  percentages: Record<string, number>; incomeCapAnnual: number; minimumMonthly: number; minimumAnnual: number;
  lowIncomeThresholdAnnual: number; lowIncomeDeductionAnnual: number; sharedMinPercent: number; sharedMaxPercent: number;
  sharedMinOvernights: number; sharedMultiplier: number; retirementDeductionCapPctOfIncome: number; healthPremiumDeductionCapPctOfIncome: number;
  lifeInsuranceDeductionCapAnnual: number;
};
const p1 = F.percentages['1'], p2 = F.percentages['2'], p3 = F.percentages['3'], extra = F.percentages.eachAdditional;
const capM = F.incomeCapAnnual / 12;
const N = F.sharedMinOvernights;

const one = csCalc('alaska', 5000, 0, 1);
const four = csCalc('alaska', 5000, 0, 4);
const rich = csCalc('alaska', 15000, 0, 1);
const A = 80000 / 12, B = 40000 / 12;
const under = csCalc('alaska', A, B, 2, { payerOvernights: N - 1 });
const shared = csCalc('alaska', A, B, 2, { payerOvernights: 146 });
const even = csCalc('alaska', A, B, 2, { payerOvernights: 182 });
const tiny = csCalc('alaska', 150, 0, 1);
const prem = 300;
const withHealth = csCalc('alaska', 5000, 0, 1, { health: prem, healthBy: 'payer' });

export default defineStatePage({
  topic: 'child-support',
  slug: 'alaska',
  title: `Alaska Child Support 2026: ${pct(p1)} Rule, ${usd(F.incomeCapAnnual)} Income Cap`,
  description: `Alaska child support 2026 under Civil Rule 90.3: ${pct(p1)} of adjusted income for one child, ${usd(one.monthly)} a month at ${usd(5000)}, income counted up to ${usd(F.incomeCapAnnual)} a year.`,
  intro: 'Civil Rule 90.3 worked through: a court rule rather than a statute, written in annual figures, with its own definition of shared custody.',
  resume: `Under Alaska Civil Rule 90.3, a parent with ${usd(5000)} a month of adjusted income owes ${usd(one.monthly)} a month for one child, since the rule takes ${pct(p1)} of the noncustodial parent's adjusted annual income for one child, ${pct(p2)} for two, ${pct(p3)} for three and ${pct(extra)} more for each additional child. Adjusted income is total income minus income taxes, Social Security and Medicare, mandatory union dues and retirement contributions, prior support orders, work-related child care and a few capped items. Only the first ${usd(F.incomeCapAnnual)} a year counts automatically, so a parent at ${usd(15000)} a month pays ${usd(rich.monthly)} for one child unless the court finds more is just. The floor is ${usd(F.minimumMonthly)} a month. When the children live with each parent at least ${pct(F.sharedMinPercent)} of the year, about ${num(N)} overnights, a separate shared custody formula replaces the percentage.`,
  body: (h) => `<h2>A Supreme Court rule, counted by the year</h2>
<p>Alaska's guideline is not in the statutes. It is Civil Rule 90.3, adopted by the Alaska Supreme Court and amended by court order, most recently with effect from October 2023, and the Legislature can override it. The rule works in annual amounts: it multiplies a year of adjusted income by the percentage and then spreads the result over twelve installments. Our calculator takes monthly figures and divides back.</p>
<p>The deductions are listed and several are capped. Voluntary retirement savings count only while mandatory and voluntary contributions together stay under ${pct(F.retirementDeductionCapPctOfIncome)} of total income. The parent's own health, dental and vision premiums are limited to ${pct(F.healthPremiumDeductionCapPctOfIncome)} of income, and life insurance naming the children or the other parent to ${usd(F.lifeInsuranceDeductionCapAnnual)} a year.</p>
<h2>Shared custody starts at ${num(N)} overnights</h2>
<p>A parent has shared physical custody when the order gives him or her the children between ${pct(F.sharedMinPercent)} and ${pct(F.sharedMaxPercent)} of the year; the commentary converts the lower bound to ${num(N)} overnights, and a daytime visit does not count. Each parent's primary-custody amount is multiplied by the other parent's share of time, the two are netted, and the difference is raised by ${num(F.sharedMultiplier, 1)} for the cost of two homes, without ever exceeding what the payer would owe with no shared time.</p>
<p>Take parents with ${usd(80000)} and ${usd(40000)} of adjusted income a year and two children. At ${num(N - 1)} nights the higher earner pays ${usd(under.monthly)} a month. At 146 nights, a 60/40 split, the order drops to ${usd(shared.monthly)}; at an even split, ${usd(even.monthly)}. The order must warn that failing to exercise enough custody is a ground to modify it.</p>
<h3>Floors, ceilings and the low-income step</h3>
<p>The ${usd(F.minimumAnnual)} annual minimum means a parent with ${usd(150)} a month of adjusted income still owes ${usd(tiny.monthly)}. A second protection sits in the income definition: a parent whose total income is ${usd(F.lowIncomeThresholdAnnual)} a year or less may count total income minus ${usd(F.lowIncomeDeductionAnnual)} if that is lower than the regular adjusted figure. Because the calculator receives adjusted income, apply that comparison yourself before entering the amount.</p>
<p>Health insurance for the children is split evenly unless the court orders otherwise. A payer at ${usd(5000)} who carries a ${usd(prem)} premium sees the order fall from ${usd(one.monthly)} to ${usd(withHealth.monthly)}; four children at the same income would cost ${usd(four.monthly)} before that credit. Extended summer visits of more than 27 consecutive days can earn a credit of up to 75% for that period, which the order must spell out in advance. The ${h.a('child-support:hawaii', 'Hawaii')} page shows an income-shares state for comparison, and the ${h.a('child-support', 'main calculator')} covers the rest of the country.</p>`,
  faqs: [
    { q: 'How much is child support in Alaska for one child?', a: `Civil Rule 90.3 sets it at ${pct(p1)} of the noncustodial parent's adjusted annual income, with a minimum of ${usd(F.minimumMonthly)} a month. Adjusted income means total income less income taxes, Social Security, Medicare, mandatory dues and retirement, and a few other allowed items. A parent with ${usd(5000)} a month of adjusted income would pay ${usd(one.monthly)} a month.` },
    { q: 'Is there a maximum income for Alaska child support?', a: `The percentages apply to adjusted annual income up to ${usd(F.incomeCapAnnual)}. Above that, the court may award more only if it is just and proper given the children's needs, their standard of living and the parent's ability to pay. For one child the presumptive ceiling is therefore ${usd(rich.monthly)} a month, reached at about ${usd(capM)} of monthly adjusted income.` },
    { q: 'How many overnights count as shared custody in Alaska?', a: `The rule requires that the children live with each parent at least ${pct(F.sharedMinPercent)} and no more than ${pct(F.sharedMaxPercent)} of the year, which the commentary puts at ${num(N)} overnights. Above that line, reciprocal amounts are weighted by time, netted and multiplied by ${num(F.sharedMultiplier, 1)}. With ${usd(80000)} and ${usd(40000)} a year and two children, a 60/40 split yields ${usd(shared.monthly)} a month.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:hawaii', 'child-support:california'],
});
