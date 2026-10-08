import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('illinois');
const P = d.params;
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; factor: number | null }>;
const first = T[0], lastF = T.filter((r) => r.factor != null).pop()!;
const ex = alCalc('illinois', { payer: 9000, payee: 2400, years: 11 });
const capped = alCalc('illinois', { payer: 9000, payee: 4500, years: 11 });
const longM = alCalc('illinois', { payer: 9000, payee: 2400, years: 23 });
const yrs = (m: number | null | undefined) => num((m ?? 0) / 12, 2);

export default defineStatePage({
  topic: 'alimony',
  slug: 'illinois',
  title: `Illinois Maintenance Calculator 2026: One-Third Guideline`,
  description: `Illinois maintenance 2026: one-third of the payor's net income minus ${pct(P.payeeNetPct)} of the payee's, capped at ${pct(P.capPctOfCombinedNet)} of combined net, below ${usd(P.combinedGrossAnnualLimit)} of gross income.`,
  intro: 'Illinois turns two net incomes and the length of the marriage into a guideline amount and a guideline term, once a judge finds maintenance appropriate.',
  resume: `Illinois guideline maintenance is one-third of the payor's net income minus ${pct(P.payeeNetPct)} of the payee's net income, and the payee's net income plus maintenance may not exceed ${pct(P.capPctOfCombinedNet)} of the couple's combined net income (750 ILCS 5/504(b-1)(1)(A)). The guideline applies only when combined gross income is under ${usd(P.combinedGrossAnnualLimit)} a year and the payor owes no support from a prior relationship. With ${usd(9000)} and ${usd(2400)} of monthly net income, it gives ${usd(ex.monthly)} a month. Duration is the length of the marriage at filing times a factor that starts at ${first.factor} below ${first.marriageYearsMax} years and rises to ${lastF.factor} just under ${lastF.marriageYearsMax}; an 11-year marriage gives ${yrs(ex.durationMonths)} years. From ${lastF.marriageYearsMax} years on, the judge orders maintenance for as long as the marriage lasted or for an indefinite term. The court must first decide that maintenance is appropriate under the § 504(a) factors.`,
  body: (h) => `<h2>Two steps, and the first can end the case</h2>
<p>Section 504(b-1) begins with a bar: unless the court finds an award appropriate, maintenance is denied whatever the length of the marriage. Only after that finding does the arithmetic start. That order matters in practice, because a payee who cannot show need under the § 504(a) factors gets nothing, even if the guideline would produce a large figure. When the judge departs from the guideline, § 504(b-2) requires findings that state what the guideline would have given and why it was not followed.</p>

<h2>Where the ${h.pct(P.capPctOfCombinedNet)} limit bites</h2>
<p>The formula subtracts a quarter of the payee's net income from a third of the payor's. A second test then caps the result so that the payee ends up with no more than ${h.pct(P.capPctOfCombinedNet)} of what both spouses net together. When the incomes are far apart, the first test decides: ${h.usd(9000)} against ${h.usd(2400)} a month yields ${h.usd(ex.monthly)}. When they are closer, the ceiling takes over. At ${h.usd(9000)} and ${h.usd(4500)}, the raw formula would give ${h.usd(9000 / 3 - 4500 * P.payeeNetPct / 100)}, but the cap brings it to ${h.usd(capped.monthly)}. Both incomes are net, and maintenance paid in the pending case is left out of both.</p>
${h.table(['Years married', 'Factor'], T.filter((r) => r.factor != null).filter((_, i) => i % 3 === 0 || i === 15).map((r) => [`${h.num(r.marriageYearsMin)} to under ${h.num(r.marriageYearsMax ?? 0)}`, h.num(r.factor!, 2)]), `Extract of the § 504(b-1)(1)(B) duration factors; the full list rises by ${h.num(T[1].factor! - T[0].factor!, 2)} a year.`, ['l', 'r'])}

<h2>From a fraction of the marriage to its full length</h2>
<p>The term is the marriage length at the time the action was filed multiplied by the factor for that length. Eleven years gives ${h.num(ex.durationMonths ?? 0, 1)} months. At ${h.num(lastF.marriageYearsMax ?? 0)} years the fraction disappears: a 23-year marriage leads either to ${h.num(longM.durationMonths ?? 0)} months, the full length, or to indefinite maintenance, at the judge's choice. Temporary maintenance paid while the case was pending may be credited against the term (§ 504(b-1)(1.5)). The order must say whether maintenance is fixed-term, indefinite, reviewable or reserved.</p>
<p>Two more checks sit beside the formula. If guideline maintenance and child support together exceed ${h.pct(P.combinedSupportReviewPctOfPayerNet)} of the payor's net income, the court may set non-guideline amounts. And orders entered before 2019 that stay tax-deductible are modified with a gross-income version of the formula, not this one.</p>`,
  faqs: [
    {
      q: 'Does the Illinois maintenance guideline apply to high earners?',
      a: `Not automatically. The 750 ILCS 5/504(b-1) guideline applies only when the spouses' combined gross annual income is under ${usd(P.combinedGrossAnnualLimit)} and the payor has no child support or maintenance obligation from a prior relationship. Above that line, Illinois judges set the amount and term from the § 504(a) factors, and must explain their reasoning, though many still look at the guideline figure as a reference.`,
    },
    {
      q: 'How long is maintenance in Illinois after a 20-year marriage?',
      a: `For a marriage of ${lastF.marriageYearsMax} years or more at filing, the Illinois judge orders maintenance either for a period equal to the length of the marriage or for an indefinite term. Shorter marriages use a multiplier, from ${first.factor} below ${first.marriageYearsMax} years to ${lastF.factor} in the last year before ${lastF.marriageYearsMax}, applied to the number of years married.`,
    },
    {
      q: 'Is Illinois maintenance calculated on gross or net income?',
      a: `On net income for orders after 2018: one-third of the payor's net minus ${pct(P.payeeNetPct)} of the payee's net, capped at ${pct(P.capPctOfCombinedNet)} of combined net. Net income follows the Illinois child support definition in § 505. Gross income still matters for the eligibility threshold and for modifying older orders that remain deductible for federal tax.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:pennsylvania', 'alimony:colorado'],
});
