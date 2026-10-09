import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, usdx, pct, num, day } from '../../../lib/kit';

const d = pb('florida');
const F = pbFeesOf('florida')!;
const prTiers = F.schedules[0].tiers!;
const atty = F.schedules[1].fixed!;
const amounts = (t: string) => t.match(/\$[\d,]+/g) ?? [];
const oldLimit = amounts(d.smallEstate.text)[1];
const summaryFee = amounts(d.filingFee!.text)[1];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const eff = d.smallEstate.effective!;
const formal = d.filingFee!.amount!;
// Worked example: a condo in Sarasota and an IRA-free bank account, $420,000 of probate assets, $9,000 of income during administration.
const assets = 420000, income = 9000;
const ex = pbCalc('florida', assets + income);
const pr = ex.lines[0].value, law = ex.lines[1].value;
const small = pbCalc('florida', 60000);
const mid = 120000;
const midCase = pbCalc('florida', mid);

export default defineStatePage({
  topic: 'probate',
  slug: 'florida',
  title: `Florida Probate 2026: ${pct(prTiers[0].pct)} Commission, ${usd(limit)} Summary Cap`,
  description: `Florida probate 2026: summary administration now reaches ${usd(limit)}, and a ${usd(assets + income)} formal estate presumes ${usd(pr)} each for the executor and the lawyer.`,
  intro: 'Florida presumes a commission for the personal representative and a fee for the lawyer, and on July 1, 2026 it doubled the ceiling for its short court procedure.',
  resume: `Florida probate fees follow two presumptions in the statutes: the personal representative's commission of ${pct(prTiers[0].pct)} on the first ${usd(prTiers[0].upTo!)}, and an attorney fee that starts at ${usd(atty[0].fee!)} for the smallest estates and reaches the same ${pct(atty[3].pct!)} between ${usd(atty[2].upTo!)} and ${usd(atty[3].upTo!)}. On a ${usd(assets + income)} estate that is ${usd(pr)} for each, plus a clerk fee of up to ${usd(formal)} for formal administration. The base is the inventory value of probate assets plus the income they earn while the case is open. As for time, Florida has one of the shortest creditor windows in the country, ${num(months)} months from the first publication of the notice to creditors, so an orderly formal administration can close within months of that deadline once the court has issued letters. Since ${day(eff)}, estates of up to ${usd(limit)} net of exempt property qualify for summary administration, double the earlier ${oldLimit} ceiling, which removes the personal representative and most of the waiting.`,
  body: (h) => `<h2>The July 2026 change: ${oldLimit} becomes ${h.usd(limit)}</h2>
<p>Chapter 2026-57 of the Laws of Florida rewrote section 735.201, and from ${h.day(eff)} summary administration covers an estate whose Florida assets subject to administration, minus exempt property such as household furniture and cars, total ${h.usd(limit)} or less. Protected homestead is not part of the estate subject to administration at all. Florida has no affidavit procedure for bank accounts, so this court order is the main shortcut, and doubling it pulls a large share of modest estates out of formal administration. No personal representative is appointed: the court signs an order distributing the property, and the clerk charges ${summaryFee} instead of up to ${h.usd(formal)}. Creditors are not forgotten, since the petition must show that debts are paid or provided for, and beneficiaries remain liable for valid claims up to the value they receive. The limit is not indexed, so it will stay at ${h.usd(limit)} until the Legislature changes it again.</p>
<h2>Two presumptions, one in disguise</h2>
<p>The fee schedules in sections 733.617 and 733.6171 are presumed reasonable, not mandatory. The lawyer may use the attorney table only after giving the personal representative written disclosures, and the parties can agree on hourly billing instead. A curious feature: from ${h.usd(atty[2].upTo!)} up to ${h.usd(atty[3].upTo!)}, the attorney's ${h.usd(atty[3].fee!)} plus ${h.pct(atty[3].pct!)} of the excess equals exactly ${h.pct(atty[3].pct!)} of the whole estate, the same rate as the personal representative's commission. Take a Sarasota condo and accounts worth ${h.usd(assets)} that earn ${h.usd(income)} during administration: the compensable value is ${h.usd(assets + income)}, and both presumptions give ${h.usd(pr)} and ${h.usd(law)}. At the low end the attorney table is flat, so a ${h.usd(60000)} estate presumes ${h.usd(small.lines[1].value)} for counsel, and a ${h.usd(mid)} one presumes ${h.usd(midCase.lines[1].value)}. Two personal representatives on an estate of ${h.usd(atty[2].upTo!)} or more may each claim a full commission.</p>
<h2>Why a ${h.num(months)}-month window does not mean a ${h.num(months)}-month probate</h2>
<p>The clock starts at first publication of the notice to creditors, not at death, and known creditors served with the notice get 30 days from service if that runs later. Objections to claims then have their own deadlines, and a disputed claim must be resolved or sued on before distribution. Homestead property is the usual delay: a petition to determine homestead status is common and must be decided before a house can pass outside the creditors' reach. The deadline for the final accounting and discharge is set by the Florida Probate Rules, which we did not read, so this page gives no figure for it. North of the line, ${h.a('probate:north-carolina', 'North Carolina')} caps the commission at a flat percentage instead.</p>`,
  faqs: [
    { q: 'What is the summary administration limit in Florida for 2026?', a: `${usd(limit)} for petitions under section 735.201 as amended by chapter 2026-57, effective ${day(eff)}, up from ${oldLimit}. The amount is the Florida estate subject to administration minus exempt property, and protected homestead is not counted either. An estate of any size also qualifies when the decedent has been dead more than two years, unless the will requires formal administration.` },
    { q: 'How much is a Florida personal representative paid?', a: `The commission presumed reasonable is ${pct(prTiers[0].pct)} of the first ${usd(prTiers[0].upTo!)} of probate assets and income, ${pct(prTiers[1].pct)} up to ${usd(prTiers[1].upTo!)}, ${pct(prTiers[2].pct)} up to ${usd(prTiers[2].upTo!)} and ${pct(prTiers[3].pct)} above. A ${usd(assets + income)} estate gives ${usd(pr)}. The court can award more for extraordinary services such as selling real estate or litigation, and the will can set a different amount.` },
    { q: 'Do Florida creditors have only three months to file a claim?', a: `Most do: claims are barred unless filed within ${num(months)} months of the first publication of the notice to creditors, or 30 days after service for creditors who must be served, if later. Section 733.710 then bars every claim two years after death, even when no probate was ever opened. A creditor who was reasonably ascertainable but never served can sometimes file late with court permission.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:north-carolina', 'divorce-cost:florida', 'alimony:florida', 'child-support:florida'],
});
