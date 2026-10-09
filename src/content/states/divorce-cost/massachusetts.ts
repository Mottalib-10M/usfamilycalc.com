import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('massachusetts');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const nisiMotion = fee(/nisi/);
const modify = fee(/modification/);
const surcharge = Number(/plus \$(\d+) surcharge/.exec(d.feeText)?.[1] ?? 0);
const days = d.waitingPeriod!.days!;
const rate = 350, hrs = 6;
const ex = dvCalc('massachusetts', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'massachusetts',
  title: `Massachusetts Divorce Cost 2026: ${usdx(d.filingFee!)} and the Nisi Period`,
  description: `Massachusetts divorce cost in 2026: ${usdx(d.filingFee!)} for a divorce complaint or joint petition in Probate and Family Court, then ${num(days)} days from approval to final judgment.`,
  intro: 'Massachusetts files every divorce in the Probate and Family Court at one statewide price, then holds the judgment in a nisi period before it becomes absolute.',
  resume: `A Massachusetts divorce costs ${usdx(d.filingFee!)} to file in the Probate and Family Court, whether it starts as a complaint by one spouse or a joint petition by both: the ${usdx(d.filingFee! - surcharge)} filing fee plus a ${usdx(surcharge)} surcharge, the same in every county division. The defendant pays nothing to answer. Timing follows chapter 208 of the General Laws. On a joint petition under section 1A, judgment nisi enters 30 days after the court approves the separation agreement and becomes absolute 90 days later, ${num(days)} days in all. A contested no-fault complaint under section 1B cannot be heard until six months after filing, and then the same nisi period applies. During the nisi period the spouses are still married; a motion filed in that window costs ${usdx(nisiMotion)}. Residence rules depend on where the cause arose, and an Affidavit of Indigency asks the court to waive the fees.`,
  body: (h) => `<h2>One court, one fee, two ways in</h2>
<p>Every Massachusetts divorce goes to the Probate and Family Court, which has a division in each county. The ${h.ext(d.feeUrl, 'court’s filing fee list')} prices a divorce complaint and a joint petition identically at ${h.usdx(d.filingFee!)}, which means the joint route saves no fee; its value is in skipping the summons and the answer. After the divorce, a complaint to modify child support, custody or parenting time costs ${h.usdx(modify)}.</p>
<h2>Judgment nisi: married a little longer</h2>
<p>${d.waitingPeriod!.text} "Nisi" means "unless": the judgment becomes final unless something happens to stop it, such as the spouses reconciling. Through those ${h.num(days)} days the spouses are still married, and a party who needs the court to act, for example on a change in circumstances, files a motion during the nisi period at ${h.usdx(nisiMotion)}. Because the clock starts only when the judge approves the agreement, the date of filing matters less than the date of the hearing.</p>
<h3>Section 1A or section 1B</h3>
<p>${d.simplified!.text} Section 1B is for a spouse acting alone on irretrievable breakdown, and its six-month delay before any hearing makes it slower even when the other spouse eventually agrees.</p>
<h2>Where the cause arose</h2>
<p>${d.residency!.text} This is a different test from the fixed months most states use: a couple whose marriage broke down while living in Massachusetts can file without waiting, while a newcomer whose marriage ended elsewhere waits a year.</p>
<p>A party who cannot pay files an ${d.waiver!.name}, the procedure of chapter 261, sections 27A to 27G, for waiving or reducing court fees and costs.</p>
<h3>A sample budget</h3>
<p>Two spouses with a signed separation agreement file a joint petition, and one pays a lawyer ${h.usd(rate)} an hour for ${h.num(hrs)} hours to review it, numbers that only illustrate the method. The court's share stays ${h.usdx(ex.official)} and the estimate ${h.usd(ex.total)}. Alimony in Massachusetts is covered on the ${h.a('alimony:massachusetts', 'Massachusetts alimony page')}, and child support follows the guidelines on the ${h.a('child-support:massachusetts', 'Massachusetts child support page')}. Next door, ${h.a('divorce-cost:new-york', 'New York')} collects its fees in stages.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Massachusetts?', a: `${usdx(d.filingFee!)} in the Probate and Family Court: a ${usdx(d.filingFee! - surcharge)} filing fee and a ${usdx(surcharge)} surcharge, the same for a divorce complaint and a joint petition. There is no fee for the defendant's answer. Later motions during the nisi period cost ${usdx(nisiMotion)}. A party who cannot afford the fees can file an Affidavit of Indigency under chapter 261 of the General Laws.` },
    { q: 'How long is the nisi period in a Massachusetts divorce?', a: `On a joint petition, judgment nisi enters 30 days after the judge approves the separation agreement, and the divorce becomes absolute 90 days after that, so ${num(days)} days from approval. On a contested no-fault complaint, the court cannot hear the case until six months after filing, then the same 90-day nisi period applies. The spouses remain married until the judgment becomes absolute.` },
    { q: 'Do I need to live in Massachusetts for a year before filing for divorce?', a: 'Only if the cause of the divorce arose outside Massachusetts. Under chapter 208, section 5, a plaintiff whose cause arose in the Commonwealth needs only to live there when filing, unless the plaintiff moved to Massachusetts to obtain the divorce. If the cause arose elsewhere, the plaintiff must have lived in Massachusetts for one year before filing.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:new-york', 'child-support:massachusetts', 'alimony:massachusetts'],
});
