import { defineStatePage } from '../../../lib/page-types';
import { cs, csCalc, usd, pct, num, day } from '../../../lib/kit';

const d = cs('maryland');
const S = d.schedule!;
const SH = d.shared!;
const T = SH.thresholdOvernights!;
const M = SH.multiplier!;
type Adj = { overnightsFrom: number; overnightsTo: number; adjustment: number };
const BANDS = (SH as unknown as { table: Adj[] }).table;
const bandEnd = BANDS[BANDS.length - 1].overnightsTo;
const flags = (d as unknown as { extra: { selfSupportReserveFlags: Array<Array<number | boolean>> } }).extra.selfSupportReserveFlags;
const A = 5000, B = 3000;
const share = A / (A + B);
const at = (n: number) => csCalc('maryland', A, B, 2, { payerOvernights: n });
const sole = at(0), atT = at(T), atEnd = at(bandEnd), after = at(bandEnd + 1), wide = at(140);
const raw = (n: number) => {
  const adj = sole.basicMonthly * M;
  const band = BANDS.find((b) => n >= b.overnightsFrom && n <= b.overnightsTo);
  return adj * share * ((365 - n) / 365) * (1 + (band?.adjustment ?? 0)) - adj * (1 - share) * (n / 365);
};
const rawT = raw(T);
const lowA = 900, lowB = 400;
const low = csCalc('maryland', lowA, lowB, 1);
const lowRow = S.rows.find((r) => r[0] >= lowA + lowB)!;
const lowFlag = flags[S.rows.indexOf(lowRow)][1] === true;
const odd = csCalc('maryland', 4010, 2000, 2);
const oddRow = S.rows.find((r) => r[0] >= 6010)!;

