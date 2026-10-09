import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('new-jersey');
const workshop = d.otherFees.find((f) => /workshop/.test(f.what))?.amount ?? 0;
const both = dvCalc('new-jersey', { response: true });
const rate = 375, hrs = 10;
const ex = dvCalc('new-jersey', { response: true, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'new-jersey',
  title: `New Jersey Divorce Cost 2026: ${usdx(d.filingFee!)} Complaint, ${usdx(d.responseFee!)} Answer`,
  description: `New Jersey divorce cost in 2026: ${usdx(d.filingFee!)} for the complaint, ${usdx(d.responseFee!)} for the defendant's first filing and ${usdx(workshop)} for the parenting workshop when there are children.`,
  intro: 'New Jersey runs divorce through the Family Division of the Superior Court with one statewide fee list, and charges the defendant as well as the plaintiff.',
  resume: `A New Jersey divorce costs ${usdx(d.filingFee!)} to file the complaint in the Family Division of the Superior Court, the same in every county. The defendant pays ${usdx(d.responseFee!)} for a first filing such as an answer or counterclaim, so a case in which both spouses take part carries ${usdx(both.official)} in fees. When the couple has minor children, an extra ${usdx(workshop)} pays for the parenting workshop the parties must attend, unless a restraining order exists between them or a signed property settlement agreement is filed with the first pleading. There is no waiting period after filing, but the grounds carry their own clock: irreconcilable differences must have lasted six months, and separation as a ground requires eighteen months apart. For a no-fault divorce one spouse must have lived in New Jersey for twelve consecutive months. Low-income filers request a fee waiver under Court Rule 1:5-6.`,
  body: (h) => `<h2>A fee for each side</h2>
<p>The ${h.ext(d.feeUrl, 'Judiciary’s divorce help page')} lists ${h.usdx(d.filingFee!)} for the complaint and ${h.usdx(d.responseFee!)} for the defendant. That second fee is easy to miss: in many states answering is free, but in New Jersey a defendant who files anything, even an answer that agrees with the complaint, pays it. A defendant who files nothing lets the case proceed by default, which is cheaper and gives up the chance to shape the judgment.</p>
<h2>The parenting workshop and its two exits</h2>
<p>${d.parentingClass!.text} The second exception rewards early settlement: spouses who have already signed a property settlement agreement and file it with the complaint or answer skip both the workshop and its ${h.usdx(workshop)}. A family with children and no agreement yet, by contrast, pays ${h.usdx(both.official + workshop)} in court fees once both sides have filed.</p>
<h2>Grounds that set the timeline</h2>
<p>${d.waitingPeriod!.text} The six months of irreconcilable differences are measured before the complaint, and the plaintiff states them in the complaint. It needs no proof of fault and no period living apart, which keeps a cooperative case short.</p>
<p>${d.residency!.text} The twelve months are counted back from the filing date.</p>
<h2>No short form</h2>
<p>${d.simplified!.text} Agreed cases still go through a complaint, service or an acknowledgment of service, and a judgment, so the paperwork is the same as in a disputed case even when the fees stop at the two filings.</p>
<h3>Example</h3>
<p>Imagine a Newark couple without children. Both file, and the plaintiff pays a lawyer ${h.usd(rate)} an hour for ${h.num(hrs)} hours; that rate and those hours are only for illustration, so use your quote above. The court collects ${h.usdx(ex.official)} and the total is ${h.usd(ex.total)}. A spouse with little income files the ${h.ext(d.waiver!.url, 'fee waiver request')}. New Jersey child support uses the guideline on the ${h.a('child-support:new-jersey', 'New Jersey child support page')}; ${h.a('divorce-cost:new-york', 'New York')} across the Hudson charges in stages instead.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in New Jersey?', a: `${usdx(d.filingFee!)} for the complaint for divorce in the Family Division, in any county. The defendant pays ${usdx(d.responseFee!)} for a first filing, and parents of minor children pay ${usdx(workshop)} for the parenting workshop unless an exception applies. Fees for motions, service and copies are separate. A party who cannot afford the fees can ask for a waiver under Court Rule 1:5-6.` },
    { q: 'Does the defendant pay a fee in a New Jersey divorce?', a: `Yes. The New Jersey Judiciary lists a defendant's filing fee of ${usdx(d.responseFee!)}, due with the first document the defendant files, such as an answer or a counterclaim. A defendant who does not file anything does not pay, but the case can then go forward by default. A defendant who qualifies for a fee waiver can file without paying.` },
    { q: 'Can a New Jersey parent skip the parenting workshop?', a: `Yes, in two cases set out by the Judiciary: when a temporary or final restraining order exists between the parties, or when a signed property settlement agreement is filed with the complaint, answer or other first filing. Otherwise parties with minor children pay the ${usdx(workshop)} fee and attend the parenting program, which explains how divorce affects children.` },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:new-york', 'divorce-cost:pennsylvania', 'child-support:new-jersey'],
});
