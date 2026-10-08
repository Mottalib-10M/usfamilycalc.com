import { defineStatePage } from '../../../lib/page-types';
import { al, alCalc, usd, pct, num } from '../../../lib/kit';

const d = al('virginia');
const P = d.params;
const W = P.withChildren, N = P.withoutChildren;
const lim = P.combinedMonthlyGrossMax;
const kids = alCalc('virginia', { payer: 6400, payee: 1900, years: 12, children: true });
const noKids = alCalc('virginia', { payer: 6400, payee: 1900, years: 12 });
const above = alCalc('virginia', { payer: 8800, payee: 2600, years: 12 });
const reserveMonths = (12 * 12 * P.reservationPresumptionPctOfMarriage) / 100;

export default defineStatePage({
  topic: 'alimony',
  slug: 'virginia',
  title: `Virginia Spousal Support Calculator 2026: Pendente Lite`,
  description: `Virginia temporary spousal support 2026: ${pct(W.payorGrossPct)} of the payer's gross minus ${pct(W.payeeGrossPct)} of the payee's with children, ${pct(N.payorGrossPct)} minus ${pct(N.payeeGrossPct)} without, up to ${usd(lim)} combined.`,
  intro: 'Virginia writes a formula into its Code for support while the case is pending, and only there.',
  resume: `Virginia presumes an amount of pendente lite spousal support, the support paid while the case is pending, under Code § 16.1-278.17:1 in juvenile and domestic relations district court and § 20-103 in circuit court. With minor children in common, it is ${pct(W.payorGrossPct)} of the payer's monthly gross income minus ${pct(W.payeeGrossPct)} of the payee's; without them, ${pct(N.payorGrossPct)} minus ${pct(N.payeeGrossPct)}. The formula applies only when combined monthly gross income is ${usd(lim)} or less. A payer with ${usd(6400)} a month and a payee with ${usd(1900)} gives ${usd(kids.monthly)} with children and ${usd(noKids.monthly)} without, and spousal support is fixed before child support. Final spousal support after the divorce has no formula: § 20-107.1 lists thirteen factors and lets the court order support for a defined or open-ended duration, a lump sum, or reserve the right to ask later, a reservation presumed to last ${pct(P.reservationPresumptionPctOfMarriage)} of the time between marriage and separation.`,
  body: (h) => `<h2>Percentages that changed in 2020</h2>
<p>The pendente lite formula entered the Code in 2007 (chapter 909). The 2020 session (chapter 651) rewrote the percentages, the first change since the federal alimony deduction ended for new agreements, and the current Code reads ${h.pct(W.payorGrossPct)}/${h.pct(W.payeeGrossPct)} and ${h.pct(N.payorGrossPct)}/${h.pct(N.payeeGrossPct)}. Older guides and calculators still quote the previous figures; they overstate the result. Both incomes are gross, defined as in the child support statute, § 20-108.2.</p>

<h2>The ${h.usd(lim)} line</h2>
<p>Virginia limits the presumption to households with combined monthly gross income of ${h.usd(lim)} or less. Above it, the statute simply says the formula does not apply, and the judge sets temporary support from the evidence of needs and means. Our calculator then shows ${h.usd(above.monthly)}, as it does for a payer at ${h.usd(8800)} with a spouse at ${h.usd(2600)}, combined ${h.usd(8800 + 2600)}: not because nothing is owed, but because there is no presumptive figure to show. The formula result is still listed in the steps, for reference only. Below the line, the court may deviate for good cause, including the parties' current finances or tax effects.</p>

<h2>Children, then the final decree</h2>
<p>When the spouses have minor children together, the court sets pendente lite spousal support first and child support second, using incomes adjusted by the spousal amount. In our example the payee would receive ${h.usd(kids.monthly)} of spousal support and then child support computed on the adjusted figures. None of this binds the final hearing: § 20-103(J) says a pendente lite order has no presumptive effect on the underlying case.</p>
<p>At the divorce, adultery matters more than in most states. Under § 20-107.1(B), a spouse against whom adultery is proven cannot receive permanent support unless the court finds, by clear and convincing evidence, that denial would be a manifest injustice. If the court reserves the right to future support instead of ordering it now, the reservation is presumed to last ${h.pct(P.reservationPresumptionPctOfMarriage)} of the time from marriage to separation, ${h.num(reserveMonths)} months for a twelve-year marriage, and that period cannot later be modified.</p>`,
  faqs: [
    {
      q: 'What is the Virginia pendente lite spousal support formula?',
      a: `With minor children in common, ${pct(W.payorGrossPct)} of the payer's monthly gross income minus ${pct(W.payeeGrossPct)} of the payee's; without children, ${pct(N.payorGrossPct)} minus ${pct(N.payeeGrossPct)}. Virginia applies it only when combined monthly gross income is ${usd(lim)} or less, and the court may deviate for good cause. It governs support during the case, not the final award.`,
    },
    {
      q: 'Does adultery bar spousal support in Virginia?',
      a: 'It generally bars permanent support for the spouse who committed it. Virginia Code § 20-107.1(B) says no permanent maintenance goes to a spouse against whom adultery is established as a ground for divorce, unless the court finds by clear and convincing evidence that denying support would be a manifest injustice, considering the degrees of fault and the economic circumstances of both parties.',
    },
    {
      q: 'What does reserving spousal support mean in Virginia?',
      a: `The Virginia court can decline to award support now but keep a party's right to ask for it later. The reservation is presumed to last ${pct(P.reservationPresumptionPctOfMarriage)} of the time between the date of marriage and the date of separation, cannot be modified once granted, and for orders since July 1, 2020 generally requires proof of a material change in circumstances to be used.`,
    },
  ],
  related: ['alimony', 'how-is-alimony-calculated', 'child-support:virginia', 'alimony:pennsylvania', 'alimony:new-mexico'],
});