export default defineStatePage({
  topic: 'child-support',
  slug: 'maryland',
  title: `Maryland Child Support 2026: The ${num(T)}-Overnight Shared Rule`,
  description: `Maryland child support 2026 under Family Law § 12-204: schedule to ${usd(S.maxIncome)}, shared custody from ${num(T)} overnights with a ${num(M, 1)} multiplier, ${usd(sole.monthly)} for two kids.`,
  intro: 'Family Law § 12-204 applied as written: the next higher row, the asterisked cells and the shared physical custody formula.',
  resume: `In Maryland, a parent with ${usd(A)} of monthly adjusted actual income, next to a co-parent at ${usd(B)}, owes ${usd(sole.monthly)} a month for two children under sole custody, before child care and health insurance. Shared physical custody starts when each parent keeps the children more than a quarter of the year, at least ${num(T)} overnights. From there, the basic obligation is multiplied by ${num(M, 1)} and each parent's share is weighted by the time the children spend with the other one. Between ${num(T)} and ${num(bandEnd)} overnights the statute adds a surcharge of ${pct(BANDS[0].adjustment * 100)} down to ${pct(BANDS[BANDS.length - 1].adjustment * 100)} to the paying parent's side, so in this example the order only starts to fall below the sole amount after the first nights of the range: ${usd(atEnd.monthly)} at ${num(bandEnd)} nights, ${usd(after.monthly)} at ${num(bandEnd + 1)}. The schedule in force since ${day(d.effective!)} runs to ${usd(S.maxIncome)} of combined income.`,
  body: (h) => `<h2>A shared custody line with a soft landing</h2>
<p>Chapter 142 of the 2020 session, in force since October 1, 2020, set the threshold at more than 25% of overnights, at least ${num(T)}, and in the same act added the graduated adjustment of § 12-204(m)(2)(ii). A parent who just crosses the line has his or her theoretical obligation raised by ${BANDS.map((b) => `${pct(b.adjustment * 100)} (${num(b.overnightsFrom)} to ${num(b.overnightsTo)} nights)`).join(', ')}.</p>
<p>The effect shows best with numbers. For the family in the summary, the raw shared formula at ${num(T)} nights gives ${usd(rawT)}, which is more than the sole custody amount of ${usd(sole.monthly)}. Paragraph (m)(5) forbids that, so the order stays at ${usd(atT.monthly)}. The saving appears as the surcharge shrinks and the time grows.</p>
${h.table(['Overnights with the paying parent', 'Surcharge on that parent', 'Monthly support'], [0, T, 100, bandEnd, bandEnd + 1, 140].map((n) => [num(n), pct(((BANDS.find((b) => n >= b.overnightsFrom && n <= b.overnightsTo)?.adjustment) ?? 0) * 100), usd(at(n).monthly)]), `Maryland shared physical custody, ${usd(A)} and ${usd(B)} of monthly income, two children`, ['left', 'right', 'right'])}
<p>At ${num(140)} overnights, the order is ${usd(wide.monthly)}. Shared custody also requires that both parents contribute to the children's expenses beyond the support itself, and the court may base the calculation on the visitation awarded even without joint custody.</p>
<h2>Next higher row, and cells with an asterisk</h2>
<p>Maryland does not interpolate. When combined income falls between two lines of the schedule, § 12-204(c) sends the reader to the next higher amount: ${usd(6010)} of combined income uses the ${usd(oddRow[0])} row, ${usd(odd.basicMonthly)} for two children. At the low end, cells marked with an asterisk already include the self-support reserve, set at 110% of the 2019 federal poverty level for one person. A couple earning ${usd(lowA)} and ${usd(lowB)} with one child reads the ${usd(lowRow[0])} row, ${lowFlag ? 'an asterisked cell' : 'a regular cell'} of ${usd(low.basicMonthly)}, so the paying parent owes ${usd(low.monthly)}.</p>
<p>Since October 2025, a parent may also deduct an allowance for other children living in the home, equal to 75% of the schedule amount on that parent's income alone; this calculator does not ask for those children, so enter income after that allowance. Neighboring ${h.a('child-support:virginia', 'Virginia')} counts days rather than overnights and starts shared custody at a different point.</p>`,
  faqs: [
    { q: `Does reaching ${num(T)} overnights lower Maryland child support right away?`, a: `Not always. At ${num(T)} to ${num(BANDS[0].overnightsTo)} overnights the paying parent's side of the shared formula is raised by ${pct(BANDS[0].adjustment * 100)}, and the result may not exceed the sole custody amount. With ${usd(A)} and ${usd(B)} of income and two children, the order stays at ${usd(atT.monthly)} at ${num(T)} nights and falls to ${usd(after.monthly)} at ${num(bandEnd + 1)}, once the surcharge ends.` },
    { q: 'How does Maryland handle an income between two rows of the schedule?', a: `It rounds up to the next higher row. Section 12-204(c) says the basic obligation is extrapolated to the next higher amount, so ${usd(6010)} of combined monthly income is read on the ${usd(oddRow[0])} line. The schedule steps by ${usd(S.rows[2][0] - S.rows[1][0])}, which keeps the difference small, and above ${usd(S.maxIncome)} the amount is left to the court.` },
    { q: 'What do the asterisks in the Maryland child support schedule mean?', a: `An asterisk marks an amount already reduced by the self-support reserve, which protects a paying parent's income at 110% of the 2019 federal poverty level for one person after support and taxes. The first row, for combined income up to ${usd(S.rows[0][0])}, is asterisked for every number of children and starts at ${usd(S.rows[0][1])} for one child.` },
    { q: 'Does Maryland child support continue past 18 for a high school senior?', a: `Yes. Maryland's age of majority is 18, but a child who is 18 and still enrolled in secondary school keeps the right to support from both parents until graduating, leaving school, marrying, becoming emancipated or turning 19, whichever comes first. The rule sits in General Provisions § 1-401, not in the child support subtitle.` },
  ],
  related: ['child-support', 'how-much-is-child-support', 'child-support:virginia', 'child-support:west-virginia', 'child-support:pennsylvania'],
});
