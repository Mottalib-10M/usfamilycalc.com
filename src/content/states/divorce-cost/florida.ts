import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('florida');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const counter = fee(/counterclaim/);
const reopen = fee(/reopening/);
const wait = d.waitingPeriod!.days!;
const med = 600, rate = 300, hrs = 6;
const ex = dvCalc('florida', { mediation: med, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'florida',
  title: `Florida Divorce Cost 2026: ${usdx(d.filingFee!)} Miami-Dade Filing Fee`,
  description: `Florida divorce cost in 2026: ${usdx(d.filingFee!)} to file a dissolution in Miami-Dade, ${usdx(counter)} for a counterpetition, a ${num(wait)}-day minimum wait and a mandatory parent course.`,
  intro: 'Florida calls it dissolution of marriage, lets each clerk set the filing charge within a statutory cap, and offers a joint simplified track for couples without children.',
  resume: `In Miami-Dade, Florida's most populous county, the Clerk of the Court charges ${usdx(d.filingFee!)} to file a petition for dissolution of marriage. Section 28.241 of the Florida Statutes caps the clerk's own filing fee and lets other authorized charges be added, so the total moves slightly from county to county. The spouse who answers pays nothing for an answer, but a counterpetition asking for relief costs ${usdx(counter)}. A final judgment cannot be entered until at least ${num(wait)} days after filing (§ 61.19), and one spouse must have lived in Florida for six months before filing. Parents of minor children must complete the Parent Education and Family Stabilization Course before the judgment. Couples with no children who agree on everything can file a joint petition for simplified dissolution, and anyone who cannot pay applies to the clerk to be declared indigent.`,
  body: (h) => `<h2>The clerk's line and the statute's cap</h2>
<p>Each Florida county clerk of court publishes its own schedule. Section 28.241(1)(a) sets the ceiling on the basic filing fee and allows a few other charges on top; that is how ${h.ext(d.feeUrl, 'Miami-Dade')} reaches ${h.usdx(d.filingFee!)} for a dissolution. A case closed and later reopened, for example to modify support, costs ${h.usdx(reopen)} in Miami-Dade. A counterpetition costs ${h.usdx(counter)}, an amount that surprises respondents who thought only the filer pays. An answer alone carries no fee.</p>
<h2>Simplified dissolution, and its limits</h2>
<p>The Supreme Court's form 12.901(a) is the cheapest route the law offers. ${d.simplified!.text} There is no separate fee level: the filing line is the ordinary dissolution fee. The trade-off is that the simplified route waives discovery, trial and appeal, so it fits couples whose finances are simple and fully disclosed to each other. Anyone with a pension to split, a business or a house with contested value usually files the regular petition, with the mandatory financial affidavits.</p>
<h2>Twenty days, six months, one course</h2>
<p>${d.waitingPeriod!.text} The ${h.num(wait)} days are a floor rather than a forecast: the hearing date depends on the court's calendar. ${d.residency!.text} The six months must be met when the petition is filed, not by the hearing, so someone who has just moved to Florida waits before filing rather than after.</p>
<p>${d.parentingClass!.text} The course is offered by approved providers, in person or online, for a fee the provider sets. Leaving it to the last week can hold up an otherwise agreed Florida case at the very end.</p>
<h3>An example budget</h3>
<p>Picture a Miami couple with one child who settle their parenting plan in mediation. The mediator's ${h.usd(med)} and a lawyer's ${h.num(hrs)} hours at ${h.usd(rate)} are made-up placeholders; type the quotes you receive into the calculator. The clerk's share remains ${h.usdx(ex.official)}, and the estimate reaches ${h.usd(ex.total)} before the parent course. Child support follows the income shares schedule on the ${h.a('child-support:florida', 'Florida child support page')}, and spousal support is covered on the ${h.a('alimony:florida', 'Florida alimony page')}. Across the state line, a ${h.a('divorce-cost:georgia', 'Georgia divorce')} works with a different clock.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Miami-Dade, Florida?', a: `The Miami-Dade Clerk of the Court charges ${usdx(d.filingFee!)} to file a petition for dissolution of marriage. The respondent pays nothing to file an answer, but a counterpetition costs ${usdx(counter)}. Service of process by the sheriff or a private server is billed separately. Other Florida counties set slightly different totals within the cap of Florida Statutes § 28.241.` },
    { q: 'Who can use simplified dissolution in Florida?', a: 'Spouses who both agree the marriage is irretrievably broken, have no minor or dependent children together, the wife not pregnant, have already divided their assets and debts, do not ask for alimony, and give up their right to trial and appeal. Both must attend the final hearing. They file one joint petition on Florida Supreme Court form 12.901(a) and pay the ordinary dissolution filing fee.' },
    { q: 'Is the parenting class mandatory for a Florida divorce?', a: 'Yes, for parents of minor children. Florida Statutes § 61.21(4) requires all parties to a dissolution involving minor children to complete the Parent Education and Family Stabilization Course before the final judgment is entered. The court can excuse a party for good cause. The course is taken from an approved provider, many of which offer an online version, and the provider charges its own fee.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:georgia', 'child-support:florida', 'alimony:florida'],
});
