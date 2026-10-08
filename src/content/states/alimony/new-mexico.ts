import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct } from '../../../lib/kit';

const d = al('new-mexico');
const P = d.params;
const NC = P.withoutChildren, WC = P.withChildren;
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; rule: string; pctMin?: number; pctMax?: number }>;
const off1 = alCalc('new-mexico', { payer: 6000, payee: 1800 });
const off2 = alCalc('new-mexico', { payer: 6000, payee: 1800, children: true });
const ex = alCalc('new-mexico', { payer: 5400, payee: 2200, years: 14 });
const mid = T.find((r) => r.pctMin != null)!;

export default defineStatePage({
  topic: 'alimony',
  slug: 'new-mexico',
  title: `New Mexico Alimony Calculator 2026: Guideline Worksheet`,
  description: `New Mexico alimony guideline 2026: ${pct(NC.payorGrossPct)} of the payer's gross minus ${pct(NC.recipientGrossPct)} of the recipient's, or ${pct(WC.payorGrossPct)} minus ${pct(WC.recipientGrossPct)} when child support is also paid, with no cap.`,
  intro: 'New Mexico courts publish an alimony worksheet that starts from gross incomes and is computed before child support.',
  resume: `New Mexico's statewide alimony guidelines, published by the courts, compute spousal support from gross monthly incomes: ${pct(NC.payorGrossPct)} of the payer's income minus ${pct(NC.recipientGrossPct)} of the recipient's when no child support is paid, and ${pct(WC.payorGrossPct)} minus ${pct(WC.recipientGrossPct)} when it is. A result of zero or less means no guideline alimony. The official worked examples use a payer at ${usd(6000)} and a recipient at ${usd(1800)}: ${usd(off1.monthly)} a month without children, ${usd(off2.monthly)} with two. The alimony figure is then deducted from the payer's gross income and added to the recipient's before child support is calculated. The guidelines are advisory and set no income cap; the judge still weighs the factors of NMSA 1978 § 40-4-7(E), such as age, health, earning capacity, needs, the length of the marriage and the property each spouse receives. On duration, the commentary says marriages under ${T[0].marriageYearsMax} years generally lead to no alimony and marriages over ${T[3].marriageYearsMin} years to a reservation of jurisdiction.`,
  body: (h) => `<h2>A worksheet born in Albuquerque</h2>
<p>The guidelines come from a committee of family lawyers, accountants and a judge set up in 2001 by the presiding judge of the Second Judicial District family court in Bernalillo County, and were revised in 2006 for statewide use. The committee studied guideline models elsewhere and settled on a simple two-percentage formula modeled on a Virginia county's pendente lite guideline, then adapted it for post-divorce alimony. That origin explains the resemblance between the New Mexico percentages and Virginia's older ones. The worksheet is now posted among the forms of the New Mexico courts, but no statute or rule makes it binding.</p>

<h2>Gross income, then child support</h2>
<p>Both incomes on the worksheet are gross, defined as for child support under § 40-4-11.1. Take a payer at ${h.usd(5400)} and a recipient at ${h.usd(2200)} with no child support: ${h.pct(NC.payorGrossPct)} of the first is ${h.usd((5400 * NC.payorGrossPct) / 100)}, ${h.pct(NC.recipientGrossPct)} of the second is ${h.usd((2200 * NC.recipientGrossPct) / 100)}, and the guideline is ${h.usd(ex.monthly)}. When child support is paid, the percentages shift to ${h.pct(WC.payorGrossPct)} and ${h.pct(WC.recipientGrossPct)}, and the result adjusts both incomes before the child support worksheet is filled in. The commentary warns that with a 50/50 time-sharing worksheet, guideline alimony and low child support together may leave the family short.</p>

<h2>No cap, and duration left open</h2>
<p>Unlike most formulas, the New Mexico guideline has no income ceiling. The committee chose that deliberately, in line with the state's child support guidelines, and noted that in high-income cases the result may be unreasonable and the court should look to the reasonable needs and the marital standard of living instead. The commentary on duration is descriptive rather than prescriptive: ${T.map((r) => `${r.marriageYearsMax == null ? `over ${r.marriageYearsMin}` : `${r.marriageYearsMin} to under ${r.marriageYearsMax}`} years, ${r.rule}`).join('; ')}. For the middle band it mentions that some states use ${h.pct(mid.pctMin!)} to ${h.pct(mid.pctMax!)} of the years married, without adopting it, so our calculator gives no term. A lump-sum buy-out remains possible at any length.</p>`,
  faqs: [
    {
      q: 'Is the New Mexico alimony guideline mandatory?',
      a: 'No. The New Mexico Alimony Guidelines were drafted by a court committee and are published by the New Mexico courts, but no statute or rule requires judges to follow them. Courts must still consider the factors of NMSA 1978 § 40-4-7(E), and many use the worksheet as a starting point, especially in settlement, before adjusting for the facts of the case.',
    },
    {
      q: 'Does New Mexico alimony use gross or net income?',
      a: `Gross. The New Mexico worksheet takes ${pct(NC.payorGrossPct)} of the payer's gross monthly income minus ${pct(NC.recipientGrossPct)} of the recipient's, or ${pct(WC.payorGrossPct)} minus ${pct(WC.recipientGrossPct)} when child support is paid, with gross income defined as in the child support statute. Because alimony is computed first, it then shifts gross income from the payer to the recipient for the child support calculation.`,
    },
    {
      q: 'How long does alimony last in New Mexico?',
      a: `The New Mexico guideline commentary describes practice rather than a rule: generally no alimony after a marriage under ${T[0].marriageYearsMax} years, mostly rehabilitative or transitional support from ${T[1].marriageYearsMin} to ${T[1].marriageYearsMax} years, and a reservation of jurisdiction after ${T[3].marriageYearsMin} years unless the spouses agree to a fixed lump-sum arrangement. The judge sets the term in each case.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'child-support:new-mexico', 'alimony:texas', 'alimony:arizona'],
});
