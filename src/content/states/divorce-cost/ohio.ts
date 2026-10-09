import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('ohio');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const dissolution = fee(/^Petition for dissolution/);
const service = fee(/^Personal service/);
const post = fee(/^Post-judgment/);
const wait = d.waitingPeriod!.days!;
const divorceRoute = dvCalc('ohio', { response: true, service });
const rate = 300, hrs = 7;
const agreed = dissolution + rate * hrs;

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'ohio',
  title: `Ohio Divorce Cost 2026: ${usdx(d.filingFee!)} Deposit or ${usdx(dissolution)} Dissolution`,
  description: `Ohio divorce cost in 2026: Franklin County asks a ${usdx(d.filingFee!)} deposit for a divorce and ${usdx(dissolution)} for a dissolution, and a contested case waits ${num(wait)} days after service.`,
  intro: 'Ohio separates divorce, where one spouse sues the other, from dissolution, where both ask together, and the two are priced and timed differently.',
  resume: `In Franklin County, Ohio's most populous county, the Domestic Relations court asks a ${usdx(d.filingFee!)} deposit to open a divorce and ${usdx(dissolution)} to open a dissolution of marriage, under Local Rule 2 effective October 27, 2025. These are deposits for court costs, not final fees: the clerk draws costs against them and the final bill can differ. A spouse who files a counterclaim deposits ${usdx(d.responseFee!)}, and personal service inside the county is ${usdx(service)}. Dissolution suits couples who already agree: they file one petition with a signed separation agreement and must appear before the court between 30 and 90 days after filing. A divorce cannot be heard until ${num(wait)} days after service under Civil Rule 75(K). The plaintiff must have lived in Ohio six months, parents with minor children attend a seminar, and an affidavit of indigency replaces the deposit.`,
  body: (h) => `<h2>Divorce or dissolution: two price tags</h2>
<p>Ohio law gives couples a choice most states do not label so sharply. A divorce under Chapter 3105 is a lawsuit: one spouse files a complaint, the other is served and may answer or counterclaim. A dissolution is a joint petition with the whole deal attached, the separation agreement covering property, support and parenting. In ${h.ext(d.feeUrl, 'Franklin County Local Rule 2')} the deposit for a divorce is ${h.usdx(d.filingFee!)}, for a dissolution ${h.usdx(dissolution)}. The dissolution saves more than the difference, because there is no service on an opponent and usually no contested hearing.</p>
<h3>What the deposit covers</h3>
<p>Ohio courts call these sums "security for costs". Costs are charged against the deposit as the case moves, so the final figure is known only at the end. A post-judgment motion to modify or enforce an order later requires a fresh ${h.usdx(post)} deposit. A spouse who cannot pay files the ${h.ext(d.waiver!.url, d.waiver!.name)} and the case goes forward without the deposit.</p>
<h2>The ${h.num(wait)}-day rule and the dissolution window</h2>
<p>${d.waitingPeriod!.text} The dissolution window works the other way: the hearing cannot be sooner than 30 days or later than 90, so an agreed couple knows the range from the day they file. Both spouses must still affirm the agreement under oath at that hearing (R.C. 3105.64), so it is the moment a dissolution is decided.</p>
<p>${d.residency!.text}</p>
<h2>Children and the separating parents seminar</h2>
<p>${d.parentingClass!.text} Each Ohio county sets its own requirement by local rule, so a family filing in another county should read that court's rules.</p>
<h3>Comparing the two routes</h3>
<p>Picture a Columbus couple. As a contested divorce with an answer that includes a counterclaim and personal service, the deposits come to ${h.usdx(divorceRoute.official)} plus ${h.usdx(service)} of service, ${h.usd(divorceRoute.total)} in all. As a dissolution with one lawyer drafting the agreement at an invented ${h.usd(rate)} an hour for ${h.num(hrs)} hours, the total is about ${h.usd(agreed)}; enter your own rate and hours above. Ohio child support starts from gross income on the ${h.a('child-support:ohio', 'Ohio child support page')}. Neighboring ${h.a('divorce-cost:pennsylvania', 'Pennsylvania')} and ${h.a('divorce-cost:michigan', 'Michigan')} handle agreed cases through other procedures.</p>`,
  faqs: [
    { q: 'What is the difference between divorce and dissolution in Ohio?', a: `A divorce is a lawsuit filed by one spouse against the other; a dissolution is a joint petition by both spouses who have already signed a separation agreement on property, support and parenting. In Franklin County the deposit is ${usdx(d.filingFee!)} for a divorce and ${usdx(dissolution)} for a dissolution. Spouses in a dissolution must appear in court between 30 and 90 days after filing.` },
    { q: 'How long after service can an Ohio divorce be granted?', a: `Ohio Civil Rule 75(K) bars the court from hearing and deciding a divorce until ${num(wait)} days after service of the complaint, or 28 days after the last publication when the spouse was served by publication. A counterclaim adds its own 28-day period unless the plaintiff waives it. Contested cases usually take longer because of discovery, temporary orders and the court's schedule.` },
    { q: 'Do parents have to take a class to divorce in Ohio?', a: 'In Franklin County, yes: Local Rule 26 requires all parents in a divorce, legal separation or dissolution with minor children to attend the seminar for separating parents within 45 days before or after filing or service, and completion is required before the final hearing unless the court waives it for good cause. Other Ohio counties set their own rule.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:pennsylvania', 'divorce-cost:michigan', 'child-support:ohio'],
});
