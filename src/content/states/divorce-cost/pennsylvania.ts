import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('pennsylvania');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const custody = fee(/custody/);
const master = fee(/permanent master/);
const praecipe = fee(/[Pp]raecipe/);
const wait = d.waitingPeriod!.days!;
const both = dvCalc('pennsylvania', { response: true });
const rate = 325, hrs = 9;
const ex = dvCalc('pennsylvania', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'pennsylvania',
  title: `Pennsylvania Divorce Cost 2026: ${usdx(d.filingFee!)} in Philadelphia`,
  description: `Pennsylvania divorce cost 2026: ${usdx(d.filingFee!)} to start a divorce in Philadelphia, ${usdx(d.responseFee!)} for the defendant's first filing, and ${num(wait)} days for a mutual consent decree.`,
  intro: 'Pennsylvania prices a divorce as a stack of statutory charges collected by each county, and its two no-fault routes run on very different clocks.',
  resume: `Starting a divorce in Philadelphia costs ${usdx(d.filingFee!)}, the commencement fee listed by the First Judicial District's Office of Judicial Records in its schedule effective November 12, 2025. The amount is a base fee under 42 Pa.C.S. § 1725 plus a stack of statutory add-ons for court automation, judicial education, the family court facility, the law library and state funds. When the defendant files anything, the first filing costs ${usdx(d.responseFee!)}. Other counties collect the same state components but their own local parts, so totals differ. Time drives the rest. With both spouses' consent the court can grant the divorce once ${num(wait)} days have passed since the action began; without consent, the spouses must have lived separate and apart for a year. One spouse must have been a bona fide Pennsylvania resident for six months, and an application under Rule 240 can waive the fees.`,
  body: (h) => `<h2>Reading the Philadelphia fee line</h2>
<p>The ${h.ext(d.feeUrl, 'Office of Judicial Records schedule')} itemizes ${h.usdx(d.filingFee!)} line by line, and only one of them, the base fee, is what most people think of as "the filing fee". The others are statutory charges the clerk must collect on every family filing. That is why a Pennsylvania divorce never comes to a round number. Each extra count in the complaint, such as a custody claim, triggers its own set of fees; a first filing for custody, partial custody or visitation is listed at ${h.usdx(custody)}.</p>
<p>The defendant's first filing, usually an answer and counterclaim, costs ${h.usdx(d.responseFee!)}. When both spouses file, the court collects ${h.usdx(both.official)} before any other step. Later charges belong to the end of the case: the praecipe to transmit the record to the judge for the decree is ${h.usdx(praecipe)}, and a motion to appoint a master to hear economic claims such as equitable distribution or alimony is ${h.usdx(master)}.</p>
<h2>Consent at ${h.num(wait)} days, or a year apart</h2>
<p>${d.waitingPeriod!.text} The mutual consent route is the cheap one: both spouses sign affidavits of consent after the ${h.num(wait)} days, and the decree follows once any economic claims are resolved. The irretrievable breakdown route exists for a spouse who will not consent; the year of separation is counted before the affidavit, and the other spouse can contest it. The choice between the two matters more to cost than any fee.</p>
<p>${d.residency!.text}</p>
<h2>Budgeting a consent divorce</h2>
<p>A spouse in Philadelphia who files, gets the other's consent and hires a lawyer for ${h.num(hrs)} hours at ${h.usd(rate)} (sample figures only, replace them with your quote) would see the commencement fee of ${h.usdx(ex.official)} and an estimate of ${h.usd(ex.total)}; adding the praecipe brings the court's share to ${h.usdx(ex.official + praecipe)}. Support in Pennsylvania is set by the guideline on the ${h.a('child-support:pennsylvania', 'Pennsylvania child support page')}, and spousal support or alimony pendente lite by the formula on the ${h.a('alimony:pennsylvania', 'Pennsylvania alimony page')}. Next door, ${h.a('divorce-cost:new-jersey', 'New Jersey')} and ${h.a('divorce-cost:ohio', 'Ohio')} price a divorce very differently.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Philadelphia, PA?', a: `The Philadelphia Office of Judicial Records charges ${usdx(d.filingFee!)} to commence a divorce, under its fee schedule effective November 12, 2025. The defendant's first filing costs ${usdx(d.responseFee!)}. Each additional count, such as a claim for custody, adds its own statutory fees, and the praecipe to transmit the record for the final decree costs ${usdx(praecipe)}. Other Pennsylvania counties publish their own totals.` },
    { q: 'How fast is a mutual consent divorce in Pennsylvania?', a: `Under 23 Pa.C.S. § 3301(c), the court can grant a divorce once ${num(wait)} days have passed since the action was commenced and both spouses have filed affidavits of consent. Economic issues such as property division must also be settled or decided before the decree. When one spouse refuses to consent, the other must show the spouses have lived separate and apart for at least one year.` },
    { q: 'Can Pennsylvania divorce fees be waived?', a: 'Yes. A spouse who cannot afford the fees files an application to waive fees and costs under Pennsylvania Rule of Civil Procedure 240, which follows Rule of Judicial Administration 1990. The court reviews income, benefits and expenses and decides. A waiver covers court fees and costs only; what you pay a lawyer or a private mediator is not included.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:new-jersey', 'divorce-cost:ohio', 'child-support:pennsylvania', 'alimony:pennsylvania'],
});
