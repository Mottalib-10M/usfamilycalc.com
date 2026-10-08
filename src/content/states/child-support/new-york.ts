import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, day } from '../../../lib/kit';

const d = cs('new-york');
const P = d.percent!;
const F = d.formula as {
  combinedIncomeCap: number;
  combinedIncomeCapEffective: string;
  previousCap: { amount: number };
  povertyGuidelineSingle2026: number;
  selfSupportReserve2026: number;
  minimumBelowPoverty: { monthly: number; annual: number };
  minimumBelowSSR: { monthly: number; annual: number };
};
const cap = F.combinedIncomeCap;
const capFrom = day(F.combinedIncomeCapEffective);
const prev = F.previousCap.amount;
const pov = F.povertyGuidelineSingle2026;
const ssr = F.selfSupportReserve2026;
const capBase = Number(/started at \$([\d,]+)/.exec(d.facts.map((f) => f.text).join(' '))?.[1]?.replace(/,/g, '') ?? 0);

// Worked example: noncustodial parent 5,000 a month (60,000 a year), custodial parent 2,500 (30,000), two children.
const ex = csCalc('new-york', 5000, 2500, 2);
const exShare = ex.payerShare;
// Above the cap: 15,000 and 5,000 a month (combined 240,000 a year), one child.
const hi = csCalc('new-york', 15000, 5000, 1);
const hiAll = ((15000 + 5000) * 12 * P.byChildren[0] * hi.payerShare) / 100 / 12;
const ssrPct = Math.round((ssr / pov) * 100);
const capGain = ((cap - prev) * P.byChildren[0]) / 100;
// Low-income floors.
const ssrCase = csCalc('new-york', 2000, 0, 2);
const povCase = csCalc('new-york', 1500, 0, 1);

