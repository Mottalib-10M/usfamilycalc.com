import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, usdx, pct, num } from '../../../lib/kit';

const d = pb('new-york');
const T = pbFeesOf('new-york')!.schedules[0].tiers!;
const amounts = (t: string) => t.match(/\$[\d,]+/g) ?? [];
const fees = amounts(d.filingFee!.text);
const topFee = fees[fees.length - 1];
const topBand = fees[fees.length - 2];
const lowFee = fees[1];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
// Worked example: a Brooklyn estate of $950,000, of which a $350,000 co-op apartment is left by specific bequest.
const total = 950000, coop = 350000;
const base = total - coop;
const ex = pbCalc('new-york', base);
const comm = ex.lines[0].value;
const naive = pbCalc('new-york', total).lines[0].value;
const resumeValue = 400000;
const rv = pbCalc('new-york', resumeValue).lines[0].value;

export default defineStatePage({
  topic: 'probate',
  slug: 'new-york',
  title: `New York Probate Fees 2026: Executor Commission from ${pct(T[0].pct)}`,
  description: `New York probate in 2026: SCPA § 2307 gives an executor ${usd(rv)} on ${usd(resumeValue)} received and paid out, the Surrogate's Court charges up to ${topFee} to file.`,
  intro: `New York pays executors a sliding commission under SCPA § 2307, leaves lawyers to the Surrogate, and asks creditors to come forward within ${num(months)} months of letters.`,
  resume: `New York probate fees have one fixed part and one negotiated part: the executor's commission under SCPA § 2307 is ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} of the next ${usd(T[1].upTo! - T[0].upTo!)}, ${pct(T[2].pct)} of the next ${usd(T[2].upTo! - T[1].upTo!)} and lower beyond, which comes to ${usd(rv)} on ${usd(resumeValue)} received and paid out, while the lawyer's fee is whatever the Surrogate's Court finds reasonable. The court's own filing fee climbs with the gross estate, from ${lowFee} for the smallest to ${topFee} at ${topBand} and above. On timing, creditors are expected to present claims within ${num(months)} months after letters are first issued, and an executor who distributes before then does so at personal risk, so most New York estates stay open at least that long after letters. Counting the months before letters issue, which in New York City Surrogate's Courts can be considerable, and the time to sell real property, even an uncontested estate usually runs well past that point. Personal property of ${usd(limit)} or less can go through voluntary administration instead.`,
  body: (h) => `<h2>Commissions are paid on money that moves</h2>
<p>Section 2307 does not pay the executor on the size of the estate as such. It pays on sums received and paid out, half of the commission for receiving and half for paying, and it leaves specific legacies and devises out of the base. That second rule changes real results. Take a Brooklyn estate worth ${h.usd(total)} in which the will leaves a ${h.usd(coop)} co-op apartment to a named niece. The apartment passes as a specific bequest and earns no commission, so the base is ${h.usd(base)} and the executor's full commission is ${h.usd(comm)}, not the ${h.usd(naive)} the schedule would give on the whole estate. Property the executor receives but never pays out, because it stays in a continuing trust for example, earns only the receiving half, here ${h.usd(comm / 2)} if nothing were distributed.</p>
<p>Commissions are taxable to the executor. A child who is executor and sole heir often waives them, since the same dollars arrive tax-free as an inheritance. When there are several executors on a larger estate, the statute allows more than one commission; the calculator shows a single one.</p>
<h2>The lawyer's fee is the Surrogate's call</h2>
<p>New York has no attorney percentage. Under SCPA § 2110 the Surrogate's Court can fix the attorney's compensation on application, and it looks at the time spent, the difficulty, the amount involved and the results. Any figure of the kind "the attorney charges X percent" is a private agreement, not law, and the court can cut it when a beneficiary objects.</p>
<h2>Voluntary administration and its blind spot</h2>
<p>The small-estate route under SCPA Article 13 is a short filing with the Surrogate's Court that names a voluntary administrator, who then collects and distributes. It covers personal property of ${h.usd(limit)} or less, with property set off to the family excluded, and there is no waiting period after death. Real estate cannot go through it: a house titled in the decedent's name alone sends the family to full probate or administration whatever its value. The ${h.usd(limit)} figure has not been indexed; the latest revision date shown for SCPA § 1301 on the Senate site is late 2019, which is not necessarily when the limit took effect.</p>
<h2>What stretches a New York probate</h2>
<p>Before letters issue, every distributee must be served with citation or sign a waiver, and finding cousins in an intestate estate can take months. Kinship hearings, a will objection filed in the Surrogate's Court, and the sale of a co-op that needs board approval are the classic delays. The ${h.num(months)}-month window under SCPA § 1802 then runs from letters, not from death. ${h.a('probate:maryland', 'Maryland')}, by contrast, counts its claim period from the date of death.</p>`,
  faqs: [
    { q: 'How is a New York executor commission calculated?', a: `On the sums the executor receives and pays out, under SCPA § 2307: ${pct(T[0].pct)} of the first ${usd(T[0].upTo!)}, ${pct(T[1].pct)} of the next ${usd(T[1].upTo! - T[0].upTo!)}, ${pct(T[2].pct)} of the next ${usd(T[2].upTo! - T[1].upTo!)}, ${pct(T[3].pct)} of the next ${usd(T[3].upTo! - T[2].upTo!)} and ${pct(T[4].pct)} above. Specific legacies are excluded. On a ${usd(base)} base the full commission is ${usd(comm)}, half earned on receiving and half on paying out.` },
    { q: 'What is the New York Surrogate’s Court fee to probate a will?', a: `It depends on the gross estate, under SCPA § 2402: ${lowFee} for estates under ${fees[0]}, rising in bands to ${topFee} for estates of ${topBand} or more. Our ${usd(total)} Brooklyn example falls in the top band. Certified copies of letters and other filings cost extra. The calculator does not add this fee automatically because it varies with the value.` },
    { q: 'Can a house go through small estate administration in New York?', a: `No. Voluntary administration under SCPA Article 13 is limited to personal property with a gross value of ${usd(limit)} or less, and real property cannot pass through it. A house in the decedent's sole name requires full probate of the will or letters of administration, even when the bank accounts alone would have qualified for the short procedure.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:maryland', 'divorce-cost:new-york', 'alimony:new-york', 'workers-comp:new-york'],
});
