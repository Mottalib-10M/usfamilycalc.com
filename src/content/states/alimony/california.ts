import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('california');
const P = d.params;
const ex = alCalc('california', { payer: 8200, payee: 2600, years: 7 });
const withCs = alCalc('california', { payer: 8200, payee: 2600, years: 7, children: true, childSupport: 1500 });
const long = alCalc('california', { payer: 8200, payee: 2600, years: P.longMarriageYears + 4 });

export default defineStatePage({
  topic: 'alimony',
  slug: 'california',
  title: `California Spousal Support Calculator 2026: Temporary 40/50`,
  description: `California temporary spousal support 2026: Santa Clara's ${pct(P.payerNetPct)} of payer net minus ${pct(P.payeeNetPct)} of payee net, after child support; ${P.longMarriageYears}-year marriages are presumed long.`,
  intro: 'California has no statewide alimony formula; temporary support follows county guidelines, permanent support follows the Family Code factors.',
  resume: `California spousal support comes in two kinds that are set in different ways. Temporary support, ordered while the divorce is pending, is usually calculated with a county guideline built into the certified support software; the best known is Santa Clara County's Local Family Rule 3(C): ${pct(P.payerNetPct)} of the payer's net income minus ${pct(P.payeeNetPct)} of the payee's net income, adjusted for taxes, computed on income left after child support. With ${usd(8200)} and ${usd(2600)} of monthly net income and no children, that gives about ${usd(ex.monthly)} a month before the tax adjustment. Permanent support, in the judgment, has no formula: the judge weighs the factors of Family Code § 4320. Its usual goal is self-support within a reasonable period, generally ${pct(P.reasonablePeriodPctOfMarriage)} of the length of the marriage, so ${num((ex.durationMonths ?? 0) / 12, 1)} years after a 7-year marriage. A marriage of ${P.longMarriageYears} years or more is presumed to be of long duration, and the court keeps jurisdiction over support indefinitely (§ 4336).`,
  body: (h) => `<h2>Why the permanent order cannot use the temporary formula</h2>
<p>The Santa Clara rule itself keeps the two worlds apart. Rule 3(B) asks for a computer printout when temporary support is at issue, but expressly not for permanent support, which rests on the § 4320 analysis instead. That analysis looks at whether each spouse's earning capacity can maintain the marital standard of living, contributions to the other's education or career, ability to pay, needs, assets, the age and health of both, documented domestic violence, tax consequences and the balance of hardships.</p>

<h2>The Santa Clara arithmetic</h2>
<p>The local rule reads: ${h.pct(P.payerNetPct)} of the payor's net income, minus ${h.pct(P.payeeNetPct)} of the payee's, adjusted for tax consequences. In practice the adjustment is made inside support software that converts gross pay to net and accounts for the tax effect of the payments; we show the plain percentage result, which is why a court printout can differ. When there is child support, the rule applies the formula to net income not allocated to it. In our example, child support of ${h.usd(1500)} reduces the payer's base to ${h.usd(8200 - 1500)} and temporary spousal support to ${h.usd(withCs.monthly)}, against ${h.usd(ex.monthly)} without children. The court still departs from the formula when it would be inequitable or when the payee's demonstrated need is lower. Other counties use the same software with their own settings; check the local rules of the county where the case is filed.</p>

<h2>Half the marriage, until ten years</h2>
<p>Section 4320(l) sets the goal that the supported spouse become self-supporting within a reasonable period, and for marriages that are not long, that period is generally ${h.pct(P.reasonablePeriodPctOfMarriage)} of the marriage: ${h.num(ex.durationMonths ?? 0)} months after seven years. At ${h.num(P.longMarriageYears)} years, measured from the wedding to separation, the presumption of a long marriage under § 4336 removes that benchmark; for a ${h.num(P.longMarriageYears + 4)}-year marriage the calculator reports no fixed end (${long.durationMonths == null ? 'open term' : h.num(long.durationMonths)}). The court can still terminate support later on changed circumstances, and the presumption can be rebutted.</p>`,
  faqs: [
    {
      q: 'Is there a California spousal support calculator formula for the final judgment?',
      a: `No. California has no statewide formula for permanent spousal support. The judge applies the Family Code § 4320 factors, including the marital standard of living, earning capacities, ability to pay and the goal of self-support. Formulas such as Santa Clara County's ${pct(P.payerNetPct)}/${pct(P.payeeNetPct)} rule are used for temporary support while the divorce is pending, through the certified support software.`,
    },
    {
      q: 'How long does spousal support last in California?',
      a: `For a marriage of less than ${P.longMarriageYears} years, California courts generally aim for self-support within ${pct(P.reasonablePeriodPctOfMarriage)} of the length of the marriage, under Family Code § 4320(l), although the judge can order more or less. For a marriage of ${P.longMarriageYears} years or more, presumed long under § 4336, there is no default end date and the court keeps jurisdiction indefinitely.`,
    },
    {
      q: 'Does domestic violence affect spousal support in California?',
      a: 'Yes. Family Code § 4320(i) requires a California court to consider documented evidence of domestic violence between the parties or against either party’s child, including a nolo contendere plea, a protective order after hearing, or a finding in another family case. A criminal conviction of an abusive spouse can also be grounds to reduce or eliminate support under § 4324.5 or § 4325.',
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'child-support:california', 'alimony:arizona', 'divorce-cost'],
});
