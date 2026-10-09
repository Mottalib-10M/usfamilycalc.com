import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('georgia');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const sheriff = fee(/[Ss]heriff/);
const postJ = fee(/[Pp]ost-judgment/);
const wait = d.waitingPeriod!.days!;
const served = dvCalc('georgia', { service: sheriff });
const rate = 250, hrs = 8;
const ex = dvCalc('georgia', { service: sheriff, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'georgia',
  title: `Georgia Divorce Cost 2026: ${usdx(d.filingFee!)} in Fulton, ${num(wait)} Days`,
  description: `Georgia divorce cost in 2026: the Fulton County Superior Court clerk charges ${usdx(d.filingFee!)} to file, the sheriff ${usdx(sheriff)} to serve, and consent cases can end after ${num(wait)} days.`,
  intro: 'In Georgia the superior court of each county sets its costs, and a uniform court rule, not a statute, fixes how soon an uncontested divorce can be granted.',
  resume: `A divorce filed in Fulton County, Georgia's most populous county, costs ${usdx(d.filingFee!)} in court costs according to the Superior Court Clerk's fee table, plus ${usdx(sheriff)} for each copy the sheriff serves. That puts the usual start of a case at ${usdx(served.official + sheriff)} when the sheriff serves the other spouse, or ${usdx(d.filingFee!)} when the spouse signs an acknowledgment of service instead. Other counties publish their own amounts. Timing comes from Uniform Superior Court Rule 24.6: with both spouses' written consent, the judge can grant the divorce 31 days after service or acknowledgment; if the other spouse never answers, 46 days; after service by publication, 61 days. One spouse must have lived in Georgia for six months before filing. A pauper's affidavit filed with the complaint replaces the filing and sheriff fees, and each judicial circuit decides whether parents must attend a seminar.`,
  body: (h) => `<h2>Clerk's costs and the sheriff's fee</h2>
<p>The ${h.ext(d.feeUrl, 'Fulton County fee table')} lists divorce at ${h.usdx(d.filingFee!)}, a little above its general civil action line, and shows the sheriff's service separately at ${h.usdx(sheriff)} per copy. Most Georgia couples who agree avoid the sheriff: the defendant signs an acknowledgment of service before a notary, and the case starts for the clerk's fee alone. Filings after the decree, such as a petition to modify, carry a post-judgment charge of ${h.usdx(postJ)} in Fulton.</p>
<h2>The 31, 46 and 61 day marks</h2>
<p>Georgia's waiting times sit in the Uniform Superior Court Rules, the rules every superior court follows. ${d.waitingPeriod!.text} The calculator shows ${h.num(wait)} days because that is the earliest date for a divorce both spouses want. A defendant who is served and does nothing pushes the earliest date further out, and publication, used when the spouse cannot be found, pushes it further still. Contested cases have no fixed end and follow the court's calendar.</p>
<p>${d.residency!.text} The judicial branch's self-help forms, with and without minor children, are free and walk through residency, venue and service in plain language.</p>
<h2>Seminars circuit by circuit</h2>
<p>${d.parentingClass!.text} Where a circuit requires it, the seminar is limited to four hours by the rule, the provider may charge each parent a fee, and the rule requires a waiver procedure for parents who cannot pay. A parent who lives outside the county can be excused.</p>
<h3>A Fulton example</h3>
<p>Suppose an Atlanta spouse files, has the sheriff serve the other spouse, and pays a lawyer for ${h.num(hrs)} hours at ${h.usd(rate)} an hour; the hours and rate are hypothetical, so use your own in the calculator. The county's share is ${h.usdx(ex.official)}, sheriff included ${h.usdx(ex.official + sheriff)}, and the estimate ${h.usd(ex.total)}. A filer short of money attaches a ${h.ext(d.waiver!.url, 'pauper’s affidavit')} instead. Child support is worked out on the state worksheet described on the ${h.a('child-support:georgia', 'Georgia child support page')}. Neighbors ${h.a('divorce-cost:florida', 'Florida')} and ${h.a('divorce-cost:north-carolina', 'North Carolina')} set their timing by statute.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Fulton County, Georgia?', a: `The Fulton County Superior Court Clerk lists divorce court costs at ${usdx(d.filingFee!)}. If the sheriff serves the other spouse, add ${usdx(sheriff)} per copy served. A spouse who signs an acknowledgment of service saves the sheriff fee. Other Georgia counties set their own amounts, and a filer who cannot pay may submit a pauper's affidavit with the complaint.` },
    { q: 'What is the fastest a Georgia divorce can be granted?', a: `Thirty-one days after service or acknowledgment of service, when both spouses consent in writing to a hearing, under Uniform Superior Court Rule 24.6(A). If the defendant is served but never answers, the earliest date is 46 days after service, and after service by publication it is 61 days after the first publication. The judge's calendar can make it later.` },
    { q: 'Do Georgia courts require a parenting seminar in a divorce?', a: 'It depends on the judicial circuit. Uniform Superior Court Rule 24.8 lets each circuit set up a seminar of no more than four hours on how divorce affects children and lets the judges order parties in domestic relations cases to attend. The program may charge a fee but must offer a waiver for indigent parties, and the judge can excuse a parent for good cause.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:florida', 'divorce-cost:north-carolina', 'child-support:georgia'],
});
