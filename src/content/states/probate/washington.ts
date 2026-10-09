import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, usd, num, day } from '../../../lib/kit';

const d = pb('washington');
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const filing = d.filingFee!.amount!;
const outer = Number((d.creditorClaims.text.match(/have (\d+) months after death/) ?? ['', '0'])[1]);
const plus = (iso: string, m: number) => { const t = new Date(`${iso}T00:00:00Z`); t.setUTCMonth(t.getUTCMonth() + m); return t.toISOString().slice(0, 10); };
// Worked example: a Tacoma couple with $170,000 of community personal property; the husband dies on January 15, 2026.
const community = 170000;
const half = community / 2;
const ok = pbCalc('washington', half).belowSmallEstate;
const death = '2026-01-15', published = '2026-03-02';
const separate = 60000;
const okWithSeparate = pbCalc('washington', half + separate).belowSmallEstate;

export default defineStatePage({
  topic: 'probate',
  slug: 'washington',
  title: `Washington Probate 2026: ${usd(filing)} Fee, Nonintervention Powers`,
  description: `Washington probate in 2026: a ${usd(filing)} filing fee, creditor claims barred ${num(months)} months after publication, and an affidavit for estates up to ${usd(limit)} after 40 days.`,
  intro: 'Washington lets most personal representatives settle an estate without court supervision, under nonintervention powers, and close it by a simple declaration.',
  resume: `Washington probate fees are not set by percentage: under RCW 11.48.210 the personal representative and the attorney receive what the court deems just and reasonable, usually hourly, and the fees actually paid must be disclosed when the estate is closed. Opening the case costs ${usd(filing)} under RCW 36.18.020, plus any local surcharge. Washington probate is also among the least supervised in the country. Once the court grants nonintervention powers, which it routinely does when the estate is solvent, the personal representative can sell property, pay bills and distribute without returning to court, then close the estate by filing a declaration of completion. The creditor period is ${num(months)} months from the first publication of the notice, and the declaration follows once claims are paid or resolved, so a straightforward Washington estate can close soon after that bar. Personal property estates of ${usd(limit)} or less, after liens and excluding the surviving spouse's community half, can be collected by affidavit 40 days after death.`,
  body: (h) => `<h2>Community property and the ${h.usd(limit)} affidavit</h2>
<p>RCW 11.62.010 measures the decedent's probate estate, and in a community property state that means half of what the couple owned together. Take a Tacoma couple with ${h.usd(community)} of community bank and brokerage accounts. When the husband dies on ${h.day(death)}, his probate estate is ${h.usd(half)}, which is ${ok ? 'within' : 'above'} the ${h.usd(limit)} ceiling once the spouse's community share is left out. If he also owned ${h.usd(separate)} of separate property inherited from a parent, the total becomes ${h.usd(half + separate)} and the affidavit ${okWithSeparate ? 'still works' : 'no longer works'}. The successor signs the affidavit on day 40 and presents it to each institution; no court file is opened. Real estate cannot be transferred this way. Community property agreements, common among Washington couples, can move everything to the survivor without any probate. The limit is not indexed, and the statute as read does not show the date it took effect.</p>
<h2>Nonintervention powers in practice</h2>
<p>Under chapter 11.68 RCW, a personal representative with nonintervention powers needs no court order to sell the house or settle a claim. The court reappears only if someone asks it to. Closing is a declaration of completion under RCW 11.68.110, filed after claims are paid or disposed of and administration is complete; it states the fees paid to the representative and the lawyer, which gives heirs the information to object.</p>
<h2>Publishing the notice, or not</h2>
<p>The ${h.num(months)}-month bar exists only if the notice to creditors is published. If the representative in our Tacoma example publishes first on ${h.day(published)}, claims close on ${h.day(plus(published, months))}, with 30 days after actual notice for known creditors if that ends later. Without publication, creditors have ${h.num(outer)} months after death, which would run to ${h.day(plus(death, outer))}. A family that uses the affidavit instead of probate gets no claims bar at all, which is one reason some Washington estates are opened even when they are small.</p>
<h2>Fees on top of the ${h.usd(filing)}</h2>
<p>RCW 36.18.020 sets the ${h.usd(filing)} paid by whoever starts the probate, and counties may add local surcharges. Publication in a legal newspaper and certified letters testamentary add modest amounts; the will can waive the bond. Across the Columbia River, ${h.a('probate:oregon', 'Oregon')} sets the personal representative's fee by statutory percentage.</p>`,
  faqs: [
    { q: 'What are nonintervention powers in a Washington probate?', a: `Powers granted by the court under chapter 11.68 RCW that let the personal representative administer the estate without further court orders: selling property, paying claims and distributing to heirs. The estate is then closed by filing a declaration of completion that discloses the fees paid. Courts generally grant them when the estate is solvent and the representative is suitable.` },
    { q: 'What is the small estate limit in Washington State?', a: `${usd(limit)} under RCW 11.62.010, counting the decedent's whole probate estate less liens and encumbrances but excluding the surviving spouse's or domestic partner's community share. The successor waits 40 days after death and must confirm no personal representative application is pending. Real estate cannot be collected by this affidavit.` },
    { q: 'How long do creditors have in a Washington probate?', a: `${num(months)} months after the first publication of the notice to creditors, or 30 days after actual notice if later, under RCW 11.40.051. Reasonably ascertainable creditors who never received actual notice, and all creditors when no notice was published, have ${num(outer)} months after death. Publishing early is therefore the usual way to shorten a Washington estate.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:oregon', 'divorce-cost:washington', 'child-support:washington', 'workers-comp:washington'],
});
