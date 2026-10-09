import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('north-carolina');
const absolute = Number(/plus the \$(\d+) absolute-divorce/.exec(d.feeText)?.[1] ?? 0); // G.S. 7A-305(a2), as written in the fee text
const civil = d.filingFee! - absolute;
const rate = 275, hrs = 4;
const ex = dvCalc('north-carolina', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'north-carolina',
  title: `North Carolina Divorce Cost 2026: ${usdx(d.filingFee!)} in Any County`,
  description: `North Carolina divorce cost in 2026: ${usdx(d.filingFee!)} in district court costs in every county, after one year of living separate and apart and six months of residence.`,
  intro: 'North Carolina grants an absolute divorce on one ground only, a year of separation, and charges the same district court costs from Murphy to Manteo.',
  resume: `Filing a complaint for absolute divorce in North Carolina costs ${usdx(d.filingFee!)} in any county: the ordinary district court civil costs under G.S. 7A-305, plus a separate cost the General Assembly attached to every action for absolute divorce. Because the amounts are set by statute rather than by a county clerk, the figure does not change between Mecklenburg and a mountain county. What North Carolina asks for instead is time. The spouses must have lived separate and apart for one year before the complaint is filed, and one of them must have lived in the state for six months; once those conditions are met there is no further waiting period. Equitable distribution of property is a separate claim that must be asserted before the divorce judgment, or it is destroyed (G.S. 50-11(e)). A Petition to Proceed as an Indigent asks the clerk to excuse the costs.`,
  body: (h) => `<h2>How the ${h.usdx(d.filingFee!)} is built</h2>
<p>${d.feeText} The divorce-specific part is collected only in actions for absolute divorce, so a separate complaint for custody or child support filed on its own is charged the civil costs without it. ${h.ext(d.feeUrl, 'The statute')} applies in every district court, which is why the calculator shows a statewide figure rather than a county one. Sheriff's service on the other spouse is a separate charge.</p>
<h2>The year that comes first</h2>
<p>${d.waitingPeriod!.text} The year is counted before filing, not after. A complaint filed before the year is complete does not meet G.S. 50-6, and filing again later means paying the costs again. Keeping a record of the date one spouse moved out is the cheapest protection.</p>
<p>${d.residency!.text} The complaint has to state the residency and the date of separation under oath.</p>
<h2>Claims that must not be left behind</h2>
<p>${d.simplified!.text} The absolute divorce decides only the marital status. Under ${h.ext('https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_50/GS_50-11.html', 'G.S. 50-11')}, an absolute divorce destroys the right to equitable distribution unless it was asserted before the judgment, and protects a claim for alimony or postseparation support only if it is pending at the time of the divorce. That is the costly mistake in North Carolina: a cheap ${h.usdx(d.filingFee!)} divorce granted before a spouse has asserted a property claim. Custody and child support are not cut off by the divorce.</p>
<h3>An example</h3>
<p>Take spouses separated for more than a year, with no property or support disputes. One files, the other accepts service, and a lawyer spends ${h.num(hrs)} hours at ${h.usd(rate)} to review the complaint; both are placeholders for your own quote. The court's share is ${h.usdx(ex.official)} (${h.usdx(civil)} of civil costs and ${h.usdx(absolute)} for the divorce), and the total ${h.usd(ex.total)}. A filer who qualifies can submit the ${h.ext(d.waiver!.url, d.waiver!.name)}. Child support follows the income shares worksheets on the ${h.a('child-support:north-carolina', 'North Carolina child support page')}; neighboring ${h.a('divorce-cost:virginia', 'Virginia')} also requires separation but shortens it in some cases.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in North Carolina?', a: `${usdx(d.filingFee!)} in every county. That is the district court civil costs of G.S. 7A-305 plus the cost added to every action for absolute divorce by G.S. 7A-305(a2). Service by the sheriff is extra. A filer who cannot pay can ask the clerk to proceed as an indigent, and lawyer or mediator fees are separate from the court costs.` },
    { q: 'Do you have to be separated for a year to divorce in North Carolina?', a: 'Yes. Under G.S. 50-6, the spouses must have lived separate and apart for one year before the complaint for absolute divorce is filed, and either spouse must have lived in North Carolina for six months. The year is counted before filing. Once it is complete and the complaint is filed, North Carolina adds no further waiting period before the judgment.' },
    { q: 'Should property claims be filed before a North Carolina divorce?', a: 'Yes. Yes. G.S. 50-11(e) says an absolute divorce destroys the right to equitable distribution unless it was asserted before the judgment, with a narrow exception for a defendant served by publication who did not appear. Under G.S. 50-11(c), the divorce does not affect a claim for alimony or postseparation support that is pending when it is granted. Custody and child support remain open.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:virginia', 'divorce-cost:georgia', 'child-support:north-carolina'],
});
