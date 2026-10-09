import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('texas');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const kids = fee(/with children/);
const counter = fee(/counterclaim/);
const contempt = fee(/contempt/);
const wait = d.waitingPeriod!.days!;
const rate = 275, hrs = 10;
const ex = dvCalc('texas', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'texas',
  title: `Texas Divorce Cost 2026: ${usdx(d.filingFee!)} Harris County Filing`,
  description: `Texas divorce cost 2026: the Harris County District Clerk charges ${usdx(d.filingFee!)} to file without children and ${usdx(kids)} with children, and no decree is signed before day ${num(wait)}.`,
  intro: 'Texas has no statewide divorce fee: each district clerk collects its own total, and Harris County, the most populous, is the reference used here.',
  resume: `Filing for divorce in Harris County, Texas costs ${usdx(d.filingFee!)} when the couple has no children and ${usdx(kids)} when they do, according to the District Clerk's fee schedule effective January 1, 2026; the gap is the domestic relations fee charged in every case involving children. Those totals do not include service of citation on the other spouse. The answering spouse pays no fee for a plain answer, but a counterpetition asking the court for its own relief costs ${usdx(counter)}. Texas has no summary divorce, so even a fully agreed case goes through the ordinary petition, waiting time and decree. The court cannot sign the decree before the ${num(wait)}th day after filing, under Family Code § 6.702, except in some family violence cases. A spouse who cannot pay files a Statement of Inability to Afford Payment of Court Costs and pays nothing to the clerk.`,
  body: (h) => `<h2>Why a Texas fee depends on the courthouse</h2>
<p>The Texas Legislature fixes many of the pieces that make up a civil filing fee, but the district clerk of each county adds them up and posts its own total. This page uses ${h.ext(d.feeUrl, 'the Harris County District Clerk schedule')}, because Harris is the largest county; a filing in Travis, Dallas or a rural county will be close but not identical. Ask the clerk of the county where you file before you pay. Harris splits divorce into two lines: ${h.usdx(d.filingFee!)} without children and ${h.usdx(kids)} with children, the extra being the domestic relations fee the state adds to every family case involving children.</p>
<h3>What the respondent pays</h3>
<p>A spouse who only files an answer, or who signs a waiver of service, pays nothing in Harris County. A counterpetition is different: it is a new claim and costs ${h.usdx(counter)}. Later in the case a motion for contempt to enforce temporary orders costs ${h.usdx(contempt)}. Service by a constable or a private process server is billed on top and varies.</p>
<h2>Residence, then ${h.num(wait)} days</h2>
<p>${d.residency!.text} Once the petition is on file, the ${h.num(wait)}-day period starts counting from the filing date, not from service. Agreed couples often sign their decree on or soon after day ${h.num(wait)}; a contested case runs as long as discovery and the court's docket require. The statute carves out certain family violence cases, where the court may act sooner; agreement between the spouses is not one of the exceptions.</p>
<h2>Paying for the agreed route</h2>
<p>Because Texas offers no simplified procedure, the paperwork of an agreed divorce matches a contested one: original petition, waiver or service, and a final decree with any property division and parenting order. Suppose one spouse hires a lawyer at ${h.usd(rate)} an hour for ${h.num(hrs)} hours to draft the decree; both figures are invented for the example, so replace them with your own quote. With no children the clerk's part is ${h.usdx(ex.official)} and the total ${h.usd(ex.total)}. With children, the filing line rises to ${h.usdx(kids)} and the decree must include a parenting plan and guideline support, which the ${h.a('child-support:texas', 'Texas child support calculator')} computes from net resources. Courts may also order a parent education course under § 105.009; some counties require it by local rule. Maintenance after the divorce is capped by statute, as the ${h.a('alimony:texas', 'Texas alimony page')} explains.</p>`,
  faqs: [
    { q: 'How much does it cost to file for divorce in Harris County, Texas?', a: `The Harris County District Clerk charges ${usdx(d.filingFee!)} for a divorce with no children and ${usdx(kids)} for a divorce with children, under its schedule effective January 1, 2026. Service of citation on the other spouse is not included. Other Texas counties post their own totals, so check the clerk of the county where you will file before paying.` },
    { q: 'Can I get a divorce in Texas in less than 60 days?', a: `Usually not. Family Code § 6.702 bars the court from granting a divorce before the ${num(wait)}th day after the petition was filed, and the count starts at filing, not at service. Only certain family violence cases are exempt. Spouses who agree on everything still wait the full period, though they can prepare and sign their agreed decree in the meantime so it is ready on the first permitted day.` },
    { q: 'What if I cannot afford Texas divorce court fees?', a: `File a Statement of Inability to Afford Payment of Court Costs, the statewide bilingual form published under Texas Rule of Civil Procedure 145, together with your petition. It asks about income, public benefits, household expenses and assets. The judge decides whether you must pay. The statement covers court costs only, so a lawyer, mediator or private process server you hire remains your own expense.` },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:arizona', 'child-support:texas', 'alimony:texas'],
});
