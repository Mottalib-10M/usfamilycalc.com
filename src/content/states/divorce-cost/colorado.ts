import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('colorado');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const postDecree = fee(/^Motion to modify/);
const apr = fee(/allocation of parental/);
const wait = d.waitingPeriod!.days!;
const both = dvCalc('colorado', { response: true });
const rate = 300, hrs = 5;
const ex = dvCalc('colorado', { response: true, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'colorado',
  title: `Colorado Divorce Cost 2026: ${usdx(d.filingFee!)} Petitioner, ${usdx(d.responseFee!)} Respondent`,
  description: `Colorado divorce cost in 2026: a ${usdx(d.filingFee!)} docket fee for the petitioner and ${usdx(d.responseFee!)} for the respondent in every county, with a ${num(wait)}-day wait before the decree.`,
  intro: 'Colorado sets divorce docket fees by statute for both spouses and uses the same 91-day figure twice: to qualify, and to finish.',
  resume: `A Colorado divorce, called dissolution of marriage, costs the petitioner a ${usdx(d.filingFee!)} docket fee and the respondent ${usdx(d.responseFee!)}, in every district court, because both amounts are written into C.R.S. 13-32-101. A case in which both the petitioner and the respondent file and pay comes to ${usdx(both.official)} in docket fees. The number 91 governs the calendar twice. One spouse must have been domiciled in Colorado for 91 days before the case starts, and the decree can be entered only when ${num(wait)} days or more have passed since the court acquired jurisdiction over the respondent, by service, by joining as co-petitioner or by appearing. Couples with no minor children, or represented couples with a separation agreement covering their children, can ask for a decree on affidavit without a hearing when nothing is disputed. Courts may order parents into a parenting education program, and post-decree motions carry their own fee.`,
  body: (h) => `<h2>Both sides pay a docket fee</h2>
<p>${d.feeText} The figures appear in the ${h.ext(d.feeUrl, 'statute')} and in the Judicial Branch fee chart, so Denver, El Paso and a rural district charge the same. Unlike states where answering is free, the respondent's ${h.usdx(d.responseFee!)} is due with the response.</p>
<p>After the decree, the fee schedule keeps going: a motion to modify, amend or alter a decree or order filed more than 60 days after the decree costs ${h.usdx(postDecree)}, and a stand-alone petition for allocation of parental responsibilities costs ${h.usdx(apr)}.</p>
<h2>The 91-day rules</h2>
<p>${d.residency!.text} ${d.waitingPeriod!.text} When spouses file as co-petitioners, the court has jurisdiction over both of them on the day of filing, so the ${h.num(wait)} days start immediately. When one spouse files and serves the other weeks later, the count starts at service.</p>
<h2>Decree on affidavit</h2>
<p>${d.simplified!.text} This is the closest Colorado comes to a summary divorce: the parties file sworn statements and their agreements, and the judge signs the decree without anyone appearing in court. It saves time and lawyer hours, not docket fees.</p>
<p>${d.parentingClass!.text}</p>
<h3>Example for co-petitioners</h3>
<p>Picture a Denver couple without minor children: one spouse petitions, the other responds, and they finish on the affidavit route. They pay ${h.usdx(ex.official)} in docket fees, and if one of them has a lawyer review the separation agreement for ${h.num(hrs)} hours at ${h.usd(rate)} an hour (a made-up quote to replace with your own), the bill reaches ${h.usd(ex.total)}. A spouse who cannot afford the docket fee can ask the court to waive it; the Judicial Branch publishes the forms with its self-help materials. Colorado maintenance has a statutory formula on the ${h.a('alimony:colorado', 'Colorado alimony page')}, child support a schedule on the ${h.a('child-support:colorado', 'Colorado child support page')}, and ${h.a('divorce-cost:arizona', 'Arizona')} to the southwest prices its divorces county by county.</p>`,
  faqs: [
    { q: 'How much does a divorce cost to file in Colorado?', a: `The petitioner pays a ${usdx(d.filingFee!)} docket fee and the respondent ${usdx(d.responseFee!)}, under C.R.S. 13-32-101, in every Colorado district court. If both spouses pay, the court fees total ${usdx(both.official)}. Later motions to modify a decree more than 60 days after it was entered cost ${usdx(postDecree)}. Attorney, mediator and service costs are separate and are not set by law.` },
    { q: 'How long does a Colorado divorce take at minimum?', a: `${num(wait)} days from the date the court acquired jurisdiction over the respondent, under C.R.S. 14-10-106: the date of service, of the respondent joining as co-petitioner, or of the respondent's appearance. One spouse must also have been domiciled in Colorado for 91 days before the case starts. Agreed cases can be finished on affidavit once the period has run.` },
    { q: 'Can you get divorced in Colorado without going to court?', a: 'Often, yes. C.R.S. 14-10-120.3 lets the court enter a decree upon affidavit, without a hearing, when there are no minor children, or both parties are represented and have a separation agreement covering the children, the respondent has been served, no material fact is disputed, and the parties have no marital property or agree on its division.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:arizona', 'child-support:colorado', 'alimony:colorado'],
});
