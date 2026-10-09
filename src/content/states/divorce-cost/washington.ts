import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('washington');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const counter = fee(/^Counter Petition/);
const base = fee(/^Statewide statutory base/);
const local = d.filingFee! - base;
const wait = d.waitingPeriod!.days!;
const rate = 325, hrs = 8, med = 900;
const ex = dvCalc('washington', { rate, hours: hrs, mediation: med });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'washington',
  title: `Washington Divorce Cost 2026: ${usdx(d.filingFee!)} King County Fee`,
  description: `Washington divorce cost in 2026: King County charges ${usdx(d.filingFee!)} to file a dissolution and ${usdx(counter)} for a counter petition, and no decree is entered before day ${num(wait)}.`,
  intro: 'Washington builds its dissolution fee from statutes that apply in every county, then lets each county add a small local charge, and asks for residence but no minimum stay.',
  resume: `Filing a petition for dissolution of marriage in King County, Washington's most populous county, costs ${usdx(d.filingFee!)} at the Superior Court Clerk's office. Most of that comes from state law and is the same everywhere: ${usdx(base)} made of the civil filing fee and two surcharges in RCW 36.18.020 and the dissolution fee in RCW 36.18.016. The remaining ${usdx(local)} is King County's own addition, the kind of local charge for a courthouse facilitator program that RCW 26.12.240 allows. A spouse who files a counter petition pays ${usdx(counter)} in King County. The court can enter the decree only after ${num(wait)} days have passed since the petition was filed and since the summons was served, under RCW 26.09.030. Washington has no minimum residence period: the petitioner only has to live in the state, be stationed there with the armed forces, or be married to someone who does. Fees can be waived under General Rule 34.`,
  body: (h) => `<h2>${h.usdx(base)} from Olympia, ${h.usdx(local)} from King County</h2>
<p>${d.feeText} The split matters if you file outside Seattle: Spokane, Pierce or Clark County start from the same ${h.usdx(base)} and add their own local amount, which is why their totals sit close to King County's without matching it. ${h.ext(d.feeUrl, 'The King County schedule')} is the reference the calculator uses.</p>
<p>A respondent who simply answers the petition is not listed for a fee in this schedule; a counter petition asking for different relief is, at ${h.usdx(counter)}.</p>
<h2>Ninety days, counted twice</h2>
<p>${d.waitingPeriod!.text} The two conditions run in parallel, so the ${h.num(wait)} days end on whichever date is later: filing or service. A petitioner who files today and serves the spouse three weeks later waits ${h.num(wait)} days from the service. A respondent who signs an acceptance of service on the day of filing closes the gap, so both conditions are met on the same date.</p>
<p>${d.residency!.text} A spouse who has just moved to Washington can therefore file at once; the ninety days are the only delay.</p>
<h2>Forms, facilitators and seminars</h2>
<p>${d.simplified!.text} The statewide family law forms are free to download, and courthouse facilitators, the program the local surcharge supports, help self-represented parties with them. ${d.parentingClass!.text}</p>
<h3>Example budget for a Seattle couple</h3>
<p>Suppose the spouses mediate their parenting plan for ${h.usd(med)} and one hires a lawyer for ${h.num(hrs)} hours at ${h.usd(rate)} to finalize the decree. Those three figures are illustrative; put your own quotes into the calculator. The clerk's share is ${h.usdx(ex.official)} and the total ${h.usd(ex.total)}. If the filer qualifies, the ${h.ext(d.waiver!.url, d.waiver!.name)} removes the filing fee and surcharges. For a state that sets its divorce fees by statewide schedule instead, compare ${h.a('divorce-cost:california', 'California')}.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in King County, Washington?', a: `${usdx(d.filingFee!)} for a petition for dissolution of marriage at the King County Superior Court Clerk. Of that, ${usdx(base)} comes from statewide statutes and the rest is a local addition. A counter petition costs ${usdx(counter)}. Other Washington counties add a slightly different local amount. Fees can be waived for people who cannot pay, using the General Rule 34 forms.` },
    { q: 'What is the waiting period for divorce in Washington State?', a: `${num(wait)} days. RCW 26.09.030 lets the court enter a decree of dissolution only when ninety days have elapsed both since the petition was filed and since the summons was served on the respondent, or first published. When the respondent accepts service on the filing date, both conditions end together; otherwise the later date controls, and the decree waits for it.` },
    { q: 'Do you need to live in Washington for a time before filing for divorce?', a: 'No minimum period is set. RCW 26.09.030 requires only that the petitioner is a resident of Washington, is a member of the armed forces stationed in the state, or is married to someone who is. The court must still have personal jurisdiction over the other spouse to decide support or divide property located elsewhere.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:california', 'divorce-cost:arizona'],
});
