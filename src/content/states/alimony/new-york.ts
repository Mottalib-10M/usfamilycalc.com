import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, day, num } from '../../../lib/kit';

const d = al('new-york');
const P = d.params;
const T = d.durationTable as unknown as Array<{ marriageYearsMin: number; marriageYearsMax: number | null; pctMin: number; pctMax: number }>;
const NC = P.withoutChildSupport, WC = P.withChildSupport;
const ex = alCalc('new-york', { payer: 11000, payee: 3000, years: 17 });
const exKids = alCalc('new-york', { payer: 11000, payee: 3000, years: 17, children: true });
const rich = alCalc('new-york', { payer: 30000, payee: 0, years: 26 });
const capMonthly = P.incomeCapPayorAnnual / 12;

export default defineStatePage({
  topic: 'alimony',
  slug: 'new-york',
  title: `New York Maintenance Calculator 2026: ${usd(P.incomeCapPayorAnnual)} Cap`,
  description: `New York maintenance 2026: the guideline uses payor income up to ${usd(P.incomeCapPayorAnnual)} since ${day(P.incomeCapEffective)}, ${pct(NC.payorPct)}/${pct(NC.payeePct)}, or ${pct(WC.payorPct)}/${pct(WC.payeePct)} with child support, and a ${pct(P.capPctOfCombined)} limit.`,
  intro: 'New York sets temporary and post-divorce maintenance with the same arithmetic, applied to the payor’s income up to an inflation-indexed cap.',
  resume: `New York maintenance under Domestic Relations Law § 236(B) is computed in two passes. Without child support, take ${pct(NC.payorPct)} of the payor's income minus ${pct(NC.payeePct)} of the payee's; when the payor also pays child support as the noncustodial parent, ${pct(WC.payorPct)} minus ${pct(WC.payeePct)}. Then take ${pct(P.capPctOfCombined)} of the combined income minus the payee's income, and keep the lower figure. Only the payor's income up to ${usd(P.incomeCapPayorAnnual)} a year enters the formula, the cap published by the courts and in force since ${day(P.incomeCapEffective)} (it was ${usd(P.previousIncomeCap)}). A payor with ${usd(11000)} a month and a payee with ${usd(3000)} gives ${usd(ex.monthly)} a month without child support, ${usd(exKids.monthly)} with it. The payor keeps at least the self-support reserve of ${usd(P.selfSupportReserve)} a year. For post-divorce maintenance an advisory schedule suggests a term of ${pct(T[0].pctMin)} to ${pct(T[2].pctMax)} of the marriage depending on its length.`,
  body: (h) => `<h2>The cap moves every two years</h2>
<p>The statute itself names a starting cap of ${h.usd(P.statutoryBaseCap)} and orders an adjustment every two years from March 1, 2020, by the change in the consumer price index, rounded to the nearest thousand dollars; the Office of Court Administration publishes the result. The ${h.day(P.incomeCapEffective)} adjustment raised it from ${h.usd(P.previousIncomeCap)} to ${h.usd(P.incomeCapPayorAnnual)}, about ${h.usd(capMonthly)} a month. Income above the cap is not ignored, but what it adds is up to the judge, who must give reasons using the listed factors. A payor earning ${h.usd(30000)} a month with a non-earning spouse gets a guideline of ${h.usd(rich.monthly)} on the capped part; anything beyond that is argued, not computed.</p>

<h2>Maintenance before child support</h2>
<p>New York runs maintenance first and the Child Support Standards Act second: the maintenance figure is subtracted from the payor's income and added to the payee's before child support is calculated. That is why the percentages drop when child support is also owed. In our example the payee receives ${h.usd(ex.monthly)} without children but ${h.usd(exKids.monthly)} with them, and then child support on top. The lower percentages apply only when the payor is the noncustodial parent; a payor who has custody uses the ${h.pct(NC.payorPct)}/${h.pct(NC.payeePct)} version. If the guideline would push the payor below the self-support reserve of ${h.usd(P.selfSupportReserve)} a year, the award shrinks to the excess over the reserve.</p>
${h.table(['Length of marriage', 'Advisory term'], T.map((r, i) => [i === 0 ? `up to ${h.num(r.marriageYearsMax ?? 0)} years` : r.marriageYearsMax == null ? `more than ${h.num(r.marriageYearsMin)} years` : `over ${h.num(r.marriageYearsMin)} up to ${h.num(r.marriageYearsMax)} years`, `${h.pct(r.pctMin)} to ${h.pct(r.pctMax)} of the marriage`]), 'DRL § 236(B)(6)(f)(1); the marriage runs from the wedding to the start of the action.', ['l', 'r'])}

<h2>How long, and when it stops</h2>
<p>The duration schedule is advisory, a word the statute chose with care: the court may use it, must explain its choice either way, and may award non-durational maintenance in a fitting case. Seventeen years of marriage suggests ${h.num((ex.durationMinMonths ?? 0), 1)} to ${h.num((ex.durationMonths ?? 0), 1)} months. Temporary maintenance stops at the judgment of divorce. Post-divorce maintenance stops at the death of either party or the payee's remarriage, and the payor's actual retirement with a substantial loss of income is a ground to modify it. Unrepresented parties must be told the guideline amount before any order is entered.</p>`,
  faqs: [
    {
      q: 'What is the New York maintenance income cap in 2026?',
      a: `${usd(P.incomeCapPayorAnnual)} of the payor's annual income, effective ${day(P.incomeCapEffective)}, up from ${usd(P.previousIncomeCap)}. The cap is adjusted every two years under Domestic Relations Law § 236(B) and published by the New York courts. Income above it can still lead to more maintenance, but only through the judge's discretion and written reasons.`,
    },
    {
      q: 'Is temporary maintenance in New York the same as post-divorce maintenance?',
      a: `The amount formula is identical in New York: the lower of the ${pct(NC.payorPct)}/${pct(NC.payeePct)} (or ${pct(WC.payorPct)}/${pct(WC.payeePct)}) result and ${pct(P.capPctOfCombined)} of combined income minus the payee's income. The difference is duration. Temporary maintenance ends at the divorce judgment, while post-divorce maintenance follows the advisory schedule based on the length of the marriage.`,
    },
    {
      q: 'What is the self-support reserve in New York maintenance?',
      a: `It is the minimum annual income the payor keeps, ${usd(P.selfSupportReserve)} since ${day(P.incomeCapEffective)}. If paying the New York guideline maintenance would leave the payor below it, the award is reduced to the payor's income minus the reserve, and a payor already under the reserve is presumed to owe no maintenance, subject to the court's review.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'child-support:new-york', 'alimony:massachusetts', 'alimony:pennsylvania'],
});
