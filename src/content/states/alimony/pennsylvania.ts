import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct } from '../../../lib/kit';

const d = al('pennsylvania');
const P = d.params;
const N = P.post2018.noChildren, W = P.post2018.withChildren;
const OLD = P.pre2019Modification;
const noKids = alCalc('pennsylvania', { payer: 5200, payee: 1800 });
const kids = alCalc('pennsylvania', { payer: 5200, payee: 1800, children: true });
const oldWay = ((5200 - 1800) * OLD.noChildren.pctOfDifference) / 100;

export default defineStatePage({
  topic: 'alimony',
  slug: 'pennsylvania',
  title: `Pennsylvania Spousal Support Calculator 2026: APL Formula`,
  description: `Pennsylvania spousal support and APL 2026: ${pct(N.obligorNetPct)} of the payer's net minus ${pct(N.obligeeNetPct)} of the other spouse's, or ${pct(W.obligorNetPct)} minus ${pct(W.obligeeNetPct)} with children, for orders since 2019.`,
  intro: 'Pennsylvania has a formula for support between separation and divorce, and none for alimony after the decree.',
  resume: `Pennsylvania computes spousal support, and alimony pendente lite (APL) while a divorce is pending, with Pa.R.Civ.P. 1910.16-4. For orders entered since January 1, 2019, the guideline is ${pct(N.obligorNetPct)} of the obligor's monthly net income minus ${pct(N.obligeeNetPct)} of the obligee's when there are no dependent children, and ${pct(W.obligorNetPct)} minus ${pct(W.obligeeNetPct)} when there are; a negative result means zero. Spousal support is calculated before child support, which is then computed on the obligor's income reduced by it. A spouse netting ${usd(5200)} a month married to one netting ${usd(1800)} would owe ${usd(noKids.monthly)} a month without children and ${usd(kids.monthly)} with children, before any child support. Above ${usd(P.highIncomeCombinedMonthlyNet)} of combined monthly net income the result is only a starting point. Alimony after the divorce decree is a separate claim under 23 Pa.C.S. § 3701, set from statutory factors with no formula, and it is not computed here.`,
  body: (h) => `<h2>Three names for money between spouses</h2>
<p>Pennsylvania separates what other states fold together. <strong>Spousal support</strong> can be claimed from the moment the spouses separate, even without a divorce filing, usually through the county Domestic Relations Section. <strong>Alimony pendente lite</strong> is the same calculation inside a pending divorce, meant to let the dependent spouse litigate on an equal footing. The rules forbid both from running at once (Rule 1910.16-1(c)). <strong>Alimony</strong> proper only comes with the decree, and the guideline does not reach it. The calculator on this page covers the first two.</p>

<h2>The 2019 percentages</h2>
<p>When federal law stopped letting payers deduct alimony for agreements signed after 2018, the Supreme Court of Pennsylvania rewrote the spousal part of the guideline. The older method took ${h.pct(OLD.noChildren.pctOfDifference)} of the difference between the two net incomes, or ${h.pct(OLD.withChildren.pctOfDifferenceAfterChildSupport)} of the difference left after child support. It survives in Part IV of the rule, but only to modify orders entered before 2019. New orders weigh each income separately. On ${h.usd(5200)} and ${h.usd(1800)} without children, the current rule gives ${h.usd(noKids.monthly)}; the old one would have given ${h.usd(oldWay)}. The drop reflects that the payer now carries the tax on that money.</p>

<h2>Children change the order of the steps</h2>
<p>With dependent children, the percentages fall to ${h.pct(W.obligorNetPct)} and ${h.pct(W.obligeeNetPct)}, and the spousal amount comes first: it is subtracted from the obligor's income and added to the obligee's before the child support schedule is read. In our example that leaves ${h.usd(kids.monthly)} of spousal support, and child support is then figured on ${h.usd(5200 - kids.monthly)} against ${h.usd(1800 + kids.monthly)}. If the spouse who has the children is the one owing spousal support, Rule 1910.16-4(e) offsets the two obligations in a five-step calculation. Combined net income above ${h.usd(P.highIncomeCombinedMonthlyNet)} a month sends the case to Rule 1910.16-3.1, where the formula result is reviewed against deviation factors and expense statements. The guideline figure is presumed correct, and a judge who departs from it must say why.</p>`,
  faqs: [
    {
      q: 'What is the difference between spousal support and APL in Pennsylvania?',
      a: 'Spousal support can be requested after separation even if no divorce is filed, and depends on the payer’s duty of support. Alimony pendente lite is requested within a pending Pennsylvania divorce to help the lower-earning spouse pay living and legal costs until the decree. Both use the same Rule 1910.16-4 percentages, and both cannot be in effect at the same time.',
    },
    {
      q: 'Does Pennsylvania have a formula for alimony after divorce?',
      a: 'No. Post-divorce alimony under 23 Pa.C.S. § 3701 is decided from a list of statutory factors, such as the length of the marriage, the incomes and earning capacities, and the standard of living. The Rule 1910.16-4 percentages only govern spousal support and alimony pendente lite before the decree, though some judges look at that history when setting the final award.',
    },
    {
      q: 'Why did Pennsylvania spousal support percentages change for orders after 2018?',
      a: `Because alimony stopped being deductible for the payer and taxable to the recipient under federal law for agreements executed after 2018. Pennsylvania replaced the old ${pct(OLD.noChildren.pctOfDifference)}-of-the-difference method with ${pct(N.obligorNetPct)} of the obligor's net minus ${pct(N.obligeeNetPct)} of the obligee's, which yields smaller amounts. Orders entered before 2019 are still modified with the old method.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'divorce-cost', 'alimony:new-york', 'alimony:virginia'],
});
