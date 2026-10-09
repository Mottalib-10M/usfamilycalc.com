import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('michigan');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const custody = fee(/^Custody/);
const supportOnly = fee(/^Child support fee/);
const motion = fee(/^Motion/);
const wait = d.waitingPeriod!.days!;
const withKids = d.filingFee! + custody;
const rate = 300, hrs = 10;
const ex = dvCalc('michigan', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'michigan',
  title: `Michigan Divorce Cost 2026: ${usdx(d.filingFee!)}, or ${usdx(withKids)} With Children`,
  description: `Michigan divorce cost in 2026: ${usdx(d.filingFee!)} to file in circuit court, ${usdx(withKids)} when custody is decided, ${num(wait)} days minimum, and six months when there are minor children.`,
  intro: 'Michigan sets circuit court fees by statute, so a divorce costs the same to file in Detroit and in the Upper Peninsula, but children change both the price and the calendar.',
  resume: `A Michigan divorce costs ${usdx(d.filingFee!)} to file in any circuit court: the ${usdx(d.filingFee! - (Number(/plus the \$(\d+) electronic/.exec(d.feeText)?.[1] ?? 0)))} civil filing fee of MCL 600.2529 plus the electronic filing system fee. When the court must decide custody or parenting time of a minor child, the filer also pays ${usdx(custody)}, which brings the bill to ${usdx(withKids)}; if only child support is at issue the add-on is ${usdx(supportOnly)}. The defendant pays no fee to answer, and each motion later costs ${usdx(motion)}. Time is set by MCL 552.9f: no testimony for ${num(wait)} days after filing, and six months when there are dependent minor children, a delay the judge can shorten only for unusual hardship or compelling necessity. One spouse must have lived in Michigan for 180 days and in the county for 10 days before filing. A Fee Waiver Request on SCAO form MC 20 suspends the fees for low-income filers.`,
  body: (h) => `<h2>Fees fixed in Lansing</h2>
<p>Unlike states where each county clerk prices a divorce, Michigan writes its circuit court fees into the Revised Judicature Act, and the State Court Administrative Office publishes them in one ${h.ext(d.feeUrl, 'circuit court fee table')}. ${d.feeText}</p>
<p>The children's fees are what make Michigan unusual. They are not charged because there are children, but because the court is asked to decide something about them: custody or parenting time triggers ${h.usdx(custody)}, support alone ${h.usdx(supportOnly)}. A couple with grown children pays the base ${h.usdx(d.filingFee!)}. The fee table sends these amounts to the Friend of the Court Fund, which pays for the county office that handles custody and support orders.</p>
<h2>Sixty days, or six months</h2>
<p>${d.waitingPeriod!.text} The ${h.num(wait)}-day floor counts from filing, not from service. With minor children, the default is six months, and shortening it takes a petition and a proper showing of unusual hardship or compelling necessity. For budgeting, the longer window matters only if a lawyer is billing during it, for example on temporary custody or support motions at ${h.usdx(motion)} each.</p>
<p>${d.residency!.text}</p>
<h2>No short form, but a single packet</h2>
<p>${d.simplified!.text} Agreed couples still file a complaint, serve it or obtain an acknowledgment, wait, and present a judgment of divorce. ${d.parentingClass!.text}</p>
<h3>Two Michigan budgets</h3>
<p>A couple without minor children who hire one lawyer at ${h.usd(rate)} an hour for ${h.num(hrs)} hours (replace these sample numbers with your quote) pay ${h.usdx(ex.official)} to the court and about ${h.usd(ex.total)} in all. The same couple with a young child pays ${h.usdx(withKids)} to file and waits the longer period. ${h.ext(d.waiver!.url, d.waiver!.name)} covers both the filing fee and the electronic filing fee when granted. Michigan child support uses its own formula, shown on the ${h.a('child-support:michigan', 'Michigan child support page')}; across the border, ${h.a('divorce-cost:ohio', 'Ohio')} prices divorce by county deposit.</p>`,
  faqs: [
    { q: 'How much is the filing fee for divorce in Michigan?', a: `${usdx(d.filingFee!)} in every circuit court, made of the civil filing fee and the electronic filing system fee. If custody or parenting time of a minor child is to be decided, add ${usdx(custody)}, for ${usdx(withKids)} in total; if only child support is at issue, add ${usdx(supportOnly)}. The defendant does not pay a fee to answer. Fees can be waived with SCAO form MC 20.` },
    { q: 'How long does a Michigan divorce take with children?', a: `Under MCL 552.9f, no proofs or testimony can be taken until six months after the complaint is filed when there are dependent minor children, compared with ${num(wait)} days without children. The judge can shorten the six months to no less than ${num(wait)} days in cases of unusual hardship or compelling necessity, on a petition showing the reason.` },
    { q: 'How long must you live in Michigan before filing for divorce?', a: 'MCL 552.9 requires that the plaintiff or the defendant has lived in Michigan for 180 days immediately before the complaint is filed, and in the county of filing for 10 days, with some exceptions in subsection (2). A spouse who just moved therefore waits before filing, or files in the county where the other spouse has lived long enough.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:ohio', 'child-support:michigan'],
});