export default defineStatePage({
  topic: 'child-support',
  slug: 'new-york',
  title: `New York Child Support Calculator 2026: CSSA, ${usd(cap / 1000)}K Cap`,
  description: `New York child support 2026 (CSSA): ${pct(P.byChildren[0])} to ${pct(P.byChildren[4])} of combined parental income up to ${usd(cap)}, prorated. Two children, ${usd(60000)} and ${usd(30000)} a year: ${usd(ex.monthly)} a month.`,
  intro: 'New York starts from gross income, adds both parents together and stops counting at a cap that rose on March 1, 2026.',
  resume: `New York child support under the Child Support Standards Act (CSSA) is a percentage of the parents’ combined income: ${pct(P.byChildren[0])} for one child, ${pct(P.byChildren[1])} for two, ${pct(P.byChildren[2])} for three, ${pct(P.byChildren[3])} for four and at least ${pct(P.byChildren[4])} for five or more, applied to combined parental income up to ${usd(cap)} a year since ${capFrom} (it was ${usd(prev)}). The noncustodial parent pays a share of that amount equal to his or her share of combined income. A parent earning ${usd(60000)} a year with a co-parent earning ${usd(30000)} and two children owes ${usd(ex.monthly * 12)} a year, ${usd(ex.monthly)} a month. Income is gross income as reported on the federal return, minus FICA and New York City or Yonkers income tax actually paid; federal and state income taxes are not deducted. A noncustodial parent left below the ${usd(pov)} poverty guideline pays ${usd(F.minimumBelowPoverty.monthly)} a month, and one who would fall below the ${usd(ssr)} self-support reserve pays only the income above it, with a ${usd(F.minimumBelowSSR.monthly)} monthly minimum. Child care and health costs are added and prorated, and support runs to age 21.`,
  body: (h) => `<h2>Gross income, with two deductions that matter</h2>
<p>New York is unusual in refusing to subtract income tax. Family Court Act § 413(1)(b)(5) starts from the gross income that should have been reported on the parent’s latest federal return, adds non-taxable sources such as workers’ compensation, disability and Social Security benefits, and then allows a short list of deductions. The two that most paychecks use are FICA actually paid and New York City or Yonkers income tax actually paid. Federal and New York State income tax stay in. So does most of what a pay stub withholds. Maintenance paid to the other parent comes off too, which is why New York courts compute spousal maintenance first and child support second. A Manhattan employee and a Buffalo employee with the same salary can therefore have different CSSA incomes, purely because of the city tax.</p>

<h2>A worked CSSA example</h2>
<p>Take a noncustodial parent earning ${h.usd(60000)} and a custodial parent earning ${h.usd(30000)}, both after the allowed deductions, with two children. Combined parental income is ${h.usd((5000 + 2500) * 12)}; ${h.pct(P.byChildren[1])} of it gives a combined obligation of ${h.usd(ex.basicMonthly * 12)} a year. The noncustodial parent has ${h.pct(Math.round(exShare * 1000) / 10)} of the income and owes that share: ${h.usd(ex.monthly * 12)} a year, or ${h.usd(ex.monthly)} a month. The custodial parent’s share is never paid out; it is presumed spent directly on the children. The ${h.ext(d.guidelinesUrl, 'Child Support Standards Chart')} published by OTDA lists the same figures in ${h.usd(100)} income steps computed at the bottom of each step, so a calculation with the exact percentages can differ from the chart by a few dollars.</p>

<h2>The ${h.usd(cap)} combined income cap</h2>
<p>Social Services Law § 111-i adjusts the cap every two years on March 1 by the change in the consumer price index, rounded to the nearest thousand dollars, starting from ${h.usd(capBase)}. The ${capFrom} revision raised it from ${h.usd(prev)} to ${h.usd(cap)}, which by itself adds ${h.usd(capGain)} a year to the combined obligation for one child in families above the old ceiling. On combined income beyond the cap, the court may apply the percentages, apply them partly, or not at all, after weighing the factors of § 413(1)(f) and explaining its choice. For parents earning ${h.usd(15000 * 12)} and ${h.usd(5000 * 12)} with one child, the capped obligation of the higher earner is ${h.usd(hi.monthly)} a month; applying the percentage to all ${h.usd((15000 + 5000) * 12)} would make it ${h.usd(hiAll)}. That gap is often what a New York support hearing is actually about.</p>

<h2>Poverty guideline and self-support reserve</h2>
<p>Two floors protect a low-earning noncustodial parent (§ 413(1)(d)). If paying the percentage would leave income below the ${h.usd(pov)} federal poverty guideline for one person, the basic obligation becomes ${h.usd(F.minimumBelowPoverty.monthly)} a month. If it would leave income between that line and the self-support reserve, set at ${h.pct(ssrPct)} of the poverty guideline (${h.usd(ssr)} for 2026), the obligation is the greater of ${h.usd(F.minimumBelowSSR.monthly)} a month or the income above the reserve. A parent earning ${h.usd(2000 * 12)} with two children, and a custodial parent with no income, would owe ${h.usd(ssrCase.monthly)} a month instead of the full percentage; a parent earning ${h.usd(1500 * 12)} with one child owes ${h.usd(povCase.monthly)}.</p>

<h2>Add-ons and the age of 21</h2>
<p>Reasonable child care costs incurred so the custodial parent can work, look for work or study are prorated by income share (§ 413(1)(c)(4)), as are health insurance premiums and unreimbursed medical costs (§ 413(1)(c)(5)). In the example above the noncustodial parent would carry ${h.pct(Math.round(exShare * 1000) / 10)} of each bill. College and private school costs are discretionary (§ 413(1)(c)(7)). The CSSA has no formula for parenting time: an equal schedule still leaves the higher earner as noncustodial parent for support purposes in most cases, with the § 413(1)(f) factors as the only route to a lower figure. Support continues until the child turns 21 unless the child becomes emancipated earlier. The worksheet printed with the OTDA chart walks through the same steps, line by line, and is the form most New York courts expect to see.</p>`,
  faqs: [
    {
      q: 'What is the combined income cap for child support in New York in 2026?',
      a: `The New York combined parental income cap is ${usd(cap)} a year since ${capFrom}, up from ${usd(prev)}. The CSSA percentages apply automatically to combined income up to that figure. On income above it, the judge decides whether to apply the percentages, using the factors listed in Family Court Act § 413(1)(f), and must explain the decision. The cap is adjusted every two years for inflation.`,
    },
    {
      q: 'Are taxes deducted from income for New York child support?',
      a: `Only some. New York uses gross income as reported on the federal return and lets parents deduct FICA and New York City or Yonkers income tax actually paid. Federal and New York State income taxes are not deducted, which is why New York percentages apply to a larger number than in states that work from net income. Maintenance paid to the other parent is also deducted.`,
    },
    {
      q: 'What is the minimum child support in New York?',
      a: `If paying the full percentage would push the noncustodial parent below the ${usd(pov)} poverty guideline, the New York obligation is ${usd(F.minimumBelowPoverty.monthly)} a month. Between that line and the ${usd(ssr)} self-support reserve, it is the greater of ${usd(F.minimumBelowSSR.monthly)} a month or the income above the reserve. A court can still add child care or health costs on top of these minimum amounts.`,
    },
    {
      q: 'Until what age is child support paid in New York?',
      a: `Until 21, later than in most states. Family Court Act § 413 defines the child as an unemancipated child under 21, so support continues through the college years unless the child marries, joins the military or becomes self-supporting, which the paying parent must prove. A New York court may also order a parent to contribute to college costs as a separate, discretionary add-on.`,
    },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:california', 'child-support:texas', 'child-support:new-jersey', 'workers-comp'],
});
