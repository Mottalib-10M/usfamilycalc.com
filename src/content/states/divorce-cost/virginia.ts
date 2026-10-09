import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('virginia');
const sheriff = d.otherFees.find((f) => /sheriff/i.test(f.what))?.amount ?? 0;
const techFund = Number(/\$(\d+) of which goes to the Courts Technology Fund/.exec(d.feeText)?.[1] ?? 0);
const served = dvCalc('virginia', { service: sheriff });
const rate = 300, hrs = 6;
const ex = dvCalc('virginia', { service: sheriff, rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'virginia',
  title: `Virginia Divorce Cost 2026: ${usdx(d.filingFee!)} Clerk's Fee, Local Add-Ons`,
  description: `Virginia divorce cost in 2026: a ${usdx(d.filingFee!)} circuit court clerk's fee set by Code § 17.1-275, no fee to answer, ${usdx(sheriff)} per sheriff service and local charges that vary.`,
  intro: 'Virginia writes a single divorce fee into its Code, then lets each circuit court add its own local charges, and makes separation the price of a no-fault decree.',
  resume: `The fee Virginia law sets for a divorce is ${usdx(d.filingFee!)}: Code § 17.1-275(A)(26) fixes the circuit court clerk's charge to the plaintiff in every divorce and separate maintenance case, and ${usdx(techFund)} of it goes to the Courts Technology Fund. A counterclaim or any other responsive pleading carries no fee at all. That ${usdx(d.filingFee!)} is not the full check written at the clerk's window, though: each circuit court adds statutory and local charges such as the law library and courthouse fees, so the real total depends on the city or county, and a sheriff charges ${usdx(sheriff)} for each person served. Time costs more than fees here. A no-fault divorce requires living separate and apart without cohabitation for one year, or six months with a separation agreement and no minor children. One spouse must have been a Virginia resident and domiciliary for six months, and Form CC-1414 asks to proceed without paying fees.`,
  body: (h) => `<h2>The Code fee and the local layer</h2>
<p>${d.feeText} So the calculator shows ${h.usdx(d.filingFee!)} as the official base, and you should add the local fees of the circuit court where you file. The clerk of the circuit court where you file can give you the full local total before you file.</p>
<p>Service is the other routine charge: ${h.usdx(sheriff)} for each person a Virginia sheriff serves, under § 17.1-272. A defendant who signs an acceptance of service saves it.</p>
<h2>One year apart, or six months with an agreement</h2>
<p>${d.waitingPeriod!.text} The separation must be continuous, without interruption and without cohabitation, so moving back in together, even briefly, can put the start date in question. The six-month route is the cheapest Virginia divorce: a couple without minor children who have signed a separation agreement on property and support can file as soon as the six months end. With minor children the six-month option is closed, even if the parents agree on everything.</p>
<p>${d.residency!.text}</p>
<h2>The parent education seminar</h2>
<p>${d.parentingClass!.text} The 12-month look-back means a parent who already took the seminar in a related case does not repeat it.</p>
<h3>A worked example</h3>
<p>A Richmond spouse files after a year of separation, has the sheriff serve the other spouse, and hires a lawyer for ${h.num(hrs)} hours at ${h.usd(rate)} an hour; the hours and rate are hypothetical inputs you should replace. The calculator counts ${h.usdx(served.official)} of Code fees, ${h.usdx(sheriff)} of service and ${h.usd(ex.total)} in total, before the local add-ons of the Richmond Circuit Court. A filer who cannot pay uses ${h.ext(d.waiver!.url, d.waiver!.name)}. Spousal support has a pendente lite formula on the ${h.a('alimony:virginia', 'Virginia alimony page')}, child support a schedule on the ${h.a('child-support:virginia', 'Virginia child support page')}, and ${h.a('divorce-cost:north-carolina', 'North Carolina')} also requires a year apart.</p>`,
  faqs: [
    { q: 'What is the filing fee for a divorce in Virginia?', a: `The Code of Virginia, § 17.1-275(A)(26), sets the circuit court clerk's fee in a divorce at ${usdx(d.filingFee!)}, charged to the plaintiff, with no fee for a counterclaim or answer. Each circuit court adds other statutory and local charges, so the amount paid at filing is higher and differs between jurisdictions. Sheriff's service costs ${usdx(sheriff)} per person served.` },
    { q: 'Can you get a Virginia divorce after six months of separation?', a: 'Yes, if the spouses have no minor children and have signed a separation agreement. Code § 20-91(A)(9)(a) allows a no-fault divorce after six months of living separate and apart without cohabitation in that case; otherwise the separation must last one year. One spouse must also have been a Virginia resident and domiciliary for at least six months before filing.' },
    { q: 'Is a parenting class required in a Virginia divorce?', a: 'When custody, visitation or support of a child is contested, yes: under Code § 20-103 the parties must show they attended an approved educational seminar in the previous 12 months or will attend within 45 days. In uncontested cases the court may require it only for good cause. The seminar is run by providers approved by the Office of the Executive Secretary of the Supreme Court of Virginia.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:north-carolina', 'child-support:virginia', 'alimony:virginia'],
});
