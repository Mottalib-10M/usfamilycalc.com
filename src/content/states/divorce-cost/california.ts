import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('california');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const joint = fee(/^Joint petition for dissolution/);
const summary = fee(/summary dissolution/);
const rfo = fee(/^Motion or order to show cause/);
const custodyExtra = fee(/custody or visitation/);
const both = dvCalc('california', { response: true });
const rate = 350, hrs = 12;
const flat = dvCalc('california', { response: true, rate, hours: hrs });
const months = Math.round((d.waitingPeriod?.days ?? 0) / 30.4);

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'california',
  title: `California Divorce Cost 2026: ${usdx(d.filingFee!)} First Paper Fee`,
  description: `California divorce fees in 2026: ${usdx(d.filingFee!)} for the petition, ${usdx(d.responseFee!)} for the response, ${usdx(joint)} for a joint petition, and a ${num(months)}-month wait before the judgment is final.`,
  intro: 'One statewide fee schedule applies in every superior court, and the spouse who responds pays the same first paper fee as the one who files.',
  resume: `A California divorce costs ${usdx(d.filingFee!)} to file, in every county, because the Judicial Council's statewide civil fee schedule sets the first paper fee for a petition for dissolution, legal separation or nullity under Government Code § 70670. The other spouse pays ${usdx(d.responseFee!)} too when filing a response, so a case in which both spouses appear carries ${usdx(both.official)} of court fees before any motion. Spouses who agree can file a single joint petition instead: it costs ${usdx(joint)} and covers both of them, which is the same money in one payment. Couples married a short time with no children and few assets can use summary dissolution for one ${usdx(summary)} fee. Anyone who cannot pay asks the court to waive fees on form FW-001. The divorce cannot become final until ${num(months)} months after service, whatever the route.`,
  body: (h) => `<h2>Two first papers, one price each</h2>
<p>California charges by document, not by case. The petitioner's first filing and the respondent's first filing are each a "first paper" and each carries the same ${h.usdx(d.filingFee!)}, which is why the response fee is not a token amount here as it is in many states. A respondent who never files anything and lets the case go by default pays nothing, but then has no say in the judgment. ${h.ext(d.feeUrl, 'The statewide schedule effective January 1, 2026')} lists every family law charge; the ones people meet most are ${h.usdx(rfo)} for a request for order (a motion for temporary support, custody or fees) and ${h.usdx(custodyExtra)} more when the motion asks to change a custody or visitation order.</p>
<p>Since the joint petition arrived in Family Code § 2342.5, agreeing spouses can file together for ${h.usdx(joint)}. That is not a discount over petition plus response (${h.usdx(both.official)}); the gain is one filing, no summons to serve and no default to manage.</p>
<h2>Summary dissolution: the short track</h2>
<p>Family Code § 2400 keeps a separate procedure for small, short marriages. Its limits are strict and all must be met: no children, a marriage of five years or less, no real estate beyond a qualifying lease, debts other than car loans of no more than $4,000, and community and separate property under the dollar ceilings written in the statute. Both spouses sign one joint petition and pay a single ${h.usdx(summary)}. Because nothing is contested, the case moves on paper and the only court charge is that one fee.</p>
<h2>Residence and the six-month clock</h2>
<p>${d.residency!.text} The clock that matters for cost is § 2339: the judgment cannot end the marriage until ${h.num(months)} months after the respondent was served or appeared. Paperwork, including the judgment itself, can be filed earlier; the status simply waits. Nothing in that delay is billed by the court.</p>
<h2>A worked budget</h2>
<p>Take spouses who each file a first paper and share one lawyer's review of their settlement. Suppose the lawyer quotes ${h.usd(rate)} an hour and ${h.num(hrs)} hours; both numbers are placeholders, so put your own quote in the calculator above. The court's part stays ${h.usdx(flat.official)} and the total comes to ${h.usd(flat.total)}. A request for order on temporary custody would add ${h.usdx(rfo)}. If the household income is low, ${h.ext(d.waiver!.url, d.waiver!.name)} can remove every one of those court charges. California guideline support has its own formula, covered on the ${h.a('child-support:california', 'California child support page')}, and temporary spousal support is on the ${h.a('alimony:california', 'California alimony page')}.</p>`,
  faqs: [
    { q: 'Does the respondent pay a fee in a California divorce?', a: `Yes. The respondent's first filing, usually the Response, is a first paper and costs ${usdx(d.responseFee!)}, the same as the petition, under the statewide schedule. A respondent who qualifies can ask for a fee waiver on form FW-001. A respondent who files nothing pays no fee, but the petitioner can then ask for a default judgment on the terms of the petition.` },
    { q: 'How much is a joint petition for divorce in California?', a: `A joint petition for dissolution costs ${usdx(joint)} under Family Code § 2342.5(h), and that single fee covers both spouses. It equals what a petition and a response would cost separately (${usdx(both.official)}). The advantage is procedural: one filing, no service of a summons, and the spouses come into court already in agreement. Summary dissolution, a different procedure, costs ${usdx(summary)}.` },
    { q: 'Why does a California divorce take at least six months?', a: `Family Code § 2339 says the judgment cannot end the marriage until six months after the respondent was served with the summons and petition or appeared in the case, whichever came first. The parties can finish their agreement and get the judgment signed earlier, but the date the marriage ends is pushed to the end of that period. The court charges nothing extra for the wait.` },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:arizona', 'child-support:california', 'alimony:california'],
});
