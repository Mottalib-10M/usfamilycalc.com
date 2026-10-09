import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('arizona');
const consent = d.otherFees.find((f) => /Summary Consent Decree/.test(f.what))?.amount ?? 0;
const wait = d.waitingPeriod!.days!;
const both = dvCalc('arizona', { response: true });
const rate = 300, hrs = 15;
const ex = dvCalc('arizona', { response: true, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'arizona',
  title: `Arizona Divorce Cost 2026: ${usdx(d.filingFee!)} Maricopa Petition Fee`,
  description: `Arizona divorce cost in 2026: Maricopa County charges ${usdx(d.filingFee!)} to petition, ${usdx(d.responseFee!)} to respond and ${usdx(consent)} for a summary consent decree, decided after ${num(wait)} days.`,
  intro: 'Arizona calls divorce dissolution of marriage, prices it county by county, and gives agreeing spouses a summary consent decree with its own fee.',
  resume: `In Maricopa County, the most populous in Arizona, the Clerk of the Superior Court charges ${usdx(d.filingFee!)} to file a petition for dissolution of marriage, the same with or without children, and ${usdx(d.responseFee!)} for the response or answer. A contested case in which both spouses appear therefore starts at ${usdx(both.official)} in court fees. Spouses who agree on everything can instead submit a summary consent decree, listed at ${usdx(consent)}. Whichever path they take, A.R.S. 25-329 bars any decree, hearing or trial until ${num(wait)} days after the other spouse was served or accepted service. One spouse must have been domiciled in Arizona, or stationed there with the military, for 90 days before filing. Parents with a minor child are ordered to complete a domestic relations education program, and a person who cannot pay can ask the clerk to defer or waive the fees under A.R.S. 12-302.`,
  body: (h) => `<h2>A response fee that nearly matches the filing fee</h2>
<p>Arizona is one of the states where the second spouse pays a substantial amount just to take part. ${d.feeText} A respondent who files nothing avoids the ${h.usdx(d.responseFee!)} but leaves the petitioner free to ask for a default decree. The ${h.ext(d.feeUrl, 'Maricopa County fee list')} also prices a petition for legal separation at the same level as dissolution.</p>
<h2>The summary consent decree</h2>
<p>${d.simplified!.text} Compared with a petition and a response, it saves ${h.usdx(both.official - consent)} in fees alone.</p>
<h2>Ninety days in, sixty days out</h2>
<p>${d.residency!.text} After filing, ${d.waitingPeriod!.text.replace(/^No /, 'no ')} The ${h.num(wait)} days start at service, not at filing, so a respondent who accepts service the day the petition is filed starts the clock immediately. Arizona also offers covenant marriage, and couples in a covenant marriage can divorce only on the narrower grounds listed in A.R.S. 25-903.</p>
<h2>The education program for parents</h2>
<p>${d.parentingClass!.text} Under A.R.S. 25-351, the superior court in each county adopts its own program, and the Arizona Supreme Court sets the minimum standards and approves each county's plan.</p>
<h3>Working the numbers</h3>
<p>Take a Phoenix couple who cannot settle custody. Both file, and each would pay a lawyer; our example prices one side at ${h.num(hrs)} hours and ${h.usd(rate)} an hour, invented figures for illustration that you should replace. The court fees for both sides are ${h.usdx(ex.official)} and that side's estimate reaches ${h.usd(ex.total)}. A spouse with a low income uses the clerk's ${h.ext(d.waiver!.url, 'deferral or waiver application')}. Spousal maintenance follows the Arizona guidelines on the ${h.a('alimony:arizona', 'Arizona alimony page')} and child support the income shares model on the ${h.a('child-support:arizona', 'Arizona child support page')}. Across the Colorado River, ${h.a('divorce-cost:california', 'California')} charges both spouses too.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Maricopa County, Arizona?', a: `${usdx(d.filingFee!)} for a petition for dissolution of marriage, with or without children, according to the Clerk of the Superior Court in Maricopa County. The response or answer costs ${usdx(d.responseFee!)}, and a summary consent decree ${usdx(consent)}. Other Arizona counties publish their own fee lists. A person who cannot pay can ask the clerk to defer or waive the fees.` },
    { q: 'What is the waiting period for divorce in Arizona?', a: `A.R.S. 25-329 bars the court from considering a motion supported by affidavit, holding a hearing or holding a trial on a dissolution until ${num(wait)} days after the date of service of process or acceptance of process. The days run from service, not filing. A summary consent decree is subject to the same waiting period.` },
    { q: 'What is a summary consent decree in Arizona?', a: `It is the route for Arizona spouses who agree on every issue: they file jointly for a decree that records the terms they have already agreed on property, debts and any children, rather than litigating a petition and a response. In Maricopa County it costs ${usdx(consent)}, compared with ${usdx(both.official)} for a petition plus a response. The ${num(wait)}-day wait still applies.` },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:california', 'divorce-cost:colorado', 'child-support:arizona', 'alimony:arizona'],
});
