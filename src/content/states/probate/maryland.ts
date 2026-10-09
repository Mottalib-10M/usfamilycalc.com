import { defineStatePage } from '../../../lib/page-types';
import { pb, pbCalc, pbFeesOf, usd, pct, num } from '../../../lib/kit';

const d = pb('maryland');
const S = pbFeesOf('maryland')!.schedules;
const C = S[0].fixed!;
const R = S[1].fixed!;
const money = (t: string) => (t.match(/\$[\d,]+/g) ?? []).map((x) => Number(x.replace(/[$,]/g, '')));
const spouseLimit = money(d.smallEstate.text)[1];
const months = d.creditorClaims.months!;
const limit = d.smallEstate.limit!;
const cliff = Math.ceil(R[2].upTo!);
// Worked example: two Annapolis estates either side of the Register of Wills cliff.
const below = 490000, above = 510000;
const b = pbCalc('maryland', below), a = pbCalc('maryland', above);
const rv = 300000;
const r = pbCalc('maryland', rv);

export default defineStatePage({
  topic: 'probate',
  slug: 'maryland',
  title: `Maryland Probate 2026: ${pct(C[1].pct!)} Commission Cap, Register Fee`,
  description: `Maryland probate 2026: commissions capped at ${usd(r.lines[0].value)} on a ${usd(rv)} estate, a Register of Wills fee that jumps at ${usd(cliff)}, claims barred after ${num(months)} months.`,
  intro: `Maryland caps the personal representative’s commission, charges a Register of Wills fee that rises in steps, and bars creditors ${num(months)} months after the death.`,
  resume: `Maryland probate fees have a statutory ceiling rather than a fixed amount: the court may allow the personal representative up to ${pct(C[0].pct!)} of the first ${usd(C[0].upTo!)} of property subject to administration and ${usd(C[1].fee!)} plus ${pct(C[1].pct!)} of the excess, which is ${usd(r.lines[0].value)} at most on a ${usd(rv)} estate, and it may not let commissions and the lawyer's fees together exceed a fair total charge. The Register of Wills also collects a probate fee that depends on the value of the estate, ${usd(r.lines[1].value)} at that size. The timeline is driven by a short claims bar and long accounting cycles. Creditors lose their claims ${num(months)} months after the death, or two months after the personal representative mails them a notice if that comes first, but the first account is not due until nine months after appointment and further accounts follow every six months until the final one. The accounting calendar, more than the claims bar, sets the pace of a Maryland estate. Estates of ${usd(limit)} or less, or ${usd(spouseLimit)} when the spouse takes everything, use small estate proceedings.`,
  body: (h) => `<h2>The ${h.usd(cliff)} step in the Register of Wills fee</h2>
<p>Estates and Trusts § 2-206 does not scale the probate fee smoothly. It sets brackets, and the jump at ${h.usd(cliff)} is the sharpest in proportion. Compare two Annapolis estates. At ${h.usd(below)}, the Register of Wills fee is ${h.usd(b.lines[1].value)} and the maximum commission ${h.usd(b.lines[0].value)}. At ${h.usd(above)}, the fee becomes ${h.usd(a.lines[1].value)} while the commission ceiling moves to ${h.usd(a.lines[0].value)}. An extra ${h.usd(above - below)} of estate value costs ${h.usd(a.lines[1].value - b.lines[1].value)} more in court fees. The value is the one shown by the administration accounts, so gains realized during the estate count too. Below ${h.usd(Math.ceil(R[0].upTo!))} there is no fee at all.</p>
<h2>A ceiling for the representative, a ceiling for everyone</h2>
<p>Section 7-601 caps the commission, not guarantees it: the court allows what it considers appropriate within the limit, and a will can authorize more. Section 7-602 then adds the rule that sets Maryland apart. When counsel fees are paid too, the court may not approve a combined charge for administering the estate that is more than fair and reasonable, so a personal representative who relies heavily on a lawyer can expect the commission to shrink. Petitions for counsel fees are filed with the Orphans' Court, which in most counties is the probate court.</p>
<h2>Counting from death</h2>
<p>Like ${h.a('probate:ohio', 'Ohio')}, Maryland counts the main claims period from the date of death, not from the opening of the estate. A personal representative appointed four months after the death has only two months left on that clock, though mailing a notice to a known creditor can shorten that creditor's time further, to two months from the notice.</p>
<h2>Small estates still go through the Register</h2>
<p>Maryland offers no out-of-court affidavit. Small estate administration under § 5-601 is a simplified filing with the Register of Wills, open when the Maryland property subject to administration is worth ${h.usd(limit)} or less after secured debts, or ${h.usd(spouseLimit)} when the surviving spouse is the sole heir or legatee. The thresholds are not indexed, and the statute as read does not show when they took effect.</p>
<h2>Accounts every six months</h2>
<p>The nine-month first account, then six-month accounts, set the rhythm: an estate with a house to sell or a tax return pending rolls from one accounting period to the next. ${h.a('probate:north-carolina', 'North Carolina')} works with a clerk of court instead.</p>`,
  faqs: [
    { q: 'How much can a personal representative charge in Maryland?', a: `At most ${pct(C[0].pct!)} of the first ${usd(C[0].upTo!)} of property subject to administration and ${usd(C[1].fee!)} plus ${pct(C[1].pct!)} of the excess, under Estates and Trusts § 7-601, unless the will allows more. On a ${usd(rv)} estate the ceiling is ${usd(r.lines[0].value)}. The court allows what it finds appropriate, and commissions plus counsel fees must stay within a fair total under § 7-602.` },
    { q: 'What is the Register of Wills probate fee in Maryland?', a: `It depends on the value of the probate estate under § 2-206: nothing under ${usd(Math.ceil(R[0].upTo!))}, ${usd(R[1].fee!)} up to ${usd(Math.ceil(R[1].upTo!))}, ${usd(R[2].fee!)} up to ${usd(cliff)}, then ${usd(R[3].fee!)} up to ${usd(Math.ceil(R[3].upTo!))}, rising to ${usd(R[8].fee!)} plus ${pct(R[8].pct!)} of the excess at the top. A ${usd(above)} estate pays ${usd(a.lines[1].value)}.` },
    { q: 'How long do creditors have to file a claim in Maryland?', a: `${num(months)} months after the date of death, or two months after the personal representative mails or delivers a notice to that creditor, whichever comes earlier, under Estates and Trusts § 8-103. Claims presented later are forever barred. Because the clock starts at death, a late opening of the estate leaves the personal representative less time to sort the valid claims from the rest.` },
  ],
  related: ['probate', 'how-long-does-probate-take', 'probate:north-carolina', 'probate:new-york', 'child-support:maryland', 'workers-comp:maryland'],
});
