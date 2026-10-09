import { defineStatePage } from '../../../lib/page-types';
import { dv, dvCalc, usd, usdx, num } from '../../../lib/kit';

const d = dv('new-york');
const fee = (re: RegExp) => d.otherFees.find((f) => re.test(f.what))?.amount ?? 0;
const rji = fee(/^Request for judicial intervention/);
const noi = fee(/^Note of issue/);
const motion = fee(/^Motion/);
const stip = fee(/^Stipulation/);
const minimum = fee(/^Minimum total/);
const built = d.filingFee! + rji + noi;
const motions = 2;
const rate = 400, hrs = 8;
const ex = dvCalc('new-york', { rate, hours: hrs });

export default defineStatePage({
  topic: 'divorce-cost',
  slug: 'new-york',
  title: `New York Divorce Cost 2026: ${usdx(d.filingFee!)} Index Number, ${usdx(minimum)} Floor`,
  description: `New York divorce cost in 2026: an index number of ${usdx(d.filingFee!)}, a request for judicial intervention of ${usdx(rji)} and a note of issue of ${usdx(noi)}: at least ${usdx(minimum)} in court fees.`,
  intro: 'Divorce in New York is a Supreme Court action, and its fees come in stages under the Civil Practice Law and Rules rather than as one filing charge.',
  resume: `An uncontested divorce in New York costs at least ${usdx(minimum)} in court fees, the figure the court system itself publishes: ${usdx(d.filingFee!)} to buy an index number when the summons is filed, ${usdx(rji)} for the request for judicial intervention that puts the case before a judge, and ${usdx(noi)} for the note of issue, all set by CPLR article 80. These rates are the same in every county because the state Supreme Court, not a county clerk, sets them. The defendant spouse pays nothing to respond. Contested cases add ${usdx(motion)} for each motion or cross-motion, and a stipulation of settlement filed later costs ${usdx(stip)}. There is no waiting period after filing, but the no-fault ground needs a marriage broken down for at least six months, sworn to by one spouse. Residency runs from one to two years, and poor person's relief under CPLR 1101 can remove the fees.`,
  body: (h) => `<h2>Three payments instead of one</h2>
<p>New York does not sell a divorce in one transaction. The plaintiff pays ${h.usdx(d.filingFee!)} for the index number when the summons is filed with the county clerk. Nothing more is owed until someone asks a judge to act: the request for judicial intervention costs ${h.usdx(rji)}, and the note of issue, which tells the court the case is ready for judgment, costs ${h.usdx(noi)}. Together that is ${h.usdx(built)}, the floor ${h.ext('https://www.nycourts.gov/help/family-issues-divorce/filing-uncontested-divorce', 'the court system states for an uncontested divorce')}. Where no RJI is filed, the note of issue alone is charged at a higher rate set in the same section, as the court's fee page lists.</p>
<p>Fees climb in a contested case because each motion and cross-motion is billed. A case with ${h.num(motions)} motions on temporary maintenance and custody adds ${h.usdx(motions * motion)}. The defendant who only answers pays nothing.</p>
<h2>Residency in tiers</h2>
<p>Domestic Relations Law § 230 is more demanding than most states. ${d.residency!.text} A couple married elsewhere who moved to Buffalo last year, and whose marriage broke down after the move, can usually rely on the one-year tier because the grounds arose in New York; a spouse who just arrived alone needs two years.</p>
<h2>No clock, but six months of breakdown</h2>
<p>${d.waitingPeriod!.text} That six-month condition looks backward, to the state of the marriage before filing, rather than forward from the summons. Once the papers are complete, an uncontested judgment is signed when the judge reaches it, which depends on the county. ${h.ext(d.simplified!.url, 'The uncontested divorce forms packet')} is free to download, and the clerk charges only the fees above to file it.</p>
<h3>A sample bill</h3>
<p>Assume a Manhattan couple settles, and one spouse pays a matrimonial lawyer ${h.usd(rate)} an hour for ${h.num(hrs)} hours to draft the settlement and judgment; replace those invented numbers with a real quote. The calculator puts the index number at ${h.usdx(ex.official)}; with the RJI and note of issue the court's share reaches ${h.usdx(built)}, and the whole bill about ${h.usd(ex.total + rji + noi)}. Maintenance follows the statutory formula on the ${h.a('alimony:new-york', 'New York alimony page')}, and child support the CSSA percentages on the ${h.a('child-support:new-york', 'New York child support page')}. Close by, a ${h.a('divorce-cost:new-jersey', 'New Jersey divorce')} is filed in the Family Division with a single fee.</p>`,
  faqs: [
    { q: 'What are the court fees for an uncontested divorce in New York?', a: `At least ${usdx(minimum)}, according to the New York court system: ${usdx(d.filingFee!)} for the index number, ${usdx(rji)} for the request for judicial intervention and ${usdx(noi)} for the note of issue, under CPLR article 80. Filing a stipulation of settlement adds ${usdx(stip)}, and each motion ${usdx(motion)}. The spouse who did not start the case pays no filing fee.` },
    { q: 'How long must I live in New York to file for divorce?', a: 'Two continuous years before filing in the general case. One year is enough if the couple married in New York, lived there as spouses, or the grounds arose there while either spouse lived in the state. If both spouses were residents when the grounds arose in New York, no minimum period applies. These tiers come from Domestic Relations Law § 230.' },
    { q: 'Is there a waiting period for divorce in New York?', a: 'No statute makes New York spouses wait a set number of days after filing. The no-fault ground in Domestic Relations Law § 170(7) instead requires that the relationship has been irretrievably broken for at least six months, stated under oath, and the judgment issues only after property, support and custody are resolved. In practice timing depends on how busy the county court is.' },
  ],
  related: ['divorce-cost', 'uncontested-divorce-cost', 'divorce-cost:new-jersey', 'child-support:new-york', 'alimony:new-york'],
});
