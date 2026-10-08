import { definePage } from '../../lib/page-types';
import { dvAll, usdx } from '../../lib/kit';

const DV = dvAll();
const fees = DV.filter((d) => d.filingFee != null).map((d) => d.filingFee as number).sort((a, b) => a - b);
const median = fees.length ? fees[Math.floor(fees.length / 2)] : 0;
const simplified = DV.filter((d) => d.simplified?.text && !/^no\b|none|not available|no summary|no simplified/i.test(d.simplified.text));

export default definePage({
  id: 'uncontested-divorce-cost',
  topic: 'divorce-cost',
  kind: 'guide',
  order: 2,
  slug: 'uncontested-divorce-cost',
  nav: 'Uncontested divorce cost',
  card: 'Filing yourselves, with a flat-fee lawyer, or with a mediator',
  title: 'Uncontested Divorce Cost 2026: Court Fees, Forms, Lawyers',
  description: 'Uncontested divorce cost in 2026: the court fees in each state, what filing yourselves involves, and when a flat-fee lawyer or a mediator is worth it.',
  h1: 'How much does an uncontested divorce cost?',
  intro: 'When spouses agree on everything, the bill can shrink to the court’s fees. Here is what that route involves and where the extra costs hide.',
  resume: `An uncontested divorce costs at least the court's filing fee, a median of ${usdx(median)} among the states on this site, plus a response fee in states that charge one; spouses who agree on property, debts, support and parenting and file the court's own forms themselves often pay nothing more. Adding a lawyer for drafting or review, usually at a flat fee for this kind of case, or a mediator to settle the last points, raises the total by the amounts they quote. Hidden costs are few but real: serving the papers if the spouse will not sign an acceptance, a parenting class where children are involved, a qualified domestic relations order to split a retirement plan, and certified copies of the decree. ${simplified.length ? `${simplified.length} states on this site also offer a summary or simplified procedure for the simplest cases.` : ''} Fee waivers are available everywhere for low incomes.`,
  mini: 'divorceFees',
  miniArg: DV.map((d) => [d.name, d.filingFee, d.responseFee]),
  body: (h) => `<h2>What “uncontested” really requires</h2>
<p>A divorce is uncontested when both spouses agree on every issue the court must decide: how to divide property and debts, whether one pays spousal support, and, with children, the parenting plan and child support. Agreement on most issues is not enough; a single open question sends the case down the contested path until it is resolved. The agreement is written as a marital settlement agreement, attached to the petition or filed later, and the judge checks that it is fair and that child support follows the guideline or explains why not.</p>
<h2>Filing it yourselves</h2>
<p>Most state courts publish the forms and instructions for a self-represented divorce, and many run self-help centers that review forms for free. The steps are similar everywhere: file the petition and pay the fee, have the other spouse served or sign an acceptance of service, exchange financial disclosures, file the settlement and the proposed judgment, and wait for any statutory waiting period. Child support must be calculated with the state's worksheet: the ${h.a('child-support', 'child support calculator')} shows the guideline amount the court will look for.</p>
<h2>A flat-fee lawyer</h2>
<p>Many family lawyers offer a flat fee for uncontested cases, covering the drafting of the settlement and the filing. It makes sense when there is a house, a business, a pension or stock options to divide, when one spouse has much more financial knowledge than the other, or when the settlement waives spousal support. One lawyer cannot represent both spouses; the other spouse can hire a second lawyer to review the agreement for a few hours.</p>
<h2>A mediator</h2>
<p>A mediator helps spouses reach the agreement without deciding anything. Mediation is billed by the hour or by the session, often shared between the spouses, and courts in several states provide free or low-cost mediation for parenting issues. Once the mediator writes a memorandum of understanding, a lawyer or the spouses turn it into the settlement filed with the court.</p>
<h2>Simplified and summary procedures</h2>
<p>Some states offer a shorter procedure for the simplest cases, typically a short marriage, no children, little property and no spousal support, sometimes with a joint petition and no hearing. The conditions are strict and differ by state; the state pages quote the statute where one exists.</p>
<h2>The paperwork, in order</h2>
<p>Most uncontested cases follow the same sequence. The filing spouse files the petition with a summons and, where the state requires it, a cover sheet and a confidential information form. The other spouse either signs an acceptance or waiver of service, which costs nothing, or is served by a sheriff or process server. Both spouses then exchange financial disclosures, usually sworn statements of income, expenses, assets and debts, even when they already agree; skipping this step is a common reason a judge sends papers back. The settlement agreement and, with children, a parenting plan and the child support worksheet are signed and filed. Finally the proposed judgment or decree goes to the judge, by mail, at a short hearing or electronically, and becomes final once any waiting period has passed.</p>
<h2>When an uncontested divorce is a bad idea</h2>
<p>Agreement saves money only when it is informed. If one spouse controls the finances, hides accounts or pressures the other to sign quickly, if there is domestic violence, or if a business or a pension needs a professional valuation, the cheapest route can become the most expensive one years later. A settlement is hard to undo once the judgment is entered. In those situations, a consultation with a family lawyer before signing, or a mediator who insists on full disclosure, is money well spent.</p>
<h2>Costs people forget</h2>
<p>Serving papers costs a sheriff's or process server's fee unless the spouse signs an acceptance. Retirement accounts covered by ERISA need a qualified domestic relations order, which the plan must approve. Refinancing a mortgage to remove one spouse's name has its own closing costs. Changing a name on documents after the divorce may require certified copies of the decree, sold by the clerk per page. Finally, tax consequences, such as who claims the children or how a home sale is reported, are worth a session with a tax professional (${h.src('irs504', 'IRS Publication 504')}).</p>
<p>One practical tip: before paying anyone, read the court's self-help pages for your county. They list the exact forms, the local filing fee, whether a hearing is required and how long the clerk usually takes to process an uncontested judgment, which is often the slowest step of all. To compare the official fees and add your own quotes, use the ${h.a('divorce-cost', 'divorce cost calculator')}.</p>`,
  faqs: [
    { q: 'How long does an uncontested divorce take?', a: 'It depends mostly on the state’s waiting period and the court’s calendar. Where no waiting period applies, an uncontested divorce can be final within weeks of filing complete paperwork; where the law imposes one, the decree waits until it ends, sometimes six months. Missing financial disclosures or an incomplete settlement are the usual causes of delay.' },
    { q: 'Do we both need a lawyer for an uncontested divorce?', a: 'No. Spouses can file without lawyers using the court’s forms, and many do. If one spouse hires a lawyer, that lawyer represents only that spouse, and the other may want a separate review of the agreement, especially when there is significant property, a pension or a waiver of spousal support. Court self-help centers explain the forms but give no legal advice.' },
    { q: 'Can you get an uncontested divorce if one spouse won’t sign?', a: 'Not as an uncontested case. If the other spouse is served and does not respond, many states allow a default judgment, which can be just as cheap but follows its own rules and deadlines. If the spouse responds and disagrees, the case becomes contested until the open issues are settled or decided by the judge.' },
    { q: 'Is an online divorce valid?', a: 'Online services only prepare documents; the divorce itself is granted by a state court where the forms are filed. The decree is valid if the forms are correct and filed in the right court, whoever typed them. The court’s own forms are free, so compare what a service charges with the self-help center and the filing fee before paying.' },
    { q: 'Do we need to go to court for an uncontested divorce?', a: 'Sometimes. Some states grant uncontested divorces on the papers or by affidavit without a hearing, others require a short final hearing where one spouse confirms the agreement, and some hold it remotely. The state pages and the court’s self-help instructions say which applies, along with any parenting class required when there are children.' },
  ],
  related: ['divorce-cost', 'child-support', 'alimony', 'how-much-is-child-support'],
  sources: ['irs504'],
  extraSources: DV.filter((d) => d.waiver?.url).slice(0, 2).map((d) => ({ name: `${d.name}: ${d.waiver!.name}`, url: d.waiver!.url })),
});
