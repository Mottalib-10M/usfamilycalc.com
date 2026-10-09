import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, pct, num } from '../../../lib/kit';
import { scheduleFee } from '../../../lib/engine/probate';

const d = pb('oregon');
const S = pbFeesOf('oregon')!.schedules;
const OB = S.find((s) => s.otherBase)!;
const T = S.find((s) => !s.otherBase)!.tiers!, np = OB.tiers![0].pct;
const money = (t: string) => (t.match(/\$[\d,]+/g) ?? []).map((x) => Number(x.replace(/[$,]/g, '')));
const F = money(d.filingFee!.text);
const feeSmall = F[0], bandLow = F[1], feeMid = F[2];
const realLimit = money(d.smallEstate.text)[1];
const months = d.creditorClaims.months!;
const affMonths = Number((d.smallEstate.text.match(/within (\d+) months after filing/) ?? ['', '0'])[1]);
const limit = d.smallEstate.limit!;
// Worked example: a Eugene estate with $420,000 of probate property (house and accounts) and no taxable non-probate assets.
const v = 420000;
const ex = pbCalc('oregon', v);
const comm = ex.lines[0].value;
// Same estate plus a $300,000 payable-on-death account reportable for estate tax.
const pod = 300000;
const podFee = scheduleFee(pod, OB);
// Simple estate affidavit example: $70,000 of personal property and a $190,000 house.
const pers = 70000, home = 190000;
const fits = pers <= limit && home <= realLimit;
const rv = 250000;
const rc = pbCalc('oregon', rv).lines[0].value;

export default defineStatePage({
  topic: 'probate',
  slug: 'oregon',
  title: `Oregon Probate Fees 2026: ${pct(T[0].pct)} Down to ${pct(T[3].pct)} by Statute`,
  description: `Oregon probate in 2026: ORS 116.173 gives the personal representative ${usd(comm)} on a ${usd(v)} estate, the court charges ${usd(feeMid)} to open it, claims run ${num(months)} months.`,
  intro: 'Oregon sets the personal representative’s fee by a steep-then-flat percentage, prices the court filing by the size of the estate, and lets small estates pass real property by affidavit.',
  resume: `Oregon probate fees for the personal representative are fixed by ORS 116.173: ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} up to ${usd(T[1].upTo!)}, ${pct(T[2].pct)} up to ${usd(T[2].upTo!)} and ${pct(T[3].pct)} of everything above, computed on probate property including income and gains, plus ${pct(np)} of non-probate property other than life insurance that is reportable for estate tax. A ${usd(rv)} probate estate earns ${usd(rc)}, a ${usd(v)} one ${usd(comm)}. Attorney fees are allowed by the court as reasonable. The court's own fee to appoint a personal representative depends on the estate: ${usd(feeSmall)} under ${usd(bandLow)}, ${usd(feeMid)} from there to under a million dollars, more above. On timing, creditors must present claims within ${num(months)} months after the notice to interested persons is first published, or 45 days after a mailed notice if later, and the final account and closing judgment come after that, so an orderly Oregon probate stays open for some time past that window. Estates within the simple estate limits, ${usd(limit)} of personal property and ${usd(realLimit)} of real property, can use an affidavit instead.`,
  body: (h) => `<h2>${h.pct(T[0].pct)} of almost nothing</h2>
<p>The top rate in ORS 116.173 looks generous until you see where it stops: ${h.pct(T[0].pct)} applies to the first ${h.usd(T[0].upTo!)} only, then ${h.pct(T[1].pct)} to ${h.usd(T[1].upTo!)} and ${h.pct(T[2].pct)} to ${h.usd(T[2].upTo!)}. Past that point the rate is ${h.pct(T[3].pct)}. For a Eugene estate with ${h.usd(v)} of probate property, a house and accounts, the commission is ${h.usd(comm)}, an effective rate of ${h.pct(Math.round((comm / v) * 1000) / 10)}. The base uses the highest value reported for the property and adds income and gains, realized or not, so a house that appreciates during administration raises the fee slightly. A will can set a different amount, and the court can allow more for extraordinary services.</p>
<h2>The ${h.pct(np)} on assets outside probate</h2>
<p>Oregon is one of the few states that pays the personal representative something on property that never enters probate. If the same decedent also had a ${h.usd(pod)} payable-on-death account that must be reported for Oregon or federal estate tax, the representative is entitled to ${h.pct(np)} of it, ${h.usd(podFee)}. Life insurance is excluded. Most estates owe no estate tax report and never trigger this line. The calculator keeps this line out of its total and shows it separately, because it is computed on assets outside the estate you enter.</p>
<h2>An affidavit that can carry a house</h2>
<p>Unlike most small estate procedures, the Oregon simple estate affidavit under ORS 114.505 to 114.560 can transfer real property. It is filed with the probate court and works when no more than ${h.usd(limit)} of the estate is personal property and no more than ${h.usd(realLimit)} is real property. A Bend estate with ${h.usd(pers)} of accounts and a ${h.usd(home)} cabin ${fits ? 'fits both limits' : 'misses a limit'}. Creditors then have ${h.num(affMonths)} months after filing to present claims to the affiant. Neither limit is indexed.</p>
<h2>Court fees by band</h2>
<p>ORS 21.170 prices the petition by estate size, and accountings follow similar bands. The calculator does not add the fee automatically because it depends on the band you fall into. The Eugene estate sits in the ${h.usd(feeMid)} band.</p>
<h2>What we could not verify</h2>
<p>The Oregon Legislature's site refused our connections, so the ORS chapters were read from archive copies of the official pages. ORS 116.183 on attorney fees and the statutory timetable for the final account were not read, which is why this page gives no closing deadline. To the north, ${h.a('probate:washington', 'Washington')} has no percentage at all.</p>`,
  faqs: [
    { q: 'How much is the personal representative fee in Oregon?', a: `ORS 116.173 allows ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} up to ${usd(T[1].upTo!)}, ${pct(T[2].pct)} up to ${usd(T[2].upTo!)} and ${pct(T[3].pct)} above, on probate property including income and gains, plus ${pct(np)} of reportable non-probate property other than life insurance. A ${usd(v)} probate estate gives ${usd(comm)}. Extraordinary services can be paid on top.` },
    { q: 'Can a house pass through the Oregon small estate affidavit?', a: `Yes, which is unusual. The simple estate affidavit covers estates with no more than ${usd(limit)} of personal property and no more than ${usd(realLimit)} of real property, under ORS 114.510 and 114.515. It is filed with the probate court in the county, and creditors may present claims to the affiant within ${num(affMonths)} months after filing.` },
    { q: 'What does it cost to file for probate in Oregon?', a: `The fee for a petition to appoint a personal representative under ORS 21.170 is ${usd(feeSmall)} when the estate is under ${usd(bandLow)}, ${usd(feeMid)} up to under a million dollars, and higher above that. Accountings are charged on similar bands. Publication of the notice to interested persons and certified copies of letters add smaller amounts.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:washington', 'probate:california', 'child-support:oregon', 'workers-comp:oregon'],
});
