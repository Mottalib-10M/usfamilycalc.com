import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('colorado');
const P = d.params;
const rows = (d.durationTable as unknown as { rows: Array<[number, number, number]> }).rows;
const [b1, b2] = P.nonDeductibleFactor as Array<{ combinedMonthlyMax: number; factor: number }>;
const first = rows[0], last = rows[rows.length - 1];
const plateau = rows.find((r) => r[1] === last[1])!;
const ex = alCalc('colorado', { payer: 7200, payee: 2300, years: 9 });
const ex2 = alCalc('colorado', { payer: 13000, payee: 4000, years: 16 });
const over = alCalc('colorado', { payer: 16000, payee: 5000, years: 16 });
const lineF = (a: number, b: number) => ((a + b) * P.pctOfCombined) / 100 - Math.min(a, b);
const ann = P.combinedAnnualLimit;

export default defineStatePage({
  topic: 'alimony',
  slug: 'colorado',
  title: `Colorado Maintenance Calculator 2026: Advisory Guideline`,
  description: `Colorado maintenance 2026: ${pct(P.pctOfCombined)} of combined income minus the lower income, times ${b1.factor} or ${b2.factor} for post-2018 orders, when the couple earns ${usd(ann)} or less a year.`,
  intro: 'Colorado publishes an advisory maintenance figure and a term table, then leaves the judge free to depart from both.',
  resume: `Colorado's maintenance guideline under C.R.S. § 14-10-114 takes ${pct(P.pctOfCombined)} of the spouses' combined monthly adjusted gross income and subtracts the lower earner's income. For orders where maintenance is not tax-deductible, which covers agreements after 2018, the court worksheet then multiplies the result by ${b1.factor} when combined income is ${usd(b1.combinedMonthlyMax)} a month or less and by ${b2.factor} up to ${usd(b2.combinedMonthlyMax)}. The guideline only applies to marriages of at least ${P.minMarriageMonths} months and to combined income of ${usd(ann)} a year or less. Spouses earning ${usd(7200)} and ${usd(2300)} a month, married nine years, get an advisory ${usd(ex.monthly)} a month for ${ex.durationMonths} months. The term comes from a table running from ${first[0]} to ${last[0]} months of marriage, starting at ${pct(first[1])} of the months married and reaching ${pct(last[1])} at ${plateau[0]} months. The figures are advisory: they create no presumption that maintenance will be awarded at all.`,
  body: (h) => `<h2>Advice the court must consider, not follow</h2>
<p>Colorado sits between the formula states and the discretion states. Section 14-10-114 requires the court to consider the guideline amount and term, and the parties to sign an advisement showing them, even when both want to waive maintenance. Yet the same statute says the guideline creates no presumption. The judge first decides whether maintenance is warranted, weighing need, ability to pay, the property each spouse receives, the marital lifestyle, employability and the rest, and only then uses the numbers as a reference. Our calculator follows the advisement form published by the Colorado Judicial Branch.</p>

<h2>Reading the worksheet line by line</h2>
<p>Line C is the combined adjusted gross monthly income; line D is ${h.pct(P.pctOfCombined)} of it; line F is D minus the lower income, never below zero. For our couple at ${h.usd(7200)} and ${h.usd(2300)}, line F is ${h.usd(lineF(7200, 2300))}. Because their combined income is under ${h.usd(b1.combinedMonthlyMax)}, the post-2018 multiplier of ${h.num(b1.factor, 2)} applies and the advisory figure is ${h.usd(ex.monthly)}. A couple at ${h.usd(13000)} and ${h.usd(4000)} reaches line F of ${h.usd(lineF(13000, 4000))}, reduced by the ${h.num(b2.factor, 2)} multiplier to ${h.usd(ex2.monthly)}. The multipliers exist because the original formula assumed the payer would deduct the payments; once that deduction disappeared, the same gross figure would have cost the payer more after tax.</p>

<h2>Outside the guideline</h2>
<p>Two gates close the worksheet. A marriage shorter than ${h.num(P.minMarriageMonths)} months, counted from the wedding to the decree, gets no guideline figure at all; the parties sign the advisement without filling it in. Combined income above ${h.usd(ann)} a year, ${h.usd(ann / 12)} a month, also removes the guideline: spouses at ${h.usd(16000)} and ${h.usd(5000)} get ${h.usd(over.monthly)} from our calculator, which means not that no maintenance is due but that the court decides from the statutory factors without a reference number. We show zero in both cases rather than a figure the form tells parties not to compute.</p>
<p>The term table grows in small steps: ${h.num(first[0])} months of marriage suggest ${h.num(first[2])} months of maintenance, nine years suggest ${h.num(ex.durationMonths ?? 0)}, and from ${h.num(plateau[0])} months the percentage stays at ${h.pct(last[1])}, so ${h.num(last[0])} months of marriage suggest ${h.num(last[2])}. Beyond the end of the table the court sets the term.</p>`,
  faqs: [
    {
      q: 'Is the Colorado maintenance guideline binding on the judge?',
      a: 'No. Colorado’s guideline under C.R.S. § 14-10-114 is advisory: the court must consider the guideline amount and term, and the parties must acknowledge them on the advisement form, but they create no presumption that maintenance will be ordered or for how much. The judge first decides whether maintenance is appropriate from the statutory factors, then may award more, less or nothing.',
    },
    {
      q: `Why does Colorado reduce guideline maintenance by ${pct(b2.factor * 100)} or ${pct(b1.factor * 100)}?`,
      a: `Because maintenance under agreements after 2018 is no longer deductible for the payer on the federal return. The Colorado worksheet keeps the ${pct(P.pctOfCombined)} formula and then multiplies the result by ${b1.factor} when combined income is ${usd(b1.combinedMonthlyMax)} a month or less, and by ${b2.factor} above that, so the payer's after-tax cost stays closer to what the formula originally intended.`,
    },
    {
      q: 'How long is maintenance in Colorado after a 10-year marriage?',
      a: `The Colorado advisory table gives ${rows.find((r) => r[0] === 120)![2]} months for exactly 120 months of marriage, ${pct(rows.find((r) => r[0] === 120)![1])} of the months married. The percentage rises with each month of marriage and stops climbing at ${pct(last[1])} from ${plateau[0]} months; the table ends at ${last[0]} months of marriage, where the suggested term is ${last[2]} months. The judge can depart from it.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:illinois', 'alimony:arizona'],
});
